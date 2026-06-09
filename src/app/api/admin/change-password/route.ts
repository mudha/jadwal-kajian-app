import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requireAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // 1. Check Session
        const session = await requireAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const username = session.username;

        if (!username) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
        }

        // 2. Parse Body
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Password lama dan baru harus diisi' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
        }

        // 3. Get User from DB
        const result = await db.execute({
            sql: 'SELECT * FROM admins WHERE username = ?',
            args: [username]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        const user = result.rows[0];

        // 4. Verify Current Password
        const isValid = await bcrypt.compare(currentPassword, user.password as string);

        if (!isValid) {
            return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
        }

        // 5. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 6. Update Password
        await db.execute({
            sql: 'UPDATE admins SET password = ? WHERE username = ?',
            args: [hashedPassword, username]
        });

        return NextResponse.json({ message: 'Password berhasil diubah' });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
    }
}
