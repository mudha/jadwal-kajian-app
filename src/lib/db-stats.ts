import db from '@/lib/db';
import { formatIndoDate } from '@/lib/date-utils';

export interface AdminStats {
    totalJadwal: number;
    jadwalHariIni: number;
    totalMasjid: number;
    totalUstadz: number;
    recentKajian: any[];
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
            recentRes
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM kajian'),
            db.execute({ sql: 'SELECT COUNT(*) as count FROM kajian WHERE date = ?', args: [todayStr] }),
            db.execute('SELECT COUNT(DISTINCT masjid) as count FROM kajian'),
            db.execute('SELECT COUNT(DISTINCT pemateri) as count FROM kajian'),
            db.execute('SELECT * FROM kajian ORDER BY id DESC LIMIT 5')
        ]);

        return {
            totalJadwal: Number(totalRes.rows[0].count),
            jadwalHariIni: Number(todayRes.rows[0].count),
            totalMasjid: Number(masjidRes.rows[0].count),
            totalUstadz: Number(ustadzRes.rows[0].count),
            recentKajian: recentRes.rows
        };
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return {
            totalJadwal: 0,
            jadwalHariIni: 0,
            totalMasjid: 0,
            totalUstadz: 0,
            recentKajian: []
        };
    }
}
