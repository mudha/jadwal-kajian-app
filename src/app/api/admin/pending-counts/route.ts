import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
    try {
        const session = (await cookies()).get('admin_session');
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionData = JSON.parse(session.value);
        // Only Admin/Super Admin care about this
        if (sessionData.role !== 'SUPER_ADMIN' && sessionData.role !== 'ADMIN') {
            return NextResponse.json({ contributors: 0 });
        }

        const result = await db.execute(`
            SELECT COUNT(*) as count 
            FROM contributor_applications 
            WHERE status = 'pending'
        `);

        const count = parseInt(result.rows[0].count);

        return NextResponse.json({ contributors: count });
    } catch (error) {
        console.error('Error fetching pending counts:', error);
        return NextResponse.json({ contributors: 0 }, { status: 500 });
    }
}
