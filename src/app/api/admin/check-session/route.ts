import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('admin_session');

        return NextResponse.json({
            isAdmin: !!session,
        });
    } catch (error) {
        return NextResponse.json({ isAdmin: false });
    }
}
