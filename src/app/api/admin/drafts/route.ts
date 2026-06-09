import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
    const session = await requireAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await db.execute(`
            SELECT * FROM kajian_drafts 
            WHERE status = 'pending' 
            ORDER BY createdAt DESC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }
}
