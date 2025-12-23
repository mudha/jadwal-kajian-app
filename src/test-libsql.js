const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

// Mock process.cwd for the test script if needed, or just use absolute path for now
const dbPath = path.join(__dirname, '../kajian.db');
const url = `file:${dbPath}`;

console.log(`Connecting to database at: ${url}`);

const db = createClient({
    url,
});

async function testConnection() {
    try {
        const result = await db.execute('SELECT 1 as val');
        console.log('✅ Connection successful. Test query returned:', result.rows[0]);

        // Check if table exists
        const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='kajian'");
        if (tables.rows.length > 0) {
            console.log('✅ Table "kajian" exists.');

            // Check row count
            const count = await db.execute('SELECT COUNT(*) as count FROM kajian');
            console.log(`📊 Total rows in kajian: ${count.rows[0].count}`);
        } else {
            console.error('❌ Table "kajian" NOT found. Init script might not have run.');
        }

    } catch (e) {
        console.error('❌ Connection failed:', e);
    }
}

testConnection();
