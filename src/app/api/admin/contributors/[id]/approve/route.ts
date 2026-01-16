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

        // Get application details
        const appResult = await db.execute({
            sql: 'SELECT * FROM contributor_applications WHERE id = ?',
            args: [id]
        });

        if (appResult.rows.length === 0) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const app = appResult.rows[0];

        // Check if already approved
        if (app.status === 'approved') {
            return NextResponse.json({ error: 'Already approved' }, { status: 400 });
        }

        // Create admin account with CONTRIBUTOR role
        await db.execute({
            sql: `INSERT INTO admins (username, email, password, role, assignedRegion, fullName) 
                  VALUES (?, ?, ?, 'CONTRIBUTOR', ?, ?)`,
            args: [app.username, app.email, app.password, app.region, app.fullName]
        });

        // Update application status
        await db.execute({
            sql: 'UPDATE contributor_applications SET status = ? WHERE id = ?',
            args: ['approved', id]
        });

        // TODO: Send email notification to contributor

        return NextResponse.json({
            message: 'Kontributor berhasil disetujui',
            username: app.username
        });

    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json(
            { error: 'Gagal menyetujui pendaftar' },
            { status: 500 }
        );
    }
}
