import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!session) return null;
    try {
        return JSON.parse(session.value);
    } catch (e) {
        return null;
    }
}

// GET - List all admins
export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const result = await db.execute('SELECT id, username, email, role, createdAt FROM admins ORDER BY createdAt DESC');

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching admins:', error);
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}
