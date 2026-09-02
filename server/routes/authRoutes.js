const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('../auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
    return res.status(400).json({ error: 'O apelido deve ter pelo menos 2 caracteres.' });
  }

  if (!password || typeof password !== 'string' || password.length < 3) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 3 caracteres.' });
  }

  const cleanNickname = nickname.trim();

  try {
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE nickname = ? COLLATE NOCASE',
      args: [cleanNickname]
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este apelido já está em uso. Escolha outro ou faça login.' });
    }

    const password_hash = hashPassword(password);
    const insertUser = await db.execute({
      sql: 'INSERT INTO users (nickname, password_hash) VALUES (?, ?)',
      args: [cleanNickname, password_hash]
    });
    const userId = Number(insertUser.lastInsertRowid);

    // Check if this nickname has past games or wins played before registering
    const pastStatsRes = await db.execute({
      sql: `SELECT 
        COUNT(*) as total_battles,
        COALESCE(SUM(slice_count), 0) as total_slices,
        COALESCE(MAX(slice_count), 0) as max_slices
      FROM room_participants
      WHERE nickname = ? COLLATE NOCASE`,
      args: [cleanNickname]
    });
    const pastStats = pastStatsRes.rows[0] || {};

    const pastWinsRes = await db.execute({
      sql: `SELECT COUNT(*) as wins
      FROM rooms
      WHERE winner_nickname = ? COLLATE NOCASE AND status = 'finished'`,
      args: [cleanNickname]
    });
    const pastWins = pastWinsRes.rows[0] || {};

    const totalBattles = Number(pastStats.total_battles) || 0;
    const wins = Number(pastWins.wins) || 0;
    const totalSlices = Number(pastStats.total_slices) || 0;
    const maxSlices = Number(pastStats.max_slices) || 0;
    const avgSlices = totalBattles > 0 ? Number((totalSlices / totalBattles).toFixed(1)) : 0.0;

    // Link past room records to this newly registered user_id
    await db.execute({
      sql: 'UPDATE room_participants SET user_id = ? WHERE nickname = ? COLLATE NOCASE',
      args: [userId, cleanNickname]
    });

    // Initialize stats with past achievements included!
    await db.execute({
      sql: 'INSERT INTO user_stats (user_id, total_battles, wins, total_slices, max_slices, avg_slices) VALUES (?, ?, ?, ?, ?, ?)',
      args: [userId, totalBattles, wins, totalSlices, maxSlices, avgSlices]
    });

    const user = { id: userId, nickname: cleanNickname };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user,
      stats: {
        total_battles: totalBattles,
        wins,
        total_slices: totalSlices,
        max_slices: maxSlices,
        avg_slices: avgSlices
      }
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: 'Informe o apelido e a senha.' });
  }

  try {
    const userRes = await db.execute({
      sql: 'SELECT * FROM users WHERE nickname = ? COLLATE NOCASE',
      args: [nickname.trim()]
    });
    const user = userRes.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    const validPassword = comparePassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    const statsRes = await db.execute({
      sql: 'SELECT * FROM user_stats WHERE user_id = ?',
      args: [user.id]
    });
    const stats = statsRes.rows[0] || {
      total_battles: 0,
      wins: 0,
      total_slices: 0,
      max_slices: 0,
      avg_slices: 0.0
    };

    const token = generateToken(user);

    return res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        nickname: user.nickname
      },
      stats
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userRes = await db.execute({
      sql: 'SELECT id, nickname, created_at FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const statsRes = await db.execute({
      sql: 'SELECT * FROM user_stats WHERE user_id = ?',
      args: [user.id]
    });
    const stats = statsRes.rows[0] || {
      total_battles: 0,
      wins: 0,
      total_slices: 0,
      max_slices: 0,
      avg_slices: 0.0
    };

    let title = 'Iniciante no Rodízio';
    if (stats.max_slices >= 25 || stats.total_slices >= 100) {
      title = 'Lenda Suprema do Rodízio';
    } else if (stats.max_slices >= 18 || stats.total_slices >= 50) {
      title = 'Destruidor de Buffet';
    } else if (stats.max_slices >= 12 || stats.avg_slices >= 10) {
      title = 'Comilão de Elite';
    } else if (stats.total_battles >= 3) {
      title = 'Veterano de Mesa';
    }

    return res.json({
      user,
      stats: {
        ...stats,
        title
      }
    });
  } catch (err) {
    console.error('Erro em /me:', err);
    return res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
});

module.exports = router;
