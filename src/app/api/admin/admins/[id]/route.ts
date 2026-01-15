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

// PATCH - Update admin role or password
export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const params = await props.params;
        const { id } = params;
        const body = await request.json();

        // Handle Role Update
        if (body.role) {
            if (!['ADMIN', 'SUPER_ADMIN'].includes(body.role)) {
                return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
            }

            // Prevent changing own role
            const checkSelf = await db.execute({
                sql: 'SELECT username FROM admins WHERE id = ?',
                args: [id]
            });
            if (checkSelf.rows.length > 0 && checkSelf.rows[0].username === session.username) {
                return NextResponse.json({ error: 'Tidak bisa mengubah role sendiri' }, { status: 400 });
            }

            await db.execute({
                sql: 'UPDATE admins SET role = ? WHERE id = ?',
                args: [body.role, id],
            });
        }

        // Handle Password Update
        if (body.password) {
            if (body.password.length < 6) {
                return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
            }
            const hashedPassword = await bcrypt.hash(body.password, 10);
            await db.execute({
                sql: 'UPDATE admins SET password = ? WHERE id = ?',
                args: [hashedPassword, id]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}

// DELETE - Remove admin
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const params = await props.params;
        const { id } = params;

        // Prevent self-deletion
        const result = await db.execute({
            sql: 'SELECT username FROM admins WHERE id = ?',
            args: [id],
        });

        if (result.rows[0]?.username === session.username) {
            return NextResponse.json({ error: 'Tidak bisa menghapus akun sendiri' }, { status: 400 });
        }

        await db.execute({
            sql: 'DELETE FROM admins WHERE id = ?',
            args: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}
