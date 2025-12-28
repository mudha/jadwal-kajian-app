
const { createClient } = require('@libsql/client');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'kajian.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient({ url, authToken });

async function fixData() {
    try {
        console.log("Fixing ID 412...");
        await db.execute({
            sql: "UPDATE kajian SET lat = ?, lng = ? WHERE id = 412",
            args: [-7.224583, 112.543326]
        });

        console.log("Resetting ID 409 to NULL...");
        await db.execute("UPDATE kajian SET lat = NULL, lng = NULL WHERE id = 409");

        console.log("Done.");
    } catch (e) { console.error(e); }
}
fixData();
