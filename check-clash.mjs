
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
    const email = 'mudha_2007@yahoo.co.id';
    const username = 'abunaurah';

    console.log('Checking clashing record...');
    const res = await db.execute({
        sql: 'SELECT * FROM contributor_applications WHERE username = ? OR email = ?',
        args: [username, email]
    });
    console.log('Results:', JSON.stringify(res.rows, null, 2));

    const res2 = await db.execute({
        sql: 'SELECT * FROM admins WHERE username = ? OR email = ?',
        args: [username, email]
    });
    console.log('Admin results:', JSON.stringify(res2.rows, null, 2));
}

check().catch(console.error);
