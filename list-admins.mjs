
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function listAdmins() {
    console.log('Listing all admins...');
    const res = await db.execute('SELECT id, username, email, role FROM admins');
    console.log(JSON.stringify(res.rows, null, 2));
}

listAdmins().catch(console.error);
