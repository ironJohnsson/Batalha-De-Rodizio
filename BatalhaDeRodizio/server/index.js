const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDb } = require('./db');
const authRoutes = require('./routes/authRoutes');
const statsRoutes = require('./routes/statsRoutes');
const roomsManager = require('./roomsManager');

const app = express();
const server = http.createServer(app);

// Enable CORS for all devices on local network & web
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/stats/active-rooms', (req, res) => {
  res.json({ rooms: roomsManager.listActiveRooms() });
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Conectado: ${socket.id}`);

  // List Active Rooms
  socket.on('rooms:get_active', (callback) => {
    if (typeof callback === 'function') {
      callback({ rooms: roomsManager.listActiveRooms() });
    }
  });

  // Create Room
  socket.on('room:create', async ({ name, hostUserId, hostNickname, password }, callback) => {
    try {
      const room = await roomsManager.createRoom({
        name,
        hostUserId,
        hostNickname: hostNickname || 'Anfitrião',
        hostSocketId: socket.id,
        password
      });
      socket.join(room.code);
      console.log(`[Sala Criada] Código: ${room.code} por ${hostNickname}`);
      io.emit('rooms:updated_list', roomsManager.listActiveRooms());
      if (typeof callback === 'function') callback({ success: true, room });
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Não foi possível criar a sala.' });
    }
  });

  // Join Room
  socket.on('room:join', async ({ code, userId, nickname, roomPassword }, callback) => {
    try {
      if (!code || !nickname) {
        if (typeof callback === 'function') callback({ success: false, error: 'Código e apelido são obrigatórios.' });
        return;
      }

      const result = await roomsManager.joinRoom({
        code,
        socketId: socket.id,
        userId: userId || null,
        nickname: nickname.trim(),
        roomPassword
      });

      if (result.error) {
        if (typeof callback === 'function') {
          callback({ 
            success: false, 
            error: result.error,
            requiresPassword: result.requiresPassword 
          });
        }
        return;
      }

      const room = result.room;
      socket.join(room.code);
      console.log(`[Participante Entrou] ${nickname} entrou na sala ${room.code}`);

      // Broadcast update to all in the room
      io.to(room.code).emit('room:updated', room);
      io.emit('rooms:updated_list', roomsManager.listActiveRooms());

      if (typeof callback === 'function') callback({ success: true, room });
    } catch (err) {
      console.error('Erro ao entrar na sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erro ao entrar na sala.' });
    }
  });

  // Increment or Decrement Slices
  socket.on('room:slice', ({ code, delta }, callback) => {
    try {
      const result = roomsManager.updateSlices({
        code,
        socketId: socket.id,
        delta: Number(delta) || 1
      });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      io.to(code).emit('room:updated', result.room);
      if (typeof callback === 'function') callback({ success: true, room: result.room });
    } catch (err) {
      console.error('Erro ao atualizar fatias:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erro ao registrar fatia.' });
    }
  });

  // Finish Room (Only Host allowed)
  socket.on('room:finish', async ({ code, userId }, callback) => {
    try {
      const result = await roomsManager.finishRoom({
        code,
        socketId: socket.id,
        requesterUserId: userId || null
      });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      console.log(`[Sala Finalizada] Sala ${code} finalizada por anfitrião.`);
      io.to(code).emit('room:finished', result.room);
      io.to(code).emit('room:updated', result.room);
      io.emit('rooms:updated_list', roomsManager.listActiveRooms());

      if (typeof callback === 'function') callback({ success: true, room: result.room });
    } catch (err) {
      console.error('Erro ao finalizar sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erro ao finalizar rodada.' });
    }
  });

  // Leave Room
  socket.on('room:leave', async ({ code }, callback) => {
    try {
      const result = await roomsManager.leaveRoom({ code, socketId: socket.id });
      if (result) {
        socket.leave(result.code);
        if (result.roomClosed) {
          io.to(result.code).emit('room:closed', { message: 'A sala foi encerrada pois todos os participantes saíram.' });
        } else {
          io.to(result.code).emit('room:updated', result.room);
        }
        io.emit('rooms:updated_list', roomsManager.listActiveRooms());
      }
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error('Erro ao sair da sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erro ao sair da sala.' });
    }
  });

  socket.on('disconnect', async () => {
    console.log(`[Socket] Desconectado: ${socket.id}`);
    try {
      const result = await roomsManager.leaveRoom({ socketId: socket.id });
      if (result) {
        if (result.roomClosed) {
          io.to(result.code).emit('room:closed', { message: 'A sala foi encerrada pois todos os participantes saíram.' });
        } else {
          io.to(result.code).emit('room:updated', result.room);
        }
        io.emit('rooms:updated_list', roomsManager.listActiveRooms());
      }
    } catch (err) {
      console.error('Erro ao processar desconexão:', err);
    }
  });
});

// SPA Fallback: rotas desconhecidas entregam o index.html do React (compatível com Express 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexFile = path.join(distPath, 'index.html');
    return res.sendFile(indexFile, (err) => {
      if (err) next();
    });
  }
  next();
});

const PORT = process.env.PORT || 4000;

// Initialize database tables then start listening
initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor ContaRodizio rodando na porta ${PORT} (0.0.0.0:${PORT})`);
  });
}).catch(err => {
  console.error('Falha ao iniciar banco de dados:', err);
});
