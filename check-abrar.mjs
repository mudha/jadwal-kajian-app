
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
    const username = 'Abrar';
    const email = 'abrar.abizar@gmail.com';

    console.log('Checking for conflicts in admins table...');
    const res = await db.execute({
        sql: 'SELECT * FROM admins WHERE username = ? OR email = ?',
        args: [username, email]
    });
    console.log('Conflicting Admins:', JSON.stringify(res.rows, null, 2));

    console.log('Checking application details...');
    const resApp = await db.execute({
        sql: 'SELECT * FROM contributor_applications WHERE username = ? OR email = ?',
        args: [username, email]
    });
    console.log('Application:', JSON.stringify(resApp.rows, null, 2));
}

check().catch(console.error);
