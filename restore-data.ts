import db from './src/lib/db';

async function restore() {
    try {
        console.log("Restoring data from recurring_kajian_old...");

        // Check if destination table is empty to avoid duplicates if ran multiple times
        // (Though since we just created it and it failed, it should be empty)
        await db.execute("DELETE FROM recurring_kajian");

        // Copy data excluding updatedAt
        await db.execute(`
            INSERT INTO recurring_kajian (
                id, masjid, address, city, pemateri, pemateri2, pemateri3, tema,
                pattern, day_of_week, week_of_month, waktu_mulai, waktu_selesai,
                cp, cp2, cp3, gmapsUrl, lat, lng, imageUrl, catatan, linkInfo,
                khususAkhwat, isOnline, isKidsFriendly, isActive, createdBy, createdAt
            )
            SELECT 
                id, masjid, address, city, pemateri, pemateri2, pemateri3, tema,
                pattern, day_of_week, week_of_month, waktu_mulai, waktu_selesai,
                cp, cp2, cp3, gmapsUrl, lat, lng, imageUrl, catatan, linkInfo,
                khususAkhwat, isOnline, isKidsFriendly, isActive, createdBy, createdAt
            FROM recurring_kajian_old
        `);

        console.log("Data restored successfully!");

        // Verify count
        const countNew = await db.execute("SELECT COUNT(*) as c FROM recurring_kajian");
        const countOld = await db.execute("SELECT COUNT(*) as c FROM recurring_kajian_old");
        console.log(`Restored ${countNew.rows[0].c} rows (Source had ${countOld.rows[0].c})`);

        if (countNew.rows[0].c === countOld.rows[0].c) {
            console.log("Dropping backup table...");
            await db.execute("DROP TABLE recurring_kajian_old");
            console.log("Backup table dropped.");
        } else {
            console.error("Row count mismatch! keeping backup table.");
        }

    } catch (e) {
        console.error("Restore failed:", e);
    }
}

restore();
