import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin session
        const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
