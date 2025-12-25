const { createClient } = require('@libsql/client');
const path = require('path');

const db = createClient({
    url: `file:${path.join(process.cwd(), 'kajian.db')}`,
});

async function run() {
    const res = await db.execute("UPDATE kajian SET lat = -6.18, lng = 106.82 WHERE masjid = 'Al Arqam' AND city = 'Jakarta Pusat'");
    console.log('Updated rows:', res.rowsAffected);
}

run().catch(console.error);
