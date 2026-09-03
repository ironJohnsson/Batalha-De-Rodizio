const { db } = require('./db');

// In-memory active rooms state for ultra-fast synchronization
const activeRooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ROD-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createRoom({ name, hostUserId, hostNickname, hostSocketId, password, type }) {
  let code = generateRoomCode();
  while (activeRooms.has(code)) {
    code = generateRoomCode();
  }

  const roomName = name && name.trim() ? name.trim() : `Mesa ${code}`;
  const roomPass = password && password.trim() ? password.trim() : null;
  const roomType = type && typeof type === 'string' ? type.toLowerCase().trim() : 'pizza';

  const roomData = {
    code,
    name: roomName,
    type: roomType,
    password: roomPass,
    hostSocketId,
    hostUserId: hostUserId || null,
    hostNickname: hostNickname || 'Anfitrião',
    status: 'active',
    winnerNickname: null,
    createdAt: new Date().toISOString(),
    participants: new Map(),
    logs: [
      {
        id: Date.now(),
        text: `Sala criada por ${hostNickname || 'Anfitrião'}. Que vença o mais faminto!`,
        type: 'system',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  };

  // Host joins as first participant
  roomData.participants.set(hostSocketId, {
    socketId: hostSocketId,
    userId: hostUserId || null,
    nickname: hostNickname || 'Anfitrião',
    slices: 0,
    joinedAt: new Date().toISOString()
  });

  activeRooms.set(code, roomData);

  // Save room stub to DB
  try {
    await db.execute({
      sql: `INSERT INTO rooms (code, name, host_user_id, type, password, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
      args: [code, roomName, hostUserId || null, roomType, roomPass]
    });
  } catch (err) {
    console.error('Erro ao salvar sala no banco:', err.message);
  }

  return formatRoomPayload(roomData);
}

function listActiveRooms() {
  return Array.from(activeRooms.values())
    .filter(room => room.status === 'active')
    .map(room => ({
      code: room.code,
      name: room.name,
      type: room.type || 'pizza',
      hostNickname: room.hostNickname,
      hasPassword: Boolean(room.password),
      participantsCount: room.participants.size,
      createdAt: room.createdAt
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function joinRoom({ code, socketId, userId, nickname, roomPassword }) {
  const formattedCode = code.toUpperCase().trim();
  const room = activeRooms.get(formattedCode);

  if (!room) {
    return { error: 'Sala não encontrada ou já encerrada.' };
  }

  if (room.status !== 'active') {
    return { error: 'Esta competição já foi finalizada.' };
  }

  // Room Password Check: if room is password protected and user is not host
  if (room.password) {
    const isHost = (userId && room.hostUserId === userId) || (room.hostSocketId === socketId);
    if (!isHost) {
      if (!roomPassword || roomPassword.trim() !== room.password) {
        return { 
          error: 'Senha da sala incorreta ou não fornecida.',
          requiresPassword: true 
        };
      }
    }
  }

  const cleanNickname = nickname.trim();

  // ANTI-IMPERSONATION: If user is not authenticated, verify nickname is not registered to an existing account
  if (!userId) {
    try {
      const existingUser = await db.execute({
        sql: 'SELECT id FROM users WHERE nickname = ? COLLATE NOCASE',
        args: [cleanNickname]
      });
      if (existingUser.rows.length > 0) {
        return {
          error: `O apelido "${cleanNickname}" pertence a uma conta registrada. Faça login com sua senha para jogar com ele, ou escolha outro apelido como visitante.`
        };
      }
    } catch (err) {
      console.error('Erro ao validar nickname em joinRoom:', err);
    }
  }

  // Check if participant with same nickname exists in this room (reconnection)
  let existingEntry = null;
  for (const [sId, p] of room.participants.entries()) {
    if ((userId && p.userId === userId) || p.nickname.toLowerCase() === cleanNickname.toLowerCase()) {
      existingEntry = { oldSocketId: sId, participant: p };
      break;
    }
  }

  if (existingEntry) {
    room.participants.delete(existingEntry.oldSocketId);
    room.participants.set(socketId, {
      ...existingEntry.participant,
      socketId,
      nickname: cleanNickname,
      userId: userId || existingEntry.participant.userId
    });

    if (room.hostSocketId === existingEntry.oldSocketId || (userId && room.hostUserId === userId)) {
      room.hostSocketId = socketId;
    }
  } else {
    room.participants.set(socketId, {
      socketId,
      userId: userId || null,
      nickname: cleanNickname,
      slices: 0,
      joinedAt: new Date().toISOString()
    });

    room.logs.unshift({
      id: Date.now(),
      text: `${cleanNickname} entrou na mesa!`,
      type: 'join',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    });
  }

  return { room: formatRoomPayload(room) };
}

function updateSlices({ code, socketId, delta }) {
  const room = activeRooms.get(code);
  if (!room) return { error: 'Sala não encontrada.' };
  if (room.status !== 'active') return { error: 'A rodada já está encerrada.' };

  const participant = room.participants.get(socketId);
  if (!participant) return { error: 'Participante não encontrado na sala.' };

  const oldSlices = participant.slices;
  const newSlices = Math.max(0, oldSlices + delta);
  if (newSlices === oldSlices) {
    return { room: formatRoomPayload(room) };
  }

  participant.slices = newSlices;

  let logText = '';
  if (delta > 0) {
    logText = `${participant.nickname} mandou pra dentro a fatia nº ${newSlices}!`;
  } else {
    logText = `${participant.nickname} desfez 1 fatia (Total: ${newSlices}).`;
  }

  room.logs.unshift({
    id: Date.now(),
    text: logText,
    type: delta > 0 ? 'slice_add' : 'slice_sub',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  if (room.logs.length > 30) {
    room.logs.pop();
  }

  return { room: formatRoomPayload(room) };
}

async function finishRoom({ code, socketId, requesterUserId }) {
  const room = activeRooms.get(code);
  if (!room) return { error: 'Sala não encontrada.' };
  if (room.status === 'finished') return { error: 'A competição já foi encerrada.' };

  // STRICT REQUIREMENT: Only the room host can finish the competition!
  const isHostBySocket = room.hostSocketId === socketId;
  const isHostByUser = requesterUserId && room.hostUserId && requesterUserId === room.hostUserId;

  if (!isHostBySocket && !isHostByUser) {
    return { error: 'Apenas o criador/dono da sala tem permissão para finalizar a competição.' };
  }

  const participantsList = Array.from(room.participants.values()).sort((a, b) => b.slices - a.slices);
  const maxSlices = participantsList.length > 0 ? participantsList[0].slices : 0;
  const topScorers = participantsList.filter(p => p.slices === maxSlices && maxSlices > 0);

  let winnerName = 'Nenhum';
  if (topScorers.length === 1) {
    winnerName = topScorers[0].nickname;
  } else if (topScorers.length > 1) {
    winnerName = topScorers.map(p => p.nickname).join(' & ') + ' (Empate)';
  }

  room.status = 'finished';
  room.winnerNickname = winnerName;
  room.finishedAt = new Date().toISOString();

  room.logs.unshift({
    id: Date.now(),
    text: `Competição finalizada! Campeão: ${winnerName} com ${maxSlices} fatias!`,
    type: 'finish',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  // Persist final data to SQLite / Turso & update user stats ONLY for authenticated accounts
  try {
    await db.execute({
      sql: `UPDATE rooms SET status = 'finished', winner_nickname = ?, finished_at = CURRENT_TIMESTAMP WHERE code = ?`,
      args: [winnerName, code]
    });

    for (const p of participantsList) {
      await db.execute({
        sql: `INSERT INTO room_participants (room_code, user_id, nickname, slice_count) VALUES (?, ?, ?, ?)`,
        args: [code, p.userId || null, p.nickname, p.slices]
      });

      // STRICT INTEGRITY: Only update lifetime stats if participant is logged into their verified account
      if (p.userId) {
        const isWinner = topScorers.some(winner => winner.userId === p.userId) ? 1 : 0;
        await db.execute({
          sql: `INSERT INTO user_stats (user_id, total_battles, wins, total_slices, max_slices, avg_slices)
          VALUES (?, 1, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            total_battles = total_battles + 1,
            wins = wins + excluded.wins,
            total_slices = total_slices + excluded.total_slices,
            max_slices = MAX(max_slices, excluded.max_slices),
            avg_slices = ROUND(CAST(total_slices + excluded.total_slices AS REAL) / (total_battles + 1), 1)`,
          args: [p.userId, isWinner, p.slices, p.slices, p.slices]
        });
      }
    }
  } catch (err) {
    console.error('Erro ao persistir encerramento da sala no banco:', err);
  }

  return { room: formatRoomPayload(room) };
}

function getRoom(code) {
  const room = activeRooms.get(code.toUpperCase().trim());
  if (!room) return null;
  return formatRoomPayload(room);
}

function handleDisconnect(socketId) {
  for (const [code, room] of activeRooms.entries()) {
    if (room.participants.has(socketId)) {
      const p = room.participants.get(socketId);
      return { code, nickname: p.nickname, room: formatRoomPayload(room) };
    }
  }
  return null;
}

function formatRoomPayload(room) {
  const participants = Array.from(room.participants.values())
    .map(p => ({
      socketId: p.socketId,
      userId: p.userId,
      nickname: p.nickname,
      slices: p.slices,
      joinedAt: p.joinedAt
    }))
    .sort((a, b) => b.slices - a.slices);

  return {
    code: room.code,
    name: room.name,
    type: room.type || 'pizza',
    hasPassword: Boolean(room.password),
    hostSocketId: room.hostSocketId,
    hostUserId: room.hostUserId,
    hostNickname: room.hostNickname,
    status: room.status,
    winnerNickname: room.winnerNickname,
    createdAt: room.createdAt,
    finishedAt: room.finishedAt,
    participants,
    logs: room.logs
  };
}

async function leaveRoom({ code, socketId }) {
  let targetCode = code ? code.toUpperCase().trim() : null;
  let room = targetCode ? activeRooms.get(targetCode) : null;

  if (!room) {
    for (const [rCode, r] of activeRooms.entries()) {
      if (r.participants.has(socketId)) {
        targetCode = rCode;
        room = r;
        break;
      }
    }
  }

  if (!room || !targetCode) return null;

  const participant = room.participants.get(socketId);
  if (!participant) return null;

  const leavingNick = participant.nickname;
  room.participants.delete(socketId);

  // If room is now empty, delete room
  if (room.participants.size === 0) {
    activeRooms.delete(targetCode);
    console.log(`[Sala Encerrada] Todos saíram da sala ${targetCode}. Removida das ativas.`);
    try {
      await db.execute({
        sql: `UPDATE rooms SET status = 'closed', finished_at = CURRENT_TIMESTAMP WHERE code = ? AND status = 'active'`,
        args: [targetCode]
      });
    } catch (e) {
      console.error('Erro ao fechar sala vazia no banco:', e);
    }
    return {
      code: targetCode,
      roomClosed: true,
      nickname: leavingNick
    };
  }

  // If host left, pass host to the next participant
  let newHost = null;
  if (room.hostSocketId === socketId) {
    const nextParticipant = room.participants.values().next().value;
    room.hostSocketId = nextParticipant.socketId;
    room.hostNickname = nextParticipant.nickname;
    room.hostUserId = nextParticipant.userId;
    newHost = nextParticipant.nickname;
  }

  room.logs.unshift({
    id: Date.now(),
    text: newHost 
      ? `${leavingNick} saiu da mesa. Novo anfitrião: ${newHost}!` 
      : `${leavingNick} saiu da mesa.`,
    type: 'system',
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });

  return {
    code: targetCode,
    roomClosed: false,
    room: formatRoomPayload(room),
    nickname: leavingNick
  };
}

function getRoomInfo(code) {
  if (!code) return null;
  const room = activeRooms.get(code.toUpperCase().trim());
  if (!room) return null;
  return {
    code: room.code,
    name: room.name,
    type: room.type || 'pizza',
    hasPassword: Boolean(room.password),
    hostNickname: room.hostNickname,
    participantsCount: room.participants.size,
    status: room.status
  };
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  listActiveRooms,
  updateSlices,
  finishRoom,
  getRoom,
  getRoomInfo,
  handleDisconnect
};
