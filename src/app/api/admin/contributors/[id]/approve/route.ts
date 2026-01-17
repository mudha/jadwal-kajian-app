import { NextResponse } from 'next/server';
import { sendApprovalEmail } from '@/lib/email';
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

        // Validate required fields
        if (!app.username || !app.email || !app.password) {
            return NextResponse.json({
                error: 'Data pendaftar tidak lengkap (username/email/password kosong)'
            }, { status: 400 });
        }

        // Check if admin account already exists
        const existingAdminResult = await db.execute({
            sql: 'SELECT * FROM admins WHERE username = ? OR email = ?',
            args: [app.username, app.email]
        });

        if (existingAdminResult.rows.length > 0) {
            const existingAdmin = existingAdminResult.rows[0];
            // If exists and email matches, likely a retry. Skip insert.
            if (existingAdmin.email === app.email) {
                console.log('User already exists in admins, skipping insert (handling retry/zombie state)');
            } else {
                // If exists but email mismatch, or username taken by someone else
                return NextResponse.json(
                    { error: 'Username atau email sudah digunakan oleh admin lain' },
                    { status: 409 }
                );
            }
        } else {
            // Create admin account with CONTRIBUTOR role if not exists
            await db.execute({
                sql: `INSERT INTO admins (username, email, password, role, assignedRegion, fullName) 
                      VALUES (?, ?, ?, 'CONTRIBUTOR', ?, ?)`,
                args: [(app.username as string).trim(), app.email, app.password, app.region, app.fullName]
            });
        }

        // Update application status
        await db.execute({
            sql: 'UPDATE contributor_applications SET status = ? WHERE id = ?',
            args: ['approved', id]
        });

        // Send email notification
        try {
            await sendApprovalEmail(app.email as string, (app.fullName as string) || (app.username as string));
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        return NextResponse.json({
            message: 'Kontributor berhasil disetujui',
            username: app.username
        });

    } catch (error: any) {
        console.error('Approve error details:', error);
        return NextResponse.json(
            {
                error: 'Gagal menyetujui pendaftar',
                details: error.message || 'Unknown error'
            },
            { status: 500 }
        );
    }
}
