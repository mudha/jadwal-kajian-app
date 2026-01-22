import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkAdmins() {
    try {
        const result = await db.execute('SELECT id, username, email, role, fullName FROM admins');
        console.log('--- Admin Users ---');
        console.table(result.rows);
    } catch (error) {
        console.error('Error fetching admins:', error);
    }
}

checkAdmins();
