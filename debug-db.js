
const { createClient } = require('@libsql/client');
const path = require('path');

const url = `file:${path.join(process.cwd(), 'kajian.db')}`;

const db = createClient({
    url,
});

async function checkData() {
    try {
        const result = await db.execute('SELECT id, masjid, city, lat, lng, gmapsUrl, tema FROM kajian ORDER BY id DESC LIMIT 10');
        result.rows.forEach(row => {
            console.log(`ID: ${row.id}`);
            console.log(`Masjid: ${row.masjid}`);
            console.log(`City: ${row.city}`);
            console.log(`Lat: ${row.lat}`);
            console.log(`Lng: ${row.lng}`);
            console.log(`Gmaps: ${row.gmapsUrl}`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    }
}

checkData();
