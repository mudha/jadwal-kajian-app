const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`,
});

async function run() {
    const res = await db.execute(`
        SELECT 
            masjid as name,
            city,
            address,
            MAX(lat) as lat,
            MAX(lng) as lng
        FROM kajian
        WHERE masjid = 'Al Arqam'
        GROUP BY masjid, city, address
    `);
    console.log(JSON.stringify(res.rows, null, 2));
}

run().catch(console.error);
