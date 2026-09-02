const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// Serve frontend build in production
const distPath = path.join(__dirname, '../BatalhaDeRodizio/dist');
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

  // Create Room
  socket.on('room:create', ({ name, hostUserId, hostNickname }, callback) => {
    try {
      const room = roomsManager.createRoom({
        name,
        hostUserId,
        hostNickname: hostNickname || 'Anfitrião',
        hostSocketId: socket.id
      });
      socket.join(room.code);
      console.log(`[Sala Criada] Código: ${room.code} por ${hostNickname}`);
      if (typeof callback === 'function') callback({ success: true, room });
    } catch (err) {
      console.error('Erro ao criar sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Não foi possível criar a sala.' });
    }
  });

  // Join Room
  socket.on('room:join', ({ code, userId, nickname }, callback) => {
    try {
      if (!code || !nickname) {
        if (typeof callback === 'function') callback({ success: false, error: 'Código e apelido são obrigatórios.' });
        return;
      }

      const result = roomsManager.joinRoom({
        code,
        socketId: socket.id,
        userId: userId || null,
        nickname: nickname.trim()
      });

      if (result.error) {
        if (typeof callback === 'function') callback({ success: false, error: result.error });
        return;
      }

      const room = result.room;
      socket.join(room.code);
      console.log(`[Participante Entrou] ${nickname} entrou na sala ${room.code}`);

      // Broadcast update to all in the room
      io.to(room.code).emit('room:updated', room);

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
  socket.on('room:finish', ({ code, userId }, callback) => {
    try {
      const result = roomsManager.finishRoom({
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

      if (typeof callback === 'function') callback({ success: true, room: result.room });
    } catch (err) {
      console.error('Erro ao finalizar sala:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erro ao finalizar rodada.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Desconectado: ${socket.id}`);
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ContaRodizio rodando na porta ${PORT} (0.0.0.0:${PORT})`);
});
