import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`📡 Database: ${url.startsWith('file:') ? 'Local SQLite' : 'Remote Turso/LibSQL'}`);

const db = createClient({
  url,
  authToken,
});

// Initialize table (Async wrapper)
const initDb = async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS kajian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region TEXT,
      city TEXT,
      masjid TEXT,
      address TEXT,
      gmapsUrl TEXT,
      lat REAL,
      lng REAL,
      pemateri TEXT,
      tema TEXT,
      waktu TEXT,
      cp TEXT,
      date TEXT,
      khususAkhwat BOOLEAN,
      linkInfo TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrations for existing local DBs (best effort)
  try { await db.execute("ALTER TABLE kajian ADD COLUMN gmapsUrl TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN lat REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN lng REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN khususAkhwat BOOLEAN"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN linkInfo TEXT"); } catch (e) { }
};

// Auto-init on import (Note: top-level await needs ES modules or handling in app startup)
// For Next.js API routes, it's safer to call this or rely on lazy init strategies, 
// but for simplicity we'll let it run.
initDb().catch(console.error);

export default db;
