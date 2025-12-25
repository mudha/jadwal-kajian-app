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

// PATCH - Update admin role
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { role } = await request.json();
        const { id } = await params;

        if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
        }

        await db.execute({
            sql: 'UPDATE admins SET role = ? WHERE id = ?',
            args: [role, id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}

// DELETE - Remove admin
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

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
