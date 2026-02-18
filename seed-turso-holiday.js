const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

// IMPORTANT: This will connect to TURSO production database
// Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.local

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function seedHolidayToProduction() {
    try {
        console.log('🌙 Seeding Ramadhan 1447 H Holiday to Production Database...\n');

        // Check connection
        if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
            console.error('❌ Error: TURSO credentials not found in .env.local');
            console.log('   Make sure you have:');
            console.log('   - TURSO_DATABASE_URL');
            console.log('   - TURSO_AUTH_TOKEN');
            process.exit(1);
        }

        console.log(`📡 Connecting to: ${process.env.TURSO_DATABASE_URL}\n`);

        // Check if holiday period already exists
        const existing = await db.execute({
            sql: `SELECT * FROM holiday_periods WHERE name = ?`,
            args: ['Ramadhan - Syawal 1447 H']
        });

        if (existing.rows.length > 0) {
            console.log('⚠️  Holiday period already exists in production:');
            console.log(`   ID: ${existing.rows[0].id}`);
            console.log(`   Name: ${existing.rows[0].name}`);
            console.log(`   Start: ${existing.rows[0].start_date}`);
            console.log(`   End: ${existing.rows[0].end_date}`);
            console.log(`   Active: ${existing.rows[0].isActive ? 'Yes' : 'No'}`);
            console.log('\n✅ No need to insert again!\n');
            return;
        }

        // Insert the holiday period
        console.log('📝 Inserting holiday period...');
        const result = await db.execute({
            sql: `INSERT INTO holiday_periods (name, start_date, end_date, description) 
            VALUES (?, ?, ?, ?)`,
            args: [
                'Ramadhan - Syawal 1447 H',
                '2026-02-18',
                '2026-04-04',
                'Libur kajian rutin selama Ramadhan hingga pertengahan Syawal 1447 H'
            ]
        });

        console.log('✅ Holiday period created successfully!\n');
        console.log('   📊 Details:');
        console.log('   ID:', result.lastInsertRowid ? Number(result.lastInsertRowid) : 'N/A');
        console.log('   Name: Ramadhan - Syawal 1447 H');
        console.log('   Start: 2026-02-18 (1 Ramadhan 1447 H)');
        console.log('   End: 2026-04-04 (15 Syawal 1447 H)');
        console.log('   Status: Active\n');

        // Verify insertion
        const verify = await db.execute({
            sql: 'SELECT * FROM holiday_periods ORDER BY createdAt DESC'
        });

        console.log('📋 All holiday periods in production database:');
        verify.rows.forEach((row) => {
            console.log(`   - ${row.name}`);
            console.log(`     ${row.start_date} → ${row.end_date} [Active: ${row.isActive ? 'Yes' : 'No'}]`);
        });

        console.log('\n🎉 Done! Kajian rutin akan skip periode Ramadhan - Syawal 1447 H\n');

    } catch (error) {
        console.error('\n❌ Error seeding holiday data:', error);
        console.error('   Details:', error.message);
        process.exit(1);
    }
}

seedHolidayToProduction()
    .then(() => {
        console.log('✨ Script completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
