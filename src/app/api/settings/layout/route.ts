import { NextResponse } from 'next/server';
import db from '@/lib/db';

const DEFAULT_LAYOUT = {
    sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'PrayerTimesWidget', 'ContactWidget'],
    main: ['HeroWidget', 'QuickMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'KajianListWidget'],
    mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
    hidden: [],
    hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile']
};

export async function GET() {
    try {
        const result = await db.execute("SELECT value FROM settings WHERE key = 'homepage_layout'");

        if (result.rows.length > 0 && result.rows[0].value) {
            return NextResponse.json(JSON.parse(result.rows[0].value as string));
        }

        // Return default if not set
        return NextResponse.json(DEFAULT_LAYOUT);
    } catch (error) {
        console.error('Error fetching layout settings:', error);
        return NextResponse.json(DEFAULT_LAYOUT, { status: 200 }); // Fallback to default on error
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const layoutJson = JSON.stringify(body);

        await db.execute({
            sql: "INSERT INTO settings (key, value) VALUES ('homepage_layout', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
            args: [layoutJson, layoutJson]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving layout settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
