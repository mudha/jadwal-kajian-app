import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

// Check settings table
console.log('\n=== SETTINGS TABLE ===');
try {
    const settings = await db.execute('SELECT * FROM settings');
    if (settings.rows.length === 0) {
        console.log('⚠️  Settings table is EMPTY');
    } else {
        settings.rows.forEach(row => {
            console.log(`Key: ${row.key}`);
            console.log(`Value: ${row.value}`);
            console.log('---');
        });
    }
} catch (error) {
    console.error('❌ Settings table does not exist:', error.message);
}

process.exit(0);
