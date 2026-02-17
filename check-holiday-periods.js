const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL || `file:${require('path').join(__dirname, 'kajian.db')}`,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkHolidayPeriods() {
    try {
        console.log('🔍 Checking holiday_periods table...\n');

        // Check if table exists by trying to query it
        const result = await db.execute({
            sql: 'SELECT * FROM holiday_periods',
            args: []
        });

        console.log(`✅ holiday_periods table exists!`);
        console.log(`   Total rows: ${result.rows.length}\n`);

        if (result.rows.length > 0) {
            console.log('📋 Holiday Periods:');
            result.rows.forEach((row) => {
                console.log(`   - ${row.name}`);
                console.log(`     Start: ${row.start_date}`);
                console.log(`     End: ${row.end_date}`);
                console.log(`     Active: ${row.isActive ? 'Yes' : 'No'}`);
                console.log(`     Description: ${row.description || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No holiday periods found. Need to seed data.');
        }

    } catch (error) {
        if (error.message.includes('no such table')) {
            console.error('❌ holiday_periods table does not exist!');
            console.log('   The table should be created automatically by db.ts');
            console.log('   Try restarting the dev server to trigger db initialization.');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

checkHolidayPeriods()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
