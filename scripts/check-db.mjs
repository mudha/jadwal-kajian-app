import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, '../kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`Checking DB at: ${url}`);

const db = createClient({
    url: url,
    authToken: authToken,
});

async function check() {
    try {
        const count = await db.execute('SELECT COUNT(*) as total FROM sekolah');
        console.log(`Total schools in DB: ${count.rows[0].total}`);

        // Check distribution
        const dist = await db.execute('SELECT jenjang, COUNT(*) as count FROM sekolah GROUP BY jenjang');
        console.log('\nDistribution by Jenjang:');
        dist.rows.forEach(row => {
            console.log(`- ${row.jenjang}: ${row.count}`);
        });

    } catch (e) {
        console.error('Error checking DB:', e);
    }
}

check();
