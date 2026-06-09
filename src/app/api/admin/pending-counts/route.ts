import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await requireAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only Admin/Super Admin care about this
        if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
            return NextResponse.json({ contributors: 0 });
        }

        const result = await db.execute(`
            SELECT COUNT(*) as count 
            FROM contributor_applications 
            WHERE status = 'pending'
        `);

        const count = Number(result.rows[0].count ?? 0);

        return NextResponse.json({ contributors: count });
    } catch (error) {
        console.error('Error fetching pending counts:', error);
        return NextResponse.json({ contributors: 0 }, { status: 500 });
    }
}
