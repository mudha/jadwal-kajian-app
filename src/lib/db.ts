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
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create admins table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'ADMIN',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrations for existing local DBs (best effort)
  try { await db.execute("ALTER TABLE kajian ADD COLUMN gmapsUrl TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN lat REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN lng REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN khususAkhwat BOOLEAN"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN linkInfo TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN imageUrl TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN attendanceCount INTEGER DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN isOnline BOOLEAN DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'ADMIN'"); } catch (e) { }

  // New migrations for waktu split and multiple pemateri
  try { await db.execute("ALTER TABLE kajian ADD COLUMN waktu_mulai TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN waktu_selesai TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN pemateri2 TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN pemateri3 TEXT"); } catch (e) { }

  // New migration for catatan/notes field
  try { await db.execute("ALTER TABLE kajian ADD COLUMN catatan TEXT"); } catch (e) { }

  // New migration for multiple contact persons
  try { await db.execute("ALTER TABLE kajian ADD COLUMN cp2 TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE kajian ADD COLUMN cp3 TEXT"); } catch (e) { }

  // Migrations for sekolah table
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN slug TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN provinsi TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN whatsapp_link TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN website TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN gmaps_url TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN lat REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN lng REAL"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN uang_masuk INTEGER"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN spp_bulanan INTEGER"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN deskripsi TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN khusus_akhwat BOOLEAN DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN khusus_ikhwan BOOLEAN DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN nama_pembina TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN ketua_yayasan TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN kepala_sekolah TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN nama_yayasan TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN imageUrl TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN email TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN facebook TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN instagram TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN twitter TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN youtube TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN telegram TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN telpon_2 TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN contact_person_nama TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN contact_person_hp TEXT"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN is_full_day BOOLEAN DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN is_boarding BOOLEAN DEFAULT 0"); } catch (e) { }
  try { await db.execute("ALTER TABLE sekolah ADD COLUMN is_paket_abc BOOLEAN DEFAULT 0"); } catch (e) { }


  // Sekolah table for Islamic schools directory
  await db.execute(`
    CREATE TABLE IF NOT EXISTS sekolah (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      jenjang TEXT NOT NULL,
      alamat TEXT NOT NULL,
      kota TEXT NOT NULL,
      provinsi TEXT,
      telepon TEXT,
      handphone TEXT,
      whatsapp_link TEXT,
      website TEXT,
      gmaps_url TEXT,
      lat REAL,
      lng REAL,
      uang_masuk INTEGER,
      spp_bulanan INTEGER,
      deskripsi TEXT,
      khusus_akhwat BOOLEAN DEFAULT 0,
      khusus_ikhwan BOOLEAN DEFAULT 0,
      nama_pembina TEXT,
      ketua_yayasan TEXT,
      kepala_sekolah TEXT,
      imageUrl TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Indexes for sekolah table for faster queries
  try { await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_kota ON sekolah(kota)"); } catch (e) { }
  try { await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_jenjang ON sekolah(jenjang)"); } catch (e) { }
  try { await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_slug ON sekolah(slug)"); } catch (e) { }

  // Analytics table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT,
      ip_hash TEXT,
      ua_browser TEXT,
      ua_os TEXT,
      ua_device TEXT,
      city TEXT,
      country TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table for dynamic configuration (JSON values)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
  `);
};

// Auto-init on import (Note: top-level await needs ES modules or handling in app startup)
// For Next.js API routes, it's safer to call this or rely on lazy init strategies, 
// but for simplicity we'll let it run.
initDb().catch(console.error);

export default db;
