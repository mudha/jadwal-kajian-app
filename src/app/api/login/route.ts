import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // 1. Try to find user in database
        const result = await db.execute({
            sql: 'SELECT * FROM admins WHERE username = ?',
            args: [username],
        });

        const admin = result.rows[0];
        let isValid = false;

        if (admin) {
            // Compare hashed password from DB
            isValid = await bcrypt.compare(password, admin.password as string);
        } else if (username === 'admin' && password === 'admin123') {
            // Fallback for default admin if no DB user found
            isValid = true;
        }

        if (isValid) {
            const response = NextResponse.json({ success: true });

            // Set a secure cookie
            const cookieStore = await cookies();
            const sessionData = JSON.stringify({
                isLoggedIn: true,
                username: admin ? (admin.username as string) : 'admin',
                role: admin ? (admin.role as string) : 'SUPER_ADMIN' // 'admin' hardcoded is Super Admin
            });

            cookieStore.set('admin_session', sessionData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ error: 'Username atau Password salah' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}

export async function DELETE() {
    (await cookies()).delete('admin_session');
    return NextResponse.json({ success: true });
}
