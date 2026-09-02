const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('../auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || typeof nickname !== 'string' || nickname.trim().length < 2) {
    return res.status(400).json({ error: 'O apelido deve ter pelo menos 2 caracteres.' });
  }

  if (!password || typeof password !== 'string' || password.length < 3) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 3 caracteres.' });
  }

  const cleanNickname = nickname.trim();

  try {
    const existing = db.prepare('SELECT id FROM users WHERE nickname = ? COLLATE NOCASE').get(cleanNickname);
    if (existing) {
      return res.status(409).json({ error: 'Este apelido já está em uso. Escolha outro ou faça login.' });
    }

    const password_hash = hashPassword(password);
    const insertUser = db.prepare('INSERT INTO users (nickname, password_hash) VALUES (?, ?)');
    const result = insertUser.run(cleanNickname, password_hash);
    const userId = result.lastInsertRowid;

    // Initialize stats
    const initStats = db.prepare(`
      INSERT INTO user_stats (user_id, total_battles, wins, total_slices, max_slices, avg_slices)
      VALUES (?, 0, 0, 0, 0, 0.0)
    `);
    initStats.run(userId);

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
router.post('/login', (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ error: 'Informe o apelido e a senha.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE nickname = ? COLLATE NOCASE').get(nickname.trim());
    if (!user) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    const validPassword = comparePassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Apelido ou senha incorretos.' });
    }

    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(user.id) || {
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
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT id, nickname, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(user.id) || {
      total_battles: 0,
      wins: 0,
      total_slices: 0,
      max_slices: 0,
      avg_slices: 0.0
    };

    // Calculate fun rank/title based on avg_slices and total_slices (strictly no emojis!)
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

