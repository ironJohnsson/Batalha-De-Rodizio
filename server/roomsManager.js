const db = require('./db');

// In-memory active rooms state for ultra-fast synchronization
// Structure: Map<roomCode, { code, name, hostSocketId, hostUserId, hostNickname, status, participants: Map<socketId, { socketId, userId, nickname, slices, joinedAt }>, logs: [] }>
const activeRooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ROD-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function createRoom({ name, hostUserId, hostNickname, hostSocketId }) {
  let code = generateRoomCode();
  while (activeRooms.has(code)) {
    code = generateRoomCode();
  }

  const roomName = name && name.trim() ? name.trim() : `Mesa ${code}`;

  const roomData = {
    code,
    name: roomName,
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
    const stmt = db.prepare(`
      INSERT INTO rooms (code, name, host_user_id, status, created_at)
      VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP)
    `);
    stmt.run(code, roomName, hostUserId || null);
  } catch (err) {
    console.error('Erro ao salvar sala no banco:', err.message);
  }

  return formatRoomPayload(roomData);
}

function joinRoom({ code, socketId, userId, nickname }) {
  const formattedCode = code.toUpperCase().trim();
  const room = activeRooms.get(formattedCode);

  if (!room) {
    return { error: 'Sala não encontrada ou já encerrada.' };
  }

  if (room.status !== 'active') {
    return { error: 'Esta competição já foi finalizada.' };
  }

  // Check if participant with same nickname exists in this room (reconnection or rename)
  let existingEntry = null;
  for (const [sId, p] of room.participants.entries()) {
    if ((userId && p.userId === userId) || p.nickname.toLowerCase() === nickname.toLowerCase()) {
      existingEntry = { oldSocketId: sId, participant: p };
      break;
    }
  }

  if (existingEntry) {
    // Reconnection of existing participant with updated socket ID
    room.participants.delete(existingEntry.oldSocketId);
    room.participants.set(socketId, {
      ...existingEntry.participant,
      socketId,
      nickname: nickname || existingEntry.participant.nickname,
      userId: userId || existingEntry.participant.userId
    });

    // If this was the host, update hostSocketId
    if (room.hostSocketId === existingEntry.oldSocketId || (userId && room.hostUserId === userId)) {
      room.hostSocketId = socketId;
    }
  } else {
    // New participant joining
    room.participants.set(socketId, {
      socketId,
      userId: userId || null,
      nickname: nickname.trim(),
      slices: 0,
      joinedAt: new Date().toISOString()
    });

    room.logs.unshift({
      id: Date.now(),
      text: `${nickname} entrou na mesa!`,
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

  // Log activity
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

  // Keep logs at max 30 items
  if (room.logs.length > 30) {
    room.logs.pop();
  }

  return { room: formatRoomPayload(room) };
}

function finishRoom({ code, socketId, requesterUserId }) {
  const room = activeRooms.get(code);
  if (!room) return { error: 'Sala não encontrada.' };
  if (room.status === 'finished') return { error: 'A competição já foi encerrada.' };

  // STRICT REQUIREMENT: Only the room host can finish the competition!
  const isHostBySocket = room.hostSocketId === socketId;
  const isHostByUser = requesterUserId && room.hostUserId && requesterUserId === room.hostUserId;

  if (!isHostBySocket && !isHostByUser) {
    return { error: 'Apenas o criador/dono da sala tem permissão para finalizar a competição.' };
  }

  // Determine ranking and winner(s)
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

  // Persist final data to SQLite & update user stats
  try {
    const updateRoomStmt = db.prepare(`
      UPDATE rooms
      SET status = 'finished', winner_nickname = ?, finished_at = CURRENT_TIMESTAMP
      WHERE code = ?
    `);
    updateRoomStmt.run(winnerName, code);

    const insertParticipantStmt = db.prepare(`
      INSERT INTO room_participants (room_code, user_id, nickname, slice_count)
      VALUES (?, ?, ?, ?)
    `);

    const updateStatsStmt = db.prepare(`
      INSERT INTO user_stats (user_id, total_battles, wins, total_slices, max_slices, avg_slices)
      VALUES (?, 1, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        total_battles = total_battles + 1,
        wins = wins + excluded.wins,
        total_slices = total_slices + excluded.total_slices,
        max_slices = MAX(max_slices, excluded.max_slices),
        avg_slices = ROUND(CAST(total_slices + excluded.total_slices AS REAL) / (total_battles + 1), 1)
    `);

    const transaction = db.transaction(() => {
      for (const p of participantsList) {
        // Resolve target user ID either from session or by registered nickname
        let targetUserId = p.userId;
        if (!targetUserId) {
          const userRec = db.prepare('SELECT id FROM users WHERE nickname = ? COLLATE NOCASE').get(p.nickname);
          if (userRec) {
            targetUserId = userRec.id;
          }
        }

        insertParticipantStmt.run(code, targetUserId || null, p.nickname, p.slices);

        // If participant is a registered user (or matched by nickname), update lifetime stats
        if (targetUserId) {
          const isWinner = topScorers.some(winner => winner.nickname.toLowerCase() === p.nickname.toLowerCase()) ? 1 : 0;
          updateStatsStmt.run(
            targetUserId,
            isWinner,
            p.slices,
            p.slices,
            p.slices
          );
        }
      }
    });

    transaction();
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
  // Find which room this socket is in
  for (const [code, room] of activeRooms.entries()) {
    if (room.participants.has(socketId)) {
      const p = room.participants.get(socketId);
      // We do not immediately remove participant so their slice count remains visible on the board,
      // but we can log that they got disconnected
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

module.exports = {
  createRoom,
  joinRoom,
  updateSlices,
  finishRoom,
  getRoom,
  handleDisconnect
};

