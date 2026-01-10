const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function migrate() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    const db = createClient({ url, authToken });

    console.log('Migrating remote DB: Thoroughly replacing Minggu/minggu...');

    // Using a more aggressive update pattern
    const res = await db.execute("UPDATE kajian SET date = REPLACE(REPLACE(date, 'Minggu', 'Ahad'), 'minggu', 'Ahad') WHERE date LIKE '%minggu%' OR date LIKE '%Minggu%'");
    console.log(`Updated ${res.rowsAffected} records.`);

    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
