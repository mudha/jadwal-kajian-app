/**
 * Migration Script: Fix Waktu Display
 * 
 * Purpose: Regenerate the 'waktu' display field from 'waktu_mulai' and 'waktu_selesai'
 * for all kajian entries where waktu_mulai is filled but waktu is missing/incomplete.
 * 
 * Usage: node fix-waktu-display.js
 */

const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const db = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || ''
});

async function fixWaktuDisplay() {
    console.log('🔍 Starting waktu migration...\n');

    try {
        // Find all kajian with waktu_mulai but potentially missing/incomplete waktu
        const result = await db.execute({
            sql: `SELECT id, waktu_mulai, waktu_selesai, waktu, tema FROM kajian WHERE waktu_mulai IS NOT NULL`,
            args: []
        });

        const rows = result.rows;
        console.log(`📊 Found ${rows.length} kajian with waktu_mulai filled\n`);

        let updatedCount = 0;
        const updates = [];

        for (const row of rows) {
            const id = row.id;
            const waktu_mulai = row.waktu_mulai;
            const waktu_selesai = row.waktu_selesai;
            const currentWaktu = row.waktu;

            // Generate the proper waktu display string
            const start = String(waktu_mulai).trim();
            const end = waktu_selesai ? String(waktu_selesai).trim() : 'Selesai';

            let formattedTime = `${start} - ${end}`;

            // Auto-append WIB if time pattern detected and timezone missing
            if (/\d{1,2}[:.]\d{2}/.test(start) && !/WIB|WITA|WIT/i.test(formattedTime)) {
                formattedTime += ' WIB';
            }

            // Only update if waktu is different (null, empty, or different format)
            const needsUpdate = !currentWaktu ||
                currentWaktu.trim() === '' ||
                currentWaktu !== formattedTime;

            if (needsUpdate) {
                updates.push({
                    sql: `UPDATE kajian SET waktu = ? WHERE id = ?`,
                    args: [formattedTime, id]
                });

                console.log(`✏️  ID ${id}: "${currentWaktu || '(empty)'}" → "${formattedTime}"`);
                updatedCount++;
            }
        }

        if (updates.length > 0) {
            console.log(`\n🔄 Updating ${updates.length} records...`);
            await db.batch(updates);
            console.log(`✅ Successfully updated ${updatedCount} kajian!`);
        } else {
            console.log('✨ All records already have correct waktu format!');
        }

        console.log('\n📈 Summary:');
        console.log(`   Total checked: ${rows.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Skipped: ${rows.length - updatedCount}`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
fixWaktuDisplay()
    .then(() => {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
