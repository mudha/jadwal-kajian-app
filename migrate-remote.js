const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function migrate() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        console.error('TURSO_DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    console.log(`Connecting to: ${url}`);
    const db = createClient({ url, authToken });

    console.log('Migrating remote DB: Minggu to Ahad...');

    // 1. Update existing records
    const res = await db.execute("UPDATE kajian SET date = REPLACE(date, 'Minggu', 'Ahad') WHERE date LIKE '%Minggu%'");
    console.log(`Updated ${res.rowsAffected} records.`);

    process.exit(0);
}

migrate().catch(err => {
    console.error(err);
    process.exit(1);
});
