import db from './src/lib/db';

async function migrate() {
    try {
        console.log("Starting migration...");

        // 1. Rename existing table
        await db.execute("ALTER TABLE recurring_kajian RENAME TO recurring_kajian_old");

        // 2. Create new table with updated constraint
        await db.execute(`
            CREATE TABLE recurring_kajian (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                masjid TEXT NOT NULL,
                address TEXT,
                city TEXT NOT NULL,
                pemateri TEXT NOT NULL,
                pemateri2 TEXT,
                pemateri3 TEXT,
                tema TEXT,
                pattern TEXT NOT NULL CHECK(pattern IN ('weekly', 'biweekly', 'monthly', 'monthly_odd', 'monthly_even', 'custom')),
                day_of_week INTEGER NOT NULL,
                week_of_month INTEGER,
                waktu_mulai TEXT NOT NULL,
                waktu_selesai TEXT,
                cp TEXT,
                cp2 TEXT,
                cp3 TEXT,
                gmapsUrl TEXT,
                lat REAL,
                lng REAL,
                imageUrl TEXT,
                catatan TEXT,
                linkInfo TEXT,
                khususAkhwat BOOLEAN DEFAULT 0,
                isOnline BOOLEAN DEFAULT 0,
                isKidsFriendly BOOLEAN DEFAULT 0,
                isActive BOOLEAN DEFAULT 1,
                createdBy TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Copy data
        // Explicitly list columns to avoid mismatches if schema drifted
        await db.execute(`
            INSERT INTO recurring_kajian (
                id, masjid, address, city, pemateri, pemateri2, pemateri3, tema,
                pattern, day_of_week, week_of_month, waktu_mulai, waktu_selesai,
                cp, cp2, cp3, gmapsUrl, lat, lng, imageUrl, catatan, linkInfo,
                khususAkhwat, isOnline, isKidsFriendly, isActive, createdBy, createdAt, updatedAt
            )
            SELECT 
                id, masjid, address, city, pemateri, pemateri2, pemateri3, tema,
                pattern, day_of_week, week_of_month, waktu_mulai, waktu_selesai,
                cp, cp2, cp3, gmapsUrl, lat, lng, imageUrl, catatan, linkInfo,
                khususAkhwat, isOnline, isKidsFriendly, isActive, createdBy, createdAt, updatedAt
            FROM recurring_kajian_old
        `);

        // 4. Drop old table
        await db.execute("DROP TABLE recurring_kajian_old");

        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e);
        // Attempt rollback (rename back if possible, though SQLite DDL transaction support varies)
    }
}

migrate();
