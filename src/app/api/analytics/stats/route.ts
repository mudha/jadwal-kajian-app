import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Total Visits (All Time)
        const totalVisitsRes = await db.execute("SELECT COUNT(*) as count FROM analytics");
        const totalVisits = totalVisitsRes.rows[0].count;

        // 2. Visits Today
        const todayRes = await db.execute(`
            SELECT COUNT(*) as count FROM analytics 
            WHERE date(timestamp) = date('now')
        `);
        const todayVisits = todayRes.rows[0].count; // SQLite uses UTC usually, might need 'localtime' if configured, but default is fine for relative checks

        // 3. Unique Visitors (All Time)
        const uniqueRes = await db.execute("SELECT COUNT(DISTINCT ip_hash) as count FROM analytics");
        const uniqueVisitors = uniqueRes.rows[0].count;

        // 4. Visits Over Time (Last 7 Days)
        const visitsByDateRes = await db.execute(`
            SELECT date(timestamp) as date, COUNT(*) as count 
            FROM analytics 
            GROUP BY date(timestamp) 
            ORDER BY date(timestamp) DESC 
            LIMIT 7
        `);
        const visitsChart = visitsByDateRes.rows.reverse();

        // 5. Top Devices
        const deviceRes = await db.execute(`
            SELECT ua_device as name, COUNT(*) as value 
            FROM analytics 
            GROUP BY ua_device 
            ORDER BY value DESC
        `);

        // 6. Top Cities
        const cityRes = await db.execute(`
            SELECT city as name, COUNT(*) as value 
            FROM analytics 
            WHERE city != 'Unknown'
            GROUP BY city 
            ORDER BY value DESC 
            LIMIT 5
        `);

        // 7. Top Paths
        const pathRes = await db.execute(`
            SELECT path as name, COUNT(*) as value
            FROM analytics
            GROUP BY path
            ORDER BY value DESC
            LIMIT 5
        `);

        return NextResponse.json({
            summary: {
                totalVisits,
                todayVisits,
                uniqueVisitors
            },
            charts: {
                visits: visitsChart,
                devices: deviceRes.rows,
                cities: cityRes.rows,
                paths: pathRes.rows
            }
        });

    } catch (e) {
        console.error('Analytics Stats Error:', e);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
