
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function check() {
    console.log('Checking database table...');
    const res = await db.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="contributor_applications"');
    console.log('Table exists:', res.rows.length > 0);

    if (res.rows.length === 0) {
        console.log('Table not found. Initializing...');
        await db.execute(`
      CREATE TABLE IF NOT EXISTS contributor_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT NOT NULL,
        region TEXT NOT NULL,
        city TEXT,
        phoneNumber TEXT,
        motivation TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log('Table created!');
    }
}

check().catch(console.error);
