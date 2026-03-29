import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await db.execute({
            sql: `UPDATE kajian_drafts SET status = 'rejected' WHERE id = ?`,
            args: [id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rejecting draft:', error);
        return NextResponse.json({ error: 'Failed to reject draft' }, { status: 500 });
    }
}
