const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config();

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'database.sqlite')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken: authToken || undefined
});

async function initDb() {
  try {
    await db.batch([
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT UNIQUE NOT NULL COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        total_battles INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0,
        total_slices INTEGER DEFAULT 0,
        max_slices INTEGER DEFAULT 0,
        avg_slices REAL DEFAULT 0.0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS rooms (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        host_user_id INTEGER,
        type TEXT DEFAULT 'pizza',
        password TEXT,
        status TEXT DEFAULT 'active',
        winner_nickname TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        finished_at DATETIME,
        FOREIGN KEY (host_user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS room_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        user_id INTEGER,
        nickname TEXT NOT NULL,
        slice_count INTEGER DEFAULT 0,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS room_activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        text TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
      )`
    ]);

    // Migration fallback for existing tables
    try { await db.execute("ALTER TABLE rooms ADD COLUMN type TEXT DEFAULT 'pizza'"); } catch (e) {}
    try { await db.execute("ALTER TABLE rooms ADD COLUMN password TEXT"); } catch (e) {}

    console.log(`[Database] Conectado e tabelas verificadas (${process.env.TURSO_DATABASE_URL ? 'Turso Cloud' : 'SQLite Local'})`);
  } catch (err) {
    console.error('[Database] Erro ao inicializar tabelas:', err);
  }
}

module.exports = {
  db,
  initDb
};
