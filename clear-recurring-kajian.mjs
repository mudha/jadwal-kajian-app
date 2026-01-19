// Script to clear all recurring kajian data
// This will delete:
// 1. All recurring kajian templates from recurring_kajian table
// 2. All auto-generated instances from kajian table (where recurring_kajian_id IS NOT NULL)

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

async function clearRecurringKajian() {
    try {
        console.log('🗑️  Starting to clear recurring kajian data...\n');

        // Step 1: Count existing recurring templates
        const templatesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM recurring_kajian',
            args: []
        });
        console.log(`📊 Found ${templatesCount.rows[0].count} recurring kajian templates`);

        // Step 2: Count auto-generated instances
        const instancesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM kajian WHERE recurring_kajian_id IS NOT NULL',
            args: []
        });
        console.log(`📊 Found ${instancesCount.rows[0].count} auto-generated kajian instances\n`);

        // Step 3: Delete auto-generated instances first
        console.log('🗑️  Deleting auto-generated kajian instances...');
        const deleteInstances = await db.execute({
            sql: 'DELETE FROM kajian WHERE recurring_kajian_id IS NOT NULL',
            args: []
        });
        console.log(`✅ Deleted ${deleteInstances.rowsAffected} kajian instances\n`);

        // Step 4: Delete recurring templates
        console.log('🗑️  Deleting recurring kajian templates...');
        const deleteTemplates = await db.execute({
            sql: 'DELETE FROM recurring_kajian',
            args: []
        });
        console.log(`✅ Deleted ${deleteTemplates.rowsAffected} recurring kajian templates\n`);

        // Verify deletion
        const finalTemplatesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM recurring_kajian',
            args: []
        });
        const finalInstancesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM kajian WHERE recurring_kajian_id IS NOT NULL',
            args: []
        });

        console.log('✅ Verification:');
        console.log(`   Recurring templates remaining: ${finalTemplatesCount.rows[0].count}`);
        console.log(`   Auto-generated instances remaining: ${finalInstancesCount.rows[0].count}`);
        console.log('\n🎉 Successfully cleared all recurring kajian data!');

    } catch (error) {
        console.error('❌ Error clearing recurring kajian:', error);
        process.exit(1);
    }
}

clearRecurringKajian();
