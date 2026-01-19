import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/recurring-kajian/clear-all
 * 
 * Clears all recurring kajian data (templates and instances)
 * Admin only
 */
export async function DELETE() {
    const session = (await cookies()).get('admin_session');
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Step 1: Count existing data
        const templatesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM recurring_kajian',
            args: []
        });

        const instancesCount = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM kajian WHERE recurring_kajian_id IS NOT NULL',
            args: []
        });

        console.log(`Found ${templatesCount.rows[0].count} recurring kajian templates`);
        console.log(`Found ${instancesCount.rows[0].count} auto-generated kajian instances`);

        // Step 2: Delete auto-generated instances first
        const deleteInstances = await db.execute({
            sql: 'DELETE FROM kajian WHERE recurring_kajian_id IS NOT NULL',
            args: []
        });

        // Step 3: Delete recurring templates
        const deleteTemplates = await db.execute({
            sql: 'DELETE FROM recurring_kajian',
            args: []
        });

        return NextResponse.json({
            success: true,
            deleted: {
                instances: deleteInstances.rowsAffected,
                templates: deleteTemplates.rowsAffected
            },
            message: `Deleted ${deleteInstances.rowsAffected} instances and ${deleteTemplates.rowsAffected} templates`
        });
    } catch (error: any) {
        console.error('Error clearing recurring kajian:', error);
        return NextResponse.json(
            { error: 'Failed to clear recurring kajian', details: error.message },
            { status: 500 }
        );
    }
}
