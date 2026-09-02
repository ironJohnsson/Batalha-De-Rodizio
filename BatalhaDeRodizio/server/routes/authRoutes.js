const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('../auth');

// GET /api/auth/check-nickname/:nickname
router.get('/check-nickname/:nickname', async (req, res) => {
  try {
    const nick = (req.params.nickname || '').trim();
    if (!nick) return res.json({ exists: false });

    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE nickname = ? COLLATE NOCASE',
      args: [nick]
    });
    return res.json({ exists: existing.rows.length > 0 });
  } catch (err) {
    console.error('Erro ao verificar apelido:', err);
    return res.status(500).json({ error: 'Erro ao verificar apelido.' });
  }
});

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

    // Initialize clean stats for the new verified account
    await db.execute({
      sql: 'INSERT INTO user_stats (user_id, total_battles, wins, total_slices, max_slices, avg_slices) VALUES (?, 0, 0, 0, 0, 0.0)',
      args: [userId]
    });

    const user = { id: userId, nickname: cleanNickname };
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      token,
      user,
      stats: {
        total_battles: 0,
        wins: 0,
        total_slices: 0,
        max_slices: 0,
        avg_slices: 0.0
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

// PUT /api/auth/update-nickname
router.put('/update-nickname', authMiddleware, async (req, res) => {
  const { newNickname } = req.body;

  if (!newNickname || typeof newNickname !== 'string' || newNickname.trim().length < 2) {
    return res.status(400).json({ error: 'O novo apelido deve ter pelo menos 2 caracteres.' });
  }

  const clean = newNickname.trim();

  try {
    // Check if newNickname is already taken by someone else
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE nickname = ? COLLATE NOCASE AND id != ?',
      args: [clean, req.user.id]
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Este apelido já está em uso por outro guerreiro de mesa.' });
    }

    // Get current nickname
    const currUser = await db.execute({
      sql: 'SELECT nickname FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const oldNickname = currUser.rows[0]?.nickname;

    // Update users table
    await db.execute({
      sql: 'UPDATE users SET nickname = ? WHERE id = ?',
      args: [clean, req.user.id]
    });

    // Update room_participants table for this user
    await db.execute({
      sql: 'UPDATE room_participants SET nickname = ? WHERE user_id = ?',
      args: [clean, req.user.id]
    });

    // If user was recorded as winner in past rooms, update winner_nickname
    if (oldNickname) {
      await db.execute({
        sql: 'UPDATE rooms SET winner_nickname = ? WHERE winner_nickname = ? COLLATE NOCASE',
        args: [clean, oldNickname]
      });
    }

    const updatedUser = { id: req.user.id, nickname: clean };
    const token = generateToken(updatedUser);

    return res.json({
      message: 'Apelido atualizado com sucesso!',
      user: updatedUser,
      token
    });
  } catch (err) {
    console.error('Erro ao atualizar apelido:', err);
    return res.status(500).json({ error: 'Erro ao atualizar apelido.' });
  }
});

module.exports = router;
