
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
    const username = 'Abrar';
    console.log('Checking admins for username:', username);

    const res = await db.execute({
        sql: 'SELECT * FROM admins WHERE username = ?',
        args: [username]
    });

    if (res.rows.length > 0) {
        console.log('User FOUND in admins table:', JSON.stringify(res.rows[0], null, 2));
    } else {
        console.log('User NOT found in admins table.');
    }
}

check().catch(console.error);
