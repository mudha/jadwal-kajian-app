import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = (await cookies()).get('admin_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await db.execute(`
            SELECT * FROM contributor_applications 
            WHERE status = 'pending' 
            ORDER BY id DESC
        `);
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = (await cookies()).get('admin_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, action } = body;

        // Fetch application
        const appResult = await db.execute({
            sql: 'SELECT * FROM contributor_applications WHERE id = ?',
            args: [id]
        });

        if (appResult.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const application = appResult.rows[0];

        if (action === 'approve') {
            // Check username availability
            const existingUser = await db.execute({
                sql: 'SELECT id FROM admins WHERE username = ?',
                args: [application.username]
            });

            if (existingUser.rows.length > 0) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
            }

            // Create admin account
            const hashedPassword = await bcrypt.hash(application.password as string, 10);
            await db.execute({
                sql: `INSERT INTO admins (username, password, fullName, email, role, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                args: [
                    application.username as string,
                    hashedPassword,
                    application.full_name as string, // Note: DB usually has fullName, check register api?
                    application.email as string,
                    'CONTRIBUTOR'
                ]
            });

            // Update status
            await db.execute({
                sql: `UPDATE contributor_applications SET status = 'approved' WHERE id = ?`,
                args: [id]
            });
        } else if (action === 'reject') {
            await db.execute({
                sql: `UPDATE contributor_applications SET status = 'rejected' WHERE id = ?`,
                args: [id]
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
