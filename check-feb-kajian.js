const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL || `file:${require('path').join(__dirname, 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
    url,
    authToken,
});

async function findRecurringInRamadhan() {
    try {
        const isProduction = url.startsWith('libsql://');
        console.log(`\n📡 Database: ${isProduction ? 'Production (Turso)' : 'Local SQLite'}`);
        console.log(`   ${url}\n`);

        console.log('🔍 Searching for ALL kajian with recurring_kajian_id (RUTIN) in Ramadhan period...\n');

        // Search with different approaches
        const queries = [
            {
                name: 'Search by recurring_kajian_id NOT NULL',
                sql: `
          SELECT id, masjid, date, pemateri, recurring_kajian_id, is_recurring_instance
          FROM kajian
          WHERE recurring_kajian_id IS NOT NULL
          ORDER BY date
          LIMIT 50
        `
            },
            {
                name: 'Search by is_recurring_instance = 1',
                sql: `
          SELECT id, masjid, date, pemateri, recurring_kajian_id, is_recurring_instance
          FROM kajian
          WHERE is_recurring_instance = 1
          ORDER BY date
          LIMIT 50
        `
            }
        ];

        for (const query of queries) {
            console.log(`\n📋 ${query.name}:\n`);

            const result = await db.execute({ sql: query.sql });

            if (result.rows.length === 0) {
                console.log('   ✅ No recurring kajian found\n');
                continue;
            }

            console.log(`   Found ${result.rows.length} kajian:\n`);

            // Filter for Ramadhan period
            const ramadhanKajian = result.rows.filter(row => {
                const date = row.date;
                // Check if date contains Feb, Mar, or Apr 2026
                return date && (
                    date.includes('Februari 2026') ||
                    date.includes('Maret 2026') ||
                    date.includes('Maret 2026') ||
                    date.includes('April 2026')
                );
            });

            if (ramadhanKajian.length > 0) {
                console.log(`   ⚠️  ${ramadhanKajian.length} kajian in Ramadhan period!\n`);

                ramadhanKajian.forEach((row) => {
                    console.log(`   🔴 ID: ${row.id} | ${row.date}`);
                    console.log(`      Masjid: ${row.masjid}`);
                    console.log(`      Template ID: ${row.recurring_kajian_id}`);
                    console.log(`      is_recurring_instance: ${row.is_recurring_instance}`);
                    console.log('');
                });
            } else {
                console.log(`   ✅ None in Ramadhan period (Feb-Apr 2026)\n`);
            }

            // Show first 5 for context
            console.log('   First 5 results for context:');
            result.rows.slice(0, 5).forEach((row) => {
                console.log(`   - ID: ${row.id} | ${row.date} | ${row.masjid}`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findRecurringInRamadhan()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
