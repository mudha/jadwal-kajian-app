import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        if (!session) {
            return NextResponse.json({ isAdmin: false, role: null });
        }

        try {
            const data = JSON.parse(session.value);
            return NextResponse.json({
                isAdmin: true,
                username: data.username,
                role: data.role || 'ADMIN',
            });
        } catch (e) {
            // Fallback for old 'true' cookie format
            return NextResponse.json({
                isAdmin: session.value === 'true',
                role: 'ADMIN',
            });
        }
    } catch (error) {
        return NextResponse.json({ isAdmin: false, role: null });
    }
}
