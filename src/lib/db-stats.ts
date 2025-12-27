import db from '@/lib/db';
import { formatIndoDate } from '@/lib/date-utils';

export interface AdminStats {
    totalJadwal: number;
    jadwalHariIni: number;
    totalMasjid: number;
    totalUstadz: number;
    recentKajian: any[];
    totalVisitors: number;
    visitors24h: number;
    topDevices: any[];
    topBrowsers: any[];
    topCities: any[];
}

export async function getAdminStats(): Promise<AdminStats> {
    try {
        const todayStr = formatIndoDate(new Date());

        // Run parallel queries
        const [
            totalRes,
            todayRes,
            masjidRes,
            ustadzRes,
            recentRes,
            totalVisRes,
            vis24Res,
            devicesRes,
            browsersRes,
            citiesRes
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM kajian'),
            db.execute({ sql: 'SELECT COUNT(*) as count FROM kajian WHERE date = ?', args: [todayStr] }),
            db.execute('SELECT COUNT(DISTINCT masjid) as count FROM kajian'),
            db.execute('SELECT COUNT(DISTINCT pemateri) as count FROM kajian'),
            db.execute('SELECT * FROM kajian ORDER BY id DESC LIMIT 5'),
            db.execute('SELECT COUNT(*) as count FROM analytics'),
            db.execute('SELECT COUNT(*) as count FROM analytics WHERE timestamp > datetime("now", "-1 day")'),
            db.execute('SELECT ua_device as name, COUNT(*) as count FROM analytics GROUP BY ua_device ORDER BY count DESC LIMIT 5'),
            db.execute('SELECT ua_browser as name, COUNT(*) as count FROM analytics GROUP BY ua_browser ORDER BY count DESC LIMIT 5'),
            db.execute('SELECT city as name, COUNT(*) as count FROM analytics GROUP BY city ORDER BY count DESC LIMIT 5')
        ]);

        return {
            totalJadwal: Number(totalRes.rows[0].count),
            jadwalHariIni: Number(todayRes.rows[0].count),
            totalMasjid: Number(masjidRes.rows[0].count),
            totalUstadz: Number(ustadzRes.rows[0].count),
            recentKajian: recentRes.rows,
            totalVisitors: Number(totalVisRes.rows[0].count),
            visitors24h: Number(vis24Res.rows[0].count),
            topDevices: devicesRes.rows,
            topBrowsers: browsersRes.rows,
            topCities: citiesRes.rows
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return {
            totalJadwal: 0,
            jadwalHariIni: 0,
            totalMasjid: 0,
            totalUstadz: 0,
            recentKajian: [],
            totalVisitors: 0,
            visitors24h: 0,
            topDevices: [],
            topBrowsers: [],
            topCities: []
        };
    }
}
