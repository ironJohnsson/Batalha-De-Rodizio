const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authMiddleware } = require('../auth');

// GET /api/stats/leaderboard - Top rankings across verified user accounts
router.get('/leaderboard', async (req, res) => {
  try {
    const topWinsRes = await db.execute(`
      SELECT 
        u.nickname,
        s.wins,
        s.total_battles,
        s.total_slices,
        s.avg_slices,
        s.max_slices
      FROM user_stats s
      JOIN users u ON s.user_id = u.id
      WHERE s.total_battles > 0
      ORDER BY s.wins DESC, s.total_slices DESC
      LIMIT 10
    `);

    return res.json({ topWins: topWinsRes.rows, topSlices: [] });
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
        r.type as room_type,
        r.winner_nickname,
        r.finished_at,
        rp.slice_count,
        (SELECT COUNT(*) FROM room_participants WHERE room_code = r.code) as total_players
      FROM room_participants rp
      JOIN rooms r ON rp.room_code = r.code
      WHERE rp.user_id = ? AND r.status = 'finished'
      ORDER BY r.finished_at DESC
      LIMIT 20`,
      args: [req.user.id]
    });

    return res.json({ history: histRes.rows });
  } catch (err) {
    console.error('Erro no histórico:', err);
    return res.status(500).json({ error: 'Erro ao buscar histórico de rodízios.' });
  }
});

module.exports = router;
