import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const adminId = Number(id);

        if (isNaN(adminId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        // Get Admin Details
        const adminResult = await db.execute({
            sql: 'SELECT id, username, fullName, role, createdAt FROM admins WHERE id = ?',
            args: [adminId]
        });

        if (adminResult.rows.length === 0) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        const admin = adminResult.rows[0];

        // Get Kajian List created by this admin
        const kajianResult = await db.execute({
            sql: 'SELECT * FROM kajian WHERE created_by = ? ORDER BY id DESC',
            args: [adminId]
        });

        const rows = kajianResult.rows.map(row => ({
            ...row,
            date: (row.date as string)?.replace(/Minggu/gi, 'Ahad'),
            khususAkhwat: !!row.khususAkhwat,
            isOnline: !!row.isOnline,
            isKidsFriendly: !!row.isKidsFriendly,
            is_canceled: !!row.is_canceled
        }));

        return NextResponse.json({
            admin,
            kajian: rows
        });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
