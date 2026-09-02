const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

// GET /api/stats/leaderboard - Top rankings across all rooms & users
router.get('/leaderboard', async (req, res) => {
  try {
    // 1. Get all room winners (both registered users and guest champions)
    const winnersRes = await db.execute(`
      SELECT 
        r.winner_nickname as nickname,
        COUNT(r.code) as wins,
        COALESCE(s.total_battles, COUNT(r.code)) as total_battles,
        COALESCE(s.total_slices, (SELECT COALESCE(SUM(rp.slice_count), 0) FROM room_participants rp WHERE rp.nickname = r.winner_nickname COLLATE NOCASE)) as total_slices,
        COALESCE(s.avg_slices, ROUND(CAST((SELECT COALESCE(SUM(rp.slice_count), 0) FROM room_participants rp WHERE rp.nickname = r.winner_nickname COLLATE NOCASE) AS REAL) / COUNT(r.code), 1)) as avg_slices,
        CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as is_registered
      FROM rooms r
      LEFT JOIN users u ON u.nickname = r.winner_nickname COLLATE NOCASE
      LEFT JOIN user_stats s ON s.user_id = u.id
      WHERE r.status = 'finished' AND r.winner_nickname IS NOT NULL AND r.winner_nickname != 'Nenhum'
      GROUP BY r.winner_nickname
      ORDER BY wins DESC, total_slices DESC
      LIMIT 10
    `);

    // 2. Also include any registered users who played games even if 0 wins
    const regRes = await db.execute(`
      SELECT 
        u.nickname,
        s.wins,
        s.total_battles,
        s.total_slices,
        s.avg_slices,
        1 as is_registered
      FROM user_stats s
      JOIN users u ON s.user_id = u.id
      WHERE s.total_battles > 0
    `);

    const map = new Map();
    for (const w of winnersRes.rows) {
      map.set(w.nickname.toLowerCase(), w);
    }
    for (const r of regRes.rows) {
      if (!map.has(r.nickname.toLowerCase())) {
        map.set(r.nickname.toLowerCase(), r);
      } else {
        const existing = map.get(r.nickname.toLowerCase());
        map.set(r.nickname.toLowerCase(), { ...existing, ...r, is_registered: 1 });
      }
    }

    const topWins = Array.from(map.values())
      .sort((a, b) => b.wins - a.wins || b.total_slices - a.total_slices)
      .slice(0, 10);

    return res.json({ topWins, topSlices: [] });
  } catch (err) {
    console.error('Erro no leaderboard:', err);
    return res.status(500).json({ error: 'Erro ao buscar ranking global.' });
  }
});

// GET /api/stats/history - Match history for the logged-in user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const histRes = await db.execute({
      sql: `SELECT 
        r.code,
        r.name as room_name,
        r.winner_nickname,
        r.finished_at,
        rp.slice_count,
        (SELECT COUNT(*) FROM room_participants WHERE room_code = r.code) as total_players
      FROM room_participants rp
      JOIN rooms r ON rp.room_code = r.code
      WHERE (rp.user_id = ? OR rp.nickname = ? COLLATE NOCASE) AND r.status = 'finished'
      ORDER BY r.finished_at DESC
      LIMIT 20`,
      args: [req.user.id, req.user.nickname]
    });

    return res.json({ history: histRes.rows });
  } catch (err) {
    console.error('Erro no histórico:', err);
    return res.status(500).json({ error: 'Erro ao buscar histórico de rodízios.' });
  }
});

module.exports = router;
