import { NextResponse } from 'next/server';
import db from '@/lib/db';

const DEFAULT_LAYOUT = {
    sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'PrayerTimesWidget', 'ContactWidget'],
    main: ['HeroWidget', 'QuickMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'KajianListWidget'],
    mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
    hidden: [],
    hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile'],
    hidden_menu: []
};

export async function GET() {
    try {
        const result = await db.execute("SELECT value FROM settings WHERE key = 'homepage_layout'");
        console.log('[API/Layout/GET] Rows found:', result.rows.length);

        if (result.rows.length > 0 && result.rows[0].value) {
            const layoutData = JSON.parse(result.rows[0].value as string);
            console.log('[API/Layout/GET] Returning layout:', JSON.stringify(layoutData, null, 2));
            return NextResponse.json(layoutData);
        }

        // Return default if not set
        console.log('[API/Layout/GET] No layout in DB, returning DEFAULT_LAYOUT');
        return NextResponse.json(DEFAULT_LAYOUT);
    } catch (error) {
        console.error('[API/Layout/GET] Error fetching layout settings:', error);
        return NextResponse.json(DEFAULT_LAYOUT, { status: 200 }); // Fallback to default on error
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[API/Layout/POST] Saving layout:', JSON.stringify(body, null, 2));

        const layoutJson = JSON.stringify(body);

        await db.execute({
            sql: "INSERT INTO settings (key, value) VALUES ('homepage_layout', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
            args: [layoutJson, layoutJson]
        });

        console.log('[API/Layout/POST] Layout saved successfully');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API/Layout/POST] Error saving layout settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
