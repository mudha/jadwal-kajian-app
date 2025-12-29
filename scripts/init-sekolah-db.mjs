import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../kajian.db')}`;
console.log(`Connecting to: ${url}`);

const db = createClient({
    url: url,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function init() {
    console.log('Initializing sekolah table...');
    try {
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

        // Create indexes
        await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_kota ON sekolah(kota)");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_jenjang ON sekolah(jenjang)");
        await db.execute("CREATE INDEX IF NOT EXISTS idx_sekolah_slug ON sekolah(slug)");

        console.log('✅ Sekolah table created successfully!');

        const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='sekolah'");
        console.log('Table verify:', result.rows);

    } catch (error) {
        console.error('Error initializing DB:', error);
    }
}

init();
