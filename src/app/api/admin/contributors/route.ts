import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await db.execute(`
            SELECT 
                a.id, 
                a.username, 
                a.fullName, 
                a.role,
                (SELECT COUNT(*) FROM kajian k WHERE k.created_by = a.id) as total_kajian 
            FROM admins a
            ORDER BY total_kajian DESC, a.username ASC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
