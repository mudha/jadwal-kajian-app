import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

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

// POST - Create new admin
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { username, password, role } = await request.json();

        // Basic validation
        if (!username || username.length < 3) {
            return NextResponse.json({ error: 'Username minimal 3 karakter' }, { status: 400 });
        }
        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
        }

        // Check availability
        const existing = await db.execute({
            sql: 'SELECT id FROM admins WHERE username = ?',
            args: [username]
        });

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const finalRole = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN';

        await db.execute({
            sql: 'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            args: [username, hashedPassword, finalRole]
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}
