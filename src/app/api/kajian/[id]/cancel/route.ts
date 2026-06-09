import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/kajian/[id]/cancel
 * 
 * Mark a recurring kajian instance as canceled
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await requireAdminSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { cancellation_reason } = await request.json().catch(() => ({}));

        // Verify this is a recurring instance
        const checkResult = await db.execute({
            sql: 'SELECT is_recurring_instance, is_canceled FROM kajian WHERE id = ?',
            args: [id]
        });

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Kajian not found' },
                { status: 404 }
            );
        }

        const kajian = checkResult.rows[0];

        if (!kajian.is_recurring_instance) {
            return NextResponse.json(
                { error: 'Only recurring kajian instances can be canceled' },
                { status: 400 }
            );
        }

        // Mark as canceled
        await db.execute({
            sql: 'UPDATE kajian SET is_canceled = 1, cancellation_reason = ? WHERE id = ?',
            args: [cancellation_reason || 'Libur Qadarullah', id]
        });

        return NextResponse.json({
            success: true,
            message: 'Kajian marked as canceled'
        });
    } catch (error: any) {
        console.error('Error canceling kajian:', error);
        return NextResponse.json(
            { error: 'Failed to cancel kajian', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/kajian/[id]/cancel
 * 
 * Uncancel a kajian (restore it)
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication
        const session = await requireAdminSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Un-cancel the kajian
        await db.execute({
            sql: 'UPDATE kajian SET is_canceled = 0, cancellation_reason = NULL WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({
            success: true,
            message: 'Kajian cancellation removed'
        });
    } catch (error: any) {
        console.error('Error uncanceling kajian:', error);
        return NextResponse.json(
            { error: 'Failed to uncancel kajian', details: error.message },
            { status: 500 }
        );
    }
}
