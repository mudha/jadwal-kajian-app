import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';

const SETTING_KEY = 'quick_menu_items';

export async function GET() {
    try {
        const result = await db.execute({
            sql: 'SELECT value FROM settings WHERE key = ?',
            args: [SETTING_KEY],
        });

        if (result.rows.length > 0) {
            return NextResponse.json(JSON.parse(result.rows[0].value as string));
        }

        // Return null if not set, frontend will use defaults
        return NextResponse.json(null);
    } catch (error) {
        console.error('Error fetching quick menu settings:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await requireAdminSession(['SUPER_ADMIN', 'ADMIN']);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json(); // Array of menu items

        await db.execute({
            sql: `INSERT INTO settings (key, value) VALUES (?, ?) 
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
            args: [SETTING_KEY, JSON.stringify(body)],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving quick menu settings:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
