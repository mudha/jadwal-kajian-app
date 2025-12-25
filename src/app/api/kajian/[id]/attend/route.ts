
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        // Increment attendanceCount atomically
        await db.execute({
            sql: 'UPDATE kajian SET attendanceCount = COALESCE(attendanceCount, 0) + 1 WHERE id = ?',
            args: [id]
        });

        // Fetch updated count
        const result = await db.execute({
            sql: 'SELECT attendanceCount FROM kajian WHERE id = ?',
            args: [id]
        });

        const newCount = result.rows[0]?.attendanceCount || 1;

        return NextResponse.json({ success: true, count: newCount });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
    }
}
