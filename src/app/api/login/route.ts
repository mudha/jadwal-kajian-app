import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { ADMIN_SESSION_COOKIE, serializeAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username: rawUsername, password } = await request.json();
        const username = rawUsername.trim().toLowerCase();

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
        }

        if (isValid) {
            const response = NextResponse.json({ success: true });

            // Set a secure cookie
            const cookieStore = await cookies();
            const sessionData = JSON.stringify({
                isLoggedIn: true,
                id: Number(admin.id),
                username: admin.username as string,
                role: (admin.role as string) || 'ADMIN',
                fullName: admin.fullName as string | null
            });

            cookieStore.set(ADMIN_SESSION_COOKIE, serializeAdminSession(JSON.parse(sessionData)), {
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
    (await cookies()).delete(ADMIN_SESSION_COOKIE);
    return NextResponse.json({ success: true });
}
