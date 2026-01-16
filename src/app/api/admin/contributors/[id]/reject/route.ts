import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin session
        const session = (await cookies()).get('admin_session');
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionData = JSON.parse(session.value);
        if (sessionData.role !== 'SUPER_ADMIN' && sessionData.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;

        // Update application status to rejected
        const result = await db.execute({
            sql: 'UPDATE contributor_applications SET status = ? WHERE id = ?',
            args: ['rejected', id]
        });

        if (result.rowsAffected === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Pendaftar ditolak'
        });

    } catch (error) {
        console.error('Reject error:', error);
        return NextResponse.json(
            { error: 'Gagal menolak pendaftar' },
            { status: 500 }
        );
    }
}
