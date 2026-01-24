import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        await db.execute("ALTER TABLE kajian ADD COLUMN created_by INTEGER");
        return NextResponse.json({ success: true, message: "Migration successful: Added created_by column" });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed or column already exists" }, { status: 500 });
    }
}
