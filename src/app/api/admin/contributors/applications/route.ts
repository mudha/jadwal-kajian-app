import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
    try {
        // Check admin session
        const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
