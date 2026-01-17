import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const session = (await cookies()).get('admin_session');

    if (session) {
        try {
            // Parse the session data to get role and username
            const sessionData = JSON.parse(session.value);
            return NextResponse.json({
                isAdmin: true,
                role: sessionData.role || null,
                username: sessionData.username || null,
                fullName: sessionData.fullName || null
            });
        } catch (e) {
            // If parsing fails, return basic authenticated response
            return NextResponse.json({ isAdmin: true, role: null, username: null });
        }
    }

    return NextResponse.json({ isAdmin: false, role: null, username: null }, { status: 401 });
}
