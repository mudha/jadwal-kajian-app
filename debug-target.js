
const { createClient } = require('@libsql/client');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, authToken });

async function checkData() {
    try {
        const result = await db.execute("SELECT id, city, lat, lng, gmapsUrl FROM kajian WHERE id IN (409, 412)");
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`City: ${row.city}`);
            console.log(`Gmaps: ${row.gmapsUrl}`);
            console.log('---');
        });
    } catch (e) { console.error(e); }
}
checkData();
