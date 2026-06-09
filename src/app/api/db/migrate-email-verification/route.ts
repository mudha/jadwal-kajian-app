import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/db/migrate-email-verification
 * 
 * Adds email verification fields to contributor_applications table
 * Admin only
 */
export async function POST() {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log('🔄 Adding email verification fields to contributor_applications table...');

        // Add email_verified column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN email_verified INTEGER DEFAULT 0`,
            args: []
        });

        // Add verification_token column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN verification_token TEXT`,
            args: []
        });

        // Add token_expires_at column
        await db.execute({
            sql: `ALTER TABLE contributor_applications ADD COLUMN token_expires_at INTEGER`,
            args: []
        });

        return NextResponse.json({
            success: true,
            message: 'Email verification fields added successfully'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: 'Migration failed', details: error.message },
            { status: 500 }
        );
    }
}
