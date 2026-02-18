const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || `file:${require('path').join(__dirname, 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

// Indonesian month names
const MONTHS = {
    'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4, 'Mei': 5, 'Juni': 6,
    'Juli': 7, 'Agustus': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
};

function parseIndonesianDate(dateStr) {
    // Format: "Jumat, 20 Februari 2026"
    const regex = /(\d+)\s+(\w+)\s+(\d{4})/;
    const match = dateStr.match(regex);

    if (!match) return null;

    const [_, day, monthName, year] = match;
    const month = MONTHS[monthName];

    if (!month) return null;

    return new Date(parseInt(year), month - 1, parseInt(day));
}

async function deleteRamadhanKajianProper() {
    try {
        const isProduction = url.startsWith('libsql://');
        console.log(`\n📡 Database: ${isProduction ? 'Production (Turso)' : 'Local SQLite'}`);
        console.log(`   ${url}\n`);

        console.log('🗑️  Deleting Recurring Kajian in Ramadhan - Syawal 1447 H Period...\n');

        // Holiday period dates
        const startDate = new Date(2026, 1, 18); // Feb 18, 2026 (month is 0-indexed)
        const endDate = new Date(2026, 3, 4);    // Apr 4, 2026

        console.log('📅 Period to delete:');
        console.log(`   Start: 18 Februari 2026 (1 Ramadhan 1447 H)`);
        console.log(`   End: 4 April 2026 (15 Syawal 1447 H)\n`);

        // Find all recurring kajian in Feb-Apr 2026
        const result = await db.execute({
            sql: `
        SELECT id, masjid, date, pemateri, recurring_kajian_id
        FROM kajian
        WHERE (recurring_kajian_id IS NOT NULL OR is_recurring_instance = 1)
        AND (
          date LIKE '%Februari 2026%' OR
          date LIKE '%Maret 2026%' OR
          date LIKE '%April 2026%'
        )
        ORDER BY date
      `
        });

        if (result.rows.length === 0) {
            console.log('✅ No recurring kajian found in Feb-Apr 2026.');
            console.log('   Database is already clean!\n');
            return;
        }

        console.log(`🔍 Found ${result.rows.length} recurring kajian in Feb-Apr 2026\n`);
        console.log('Filtering for 18 Feb - 4 Apr range...\n');

        // Filter for Ramadhan period
        const toDelete = [];
        result.rows.forEach((row) => {
            const parsedDate = parseIndonesianDate(row.date);

            if (!parsedDate) {
                console.log(`⚠️  Could not parse date: ${row.date}`);
                return;
            }

            if (parsedDate >= startDate && parsedDate <= endDate) {
                toDelete.push(row);
            }
        });

        if (toDelete.length === 0) {
            console.log('✅ No recurring kajian in 18 Feb - 4 Apr range.');
            console.log(`   (All ${result.rows.length} recurring kajian are outside Ramadhan period)\n`);
            return;
        }

        console.log(`⚠️  Will delete ${toDelete.length} kajian:\n`);
        toDelete.forEach((row, index) => {
            console.log(`   ${index + 1}. [ID: ${row.id}] ${row.date}`);
            console.log(`      ${row.masjid}`);
            console.log('');
        });

        // Delete them
        console.log('🗑️  Deleting...\n');

        let deleted = 0;
        for (const row of toDelete) {
            await db.execute({
                sql: 'DELETE FROM kajian WHERE id = ?',
                args: [row.id]
            });
            deleted++;
        }

        console.log(`✅ Successfully deleted ${deleted} recurring kajian!\n`);

        // Verify
        const verifyResult = await db.execute({
            sql: `
        SELECT COUNT(*) as count
        FROM kajian
        WHERE (recurring_kajian_id IS NOT NULL OR is_recurring_instance = 1)
        AND (
          date LIKE '%Februari 2026%' OR
          date LIKE '%Maret 2026%' OR
          date LIKE '%April 2026%'
        )
      `
        });

        const remaining = verifyResult.rows[0].count;
        console.log(`📊 Remaining recurring kajian in Feb-Apr 2026: ${remaining}`);
        console.log(`   (These should be outside the 18 Feb - 4 Apr range)\n`);

        console.log('🎉 Done! Kajian rutin periode Ramadhan sudah dihapus.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

deleteRamadhanKajianProper()
    .then(() => {
        console.log('✨ Script completed!\n');
        process.exit(0);
    })
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    });
