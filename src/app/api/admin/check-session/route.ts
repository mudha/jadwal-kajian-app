import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
    const session = await getAdminSession();

    if (session) {
        return NextResponse.json({
            isAdmin: true,
            role: session.role,
            username: session.username,
            fullName: session.fullName || null
        });
    }

    return NextResponse.json({ isAdmin: false, role: null, username: null }, { status: 401 });
}
