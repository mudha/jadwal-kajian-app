import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSettings() {
    try {
        const result = await db.execute("SELECT * FROM settings WHERE key = 'quick_menu_items'");
        if (result.rows.length > 0) {
            console.log("Found custom quick menu settings:");
            const items = JSON.parse(result.rows[0].value);
            console.log(JSON.stringify(items, null, 2));
        } else {
            console.log("No custom quick menu settings found (using defaults).");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkSettings();
