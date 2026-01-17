import db from '@/lib/db';
import { formatIndoDate } from '@/lib/date-utils';

export interface DashboardStats {
    totalJadwal: number;
    jadwalHariIni: number;
    jadwalTrend: string;
    totalMasjid: number;
    totalUstadz: number;
    recentKajian: any[];
    totalVisitors: number;
    visitors24h: number;
    topDevices: any[];
    topBrowsers: any[];
    topCities: any[];
    topCountries: any[];
    dailyViews: any[];
    weeklyViews: any[];
    monthlyViews: any[];
}

export async function getAdminStats(): Promise<DashboardStats> {
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const todayStr = formatIndoDate(today);
        const yesterdayStr = formatIndoDate(yesterday);

        // Run parallel queries
        const [
            totalRes,
            todayRes,
            yesterdayRes,
            masjidRes,
            ustadzRes,
            recentRes,
            totalVisRes,
            vis24Res,
            devicesRes,
            browsersRes,
            citiesRes,
            countriesRes,
            dailyRes,
            weeklyRes,
            monthlyRes
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM kajian'),
            db.execute({ sql: 'SELECT COUNT(*) as count FROM kajian WHERE date = ?', args: [todayStr] }),
            db.execute({ sql: 'SELECT COUNT(*) as count FROM kajian WHERE date = ?', args: [yesterdayStr] }),
            db.execute('SELECT COUNT(DISTINCT masjid) as count FROM kajian'),
            db.execute('SELECT COUNT(DISTINCT pemateri) as count FROM kajian'),
            db.execute(`
                SELECT k.*, 
                (SELECT COUNT(*) FROM analytics a WHERE a.path = '/kajian/' || k.id) as view_count 
                FROM kajian k 
                ORDER BY k.id DESC 
                LIMIT 5
            `),
            db.execute('SELECT COUNT(*) as count FROM analytics'),
            db.execute('SELECT COUNT(*) as count FROM analytics WHERE timestamp > datetime("now", "-1 day")'),
            db.execute('SELECT ua_device as name, COUNT(*) as count FROM analytics GROUP BY ua_device ORDER BY count DESC LIMIT 5'),
            db.execute('SELECT ua_browser as name, COUNT(*) as count FROM analytics GROUP BY ua_browser ORDER BY count DESC LIMIT 5'),
            db.execute('SELECT city as name, COUNT(*) as count FROM analytics GROUP BY city ORDER BY count DESC LIMIT 5'),
            db.execute('SELECT country as name, COUNT(*) as count FROM analytics GROUP BY country ORDER BY count DESC LIMIT 5'),
            db.execute(`
                SELECT strftime('%Y-%m-%d', timestamp) as date, COUNT(*) as count 
                FROM analytics 
                WHERE timestamp > datetime('now', '-7 days')
                GROUP BY date 
                ORDER BY date ASC
            `),
            db.execute(`
                SELECT strftime('%Y-%W', timestamp) as date, COUNT(*) as count 
                FROM analytics 
                WHERE timestamp > datetime('now', '-8 weeks')
                GROUP BY date 
                ORDER BY date ASC
            `),
            db.execute(`
                SELECT strftime('%Y-%m', timestamp) as date, COUNT(*) as count 
                FROM analytics 
                WHERE timestamp > datetime('now', '-12 months')
                GROUP BY date 
                ORDER BY date ASC
            `)
        ]);

        const countToday = Number(todayRes.rows[0].count);
        const countYesterday = Number(yesterdayRes.rows[0].count);

        let trend = "Sama dengan kemarin";
        if (countYesterday > 0) {
            const diff = ((countToday - countYesterday) / countYesterday) * 100;
            const sign = diff > 0 ? "+" : "";
            trend = `${sign}${diff.toFixed(0)}% dari kemarin`;
        } else if (countToday > 0) {
            trend = "+100% dari kemarin";
        } else if (countYesterday > 0) {
            trend = "-100% dari kemarin";
        }

        const stats = {
            totalJadwal: Number(totalRes.rows[0].count),
            jadwalHariIni: countToday,
            jadwalTrend: trend,
            totalMasjid: Number(masjidRes.rows[0].count),
            totalUstadz: Number(ustadzRes.rows[0].count),
            recentKajian: recentRes.rows,
            totalVisitors: Number(totalVisRes.rows[0].count),
            visitors24h: Number(vis24Res.rows[0].count),
            topDevices: devicesRes.rows,
            topBrowsers: browsersRes.rows,
            topCities: citiesRes.rows,
            topCountries: countriesRes.rows,
            dailyViews: dailyRes.rows,
            weeklyViews: weeklyRes.rows,
            monthlyViews: monthlyRes.rows
        };

        // Serialize to plain objects to avoid "Classes not supported" error in Next.js Client Components
        return JSON.parse(JSON.stringify(stats));
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return {
            totalJadwal: 0,
            jadwalHariIni: 0,
            jadwalTrend: "0% dari kemarin",
            totalMasjid: 0,
            totalUstadz: 0,
            recentKajian: [],
            totalVisitors: 0,
            visitors24h: 0,
            topDevices: [],
            topBrowsers: [],
            topCities: [],
            topCountries: [],
            dailyViews: [],
            weeklyViews: [],
            monthlyViews: []
        };
    }
}
