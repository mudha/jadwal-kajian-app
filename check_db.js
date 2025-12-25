const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`,
});

async function run() {
    const res = await db.execute('SELECT masjid, lat, lng FROM kajian WHERE lat IS NOT NULL LIMIT 10');
    console.log(JSON.stringify(res.rows, null, 2));
}

run().catch(console.error);
