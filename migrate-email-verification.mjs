// Migration: Add email verification fields to contributor_applications table
import { createClient } from '@libsql/client';
import 'dotenv/config';

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
}

const db = createClient({
    url,
    authToken,
});

async function migrate() {
    try {
        console.log('🔄 Adding email verification fields to contributor_applications table...\n');

        // Add email_verified column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN email_verified INTEGER DEFAULT 0`,
            args: []
        });
        console.log('✅ Added email_verified column');

        // Add verification_token column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN verification_token TEXT`,
            args: []
        });
        console.log('✅ Added verification_token column');

        // Add token_expires_at column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN token_expires_at INTEGER`,
            args: []
        });
        console.log('✅ Added token_expires_at column');

        console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

migrate();
