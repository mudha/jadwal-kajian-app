const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || `file:${require('path').join(__dirname, 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function showRamadhanKajian() {
    try {
        console.log('\n📋 All recurring kajian in Feb-Apr 2026:\n');

        const result = await db.execute({
            sql: `
        SELECT id, masjid, date, recurring_kajian_id
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

        console.log(`Found ${result.rows.length} kajian:\n`);

        result.rows.forEach((row, i) => {
            console.log(`${i + 1}. [ID: ${row.id}] ${row.date}`);
            console.log(`   ${row.masjid}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

showRamadhanKajian().then(() => process.exit(0));
