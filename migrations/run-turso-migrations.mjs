import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error('❌ TURSO_DATABASE_URL is not set in .env.local');
    process.exit(1);
}

const db = createClient({ url, authToken });

async function runMigrations() {
    console.log('🚀 Running migrations on Turso/LibSQL database...');
    console.log(`📡 URL: ${url}\n`);

    try {
        // Migration 1: Create recurring_kajian table
        console.log('1. Creating recurring_kajian table...');
        const migration1 = fs.readFileSync(
            path.join(process.cwd(), 'migrations', '001_create_recurring_kajian.sql'),
            'utf8'
        );
        // Split by semicolon because db.execute might only take one statement at a time depending on driver
        const statements1 = migration1.split(';').filter(s => s.trim().length > 0);
        for (const s of statements1) {
            await db.execute(s);
        }
        console.log('✓ recurring_kajian table created\n');

        // Migration 2: Add recurring fields to kajian table
        console.log('2. Adding recurring fields to kajian table...');
        const migration2 = fs.readFileSync(
            path.join(process.cwd(), 'migrations', '002_add_recurring_fields_to_kajian.sql'),
            'utf8'
        );
        const statements2 = migration2.split(';').filter(s => s.trim().length > 0);
        for (const s of statements2) {
            try {
                await db.execute(s);
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('duplicate column')) {
                    console.warn(`⚠️ Warning: ${err.message.split('\n')[0]}`);
                } else {
                    throw err;
                }
            }
        }
        console.log('✓ Recurring fields added to kajian table\n');

        console.log('✅ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigrations();
