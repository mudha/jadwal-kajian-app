const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`,
});

async function run() {
    const res = await db.execute(`
        SELECT 
            DISTINCT masjid as name,
            city,
            address,
            MAX(gmapsUrl) as gmapsUrl,
            MAX(lat) as lat,
            MAX(lng) as lng,
            COUNT(*) as kajianCount
        FROM kajian
        WHERE masjid IS NOT NULL AND masjid != ''
        GROUP BY masjid, city, address
        ORDER BY masjid ASC
        LIMIT 10
    `);
    console.log(JSON.stringify(res.rows, null, 2));
}

run().catch(console.error);
