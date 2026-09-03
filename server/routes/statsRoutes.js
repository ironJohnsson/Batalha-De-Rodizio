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

// GET /api/stats/by-type - Detailed stats grouped by rodízio type for the logged-in user
router.get('/by-type', authMiddleware, async (req, res) => {
  try {
    const rawRes = await db.execute({
      sql: `SELECT 
        LOWER(TRIM(COALESCE(r.type, 'pizza'))) as rodizio_type,
        COUNT(rp.room_code) as battles,
        SUM(CASE WHEN rp.slice_count = (
          SELECT MAX(rp2.slice_count) 
          FROM room_participants rp2 
          WHERE rp2.room_code = r.code
        ) AND rp.slice_count > 0 THEN 1 ELSE 0 END) as wins,
        SUM(rp.slice_count) as total_consumed,
        MAX(rp.slice_count) as max_consumed,
        ROUND(AVG(CAST(rp.slice_count AS REAL)), 1) as avg_consumed
      FROM room_participants rp
      JOIN rooms r ON rp.room_code = r.code
      WHERE rp.user_id = ? AND r.status = 'finished'
      GROUP BY LOWER(TRIM(COALESCE(r.type, 'pizza')))`,
      args: [req.user.id]
    });

    const standardTypes = ['pizza', 'japones', 'hamburguer', 'bebida', 'churrasco'];
    const byTypeMap = {};

    for (const t of standardTypes) {
      byTypeMap[t] = {
        type: t,
        battles: 0,
        wins: 0,
        total_consumed: 0,
        max_consumed: 0,
        avg_consumed: 0.0
      };
    }

    for (const row of rawRes.rows) {
      const typeKey = (row.rodizio_type || 'pizza').toLowerCase();
      byTypeMap[typeKey] = {
        type: typeKey,
        battles: Number(row.battles) || 0,
        wins: Number(row.wins) || 0,
        total_consumed: Number(row.total_consumed) || 0,
        max_consumed: Number(row.max_consumed) || 0,
        avg_consumed: Number(row.avg_consumed) || 0.0
      };
    }

    return res.json({
      types: standardTypes.map(t => byTypeMap[t]),
      byTypeMap
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas por tipo:', err);
    return res.status(500).json({ error: 'Erro ao buscar estatísticas por tipo de rodízio.' });
  }
});

module.exports = router;
