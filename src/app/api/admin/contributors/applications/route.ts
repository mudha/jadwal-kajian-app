import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET() {
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

        // Fetch pending applications
        const result = await db.execute(`
            SELECT id, username, email, fullName, region, city, phoneNumber, motivation, createdAt, status
            FROM contributor_applications
            ORDER BY 
                CASE status
                    WHEN 'pending' THEN 1
                    WHEN 'approved' THEN 2
                    WHEN 'rejected' THEN 3
                END,
                createdAt DESC
        `);

        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Fetch applications error:', error);
        return NextResponse.json(
            { error: 'Gagal memuat pendaftar' },
            { status: 500 }
        );
    }
}
