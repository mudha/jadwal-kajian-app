import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import db from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

async function getAnalyticsData() {
    try {
        // 1. Total Visits (All Time)
        const totalVisitsRes = await db.execute("SELECT COUNT(*) as count FROM analytics");
        const totalVisits = totalVisitsRes.rows[0].count;

        // 2. Visits Today
        const todayRes = await db.execute(`
             SELECT COUNT(*) as count FROM analytics 
             WHERE date(timestamp) = date('now')
         `);
        const todayVisits = todayRes.rows[0].count;

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

        return {
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
        };
    } catch (e) {
        console.error(e);
        return {
            summary: { totalVisits: 0, todayVisits: 0, uniqueVisitors: 0 },
            charts: { visits: [], devices: [], cities: [], paths: [] }
        };
    }
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="space-y-8 p-8">
            <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Statistik Pengunjung</h1>
                    <p className="text-slate-500">Pantau performa dan traffic aplikasi secara real-time</p>
                </div>
            </div>

            <AnalyticsDashboard data={data} />
        </div>
    );
}
