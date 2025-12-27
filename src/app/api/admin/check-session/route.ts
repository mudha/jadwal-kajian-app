import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const session = (await cookies()).get('admin_session');

    if (session) {
        // Valid enough for quick UX redirect check
        return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
}
