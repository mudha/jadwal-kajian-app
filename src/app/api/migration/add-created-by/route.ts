import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdminSession } from '@/lib/auth';

export async function GET() {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await db.execute("ALTER TABLE kajian ADD COLUMN created_by INTEGER");
        return NextResponse.json({ success: true, message: "Migration successful: Added created_by column" });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed or column already exists" }, { status: 500 });
    }
}
