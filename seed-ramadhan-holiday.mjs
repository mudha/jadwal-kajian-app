import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`📡 Database: ${url.startsWith('file:') ? 'Local SQLite' : 'Remote Turso/LibSQL'}`);

const db = createClient({
    url,
    authToken,
});

async function seedHolidayData() {
    try {
        console.log('🌙 Seeding Ramadhan 1447 H holiday period...');

        // Check if the holiday period already exists
        const existing = await db.execute({
            sql: `SELECT * FROM holiday_periods WHERE name = ?`,
            args: ['Ramadhan - Syawal 1447 H']
        });

        if (existing.rows.length > 0) {
            console.log('✅ Holiday period already exists:', existing.rows[0]);
            return;
        }

        // Insert the holiday period
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

        console.log('✅ Holiday period created successfully!');
        console.log('   ID:', result.lastInsertRowid);
        console.log('   Name: Ramadhan - Syawal 1447 H');
        console.log('   Start: 2026-02-18 (1 Ramadhan 1447 H)');
        console.log('   End: 2026-04-04 (15 Syawal 1447 H)');

        // Verify insertion
        const verify = await db.execute({
            sql: 'SELECT * FROM holiday_periods'
        });

        console.log('\n📋 All holiday periods:');
        verify.rows.forEach((row: any) => {
            console.log(`   - ${row.name} (${row.start_date} to ${row.end_date}) [Active: ${row.isActive}]`);
        });

    } catch (error) {
        console.error('❌ Error seeding holiday data:', error);
        process.exit(1);
    }
}

seedHolidayData()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
