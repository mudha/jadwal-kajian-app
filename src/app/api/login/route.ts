import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Hardcoded simple password for admin
        if (password === 'admin123') {
            const response = NextResponse.json({ success: true });

            // Set a secure cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'System Error' }, { status: 500 });
    }
}

export async function DELETE() {
    (await cookies()).delete('admin_session');
    return NextResponse.json({ success: true });
}
