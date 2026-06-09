import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { indonesianCities } from '@/data/cities';
import { requireAdminSession } from '@/lib/auth';

// GET - Get autocomplete suggestions for masjid, pemateri, and city
export async function GET(request: Request) {
    const session = await requireAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'masjid', 'pemateri', 'city'
        const query = searchParams.get('q') || '';

        if (!type || !['masjid', 'pemateri', 'city'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        let sql = '';
        let args = [`%${query}%`];

        if (type === 'masjid') {
            sql = `
                SELECT 
                    masjid as value, 
                    COUNT(*) as count,
                    (SELECT address FROM kajian k2 WHERE k2.masjid = k.masjid AND address IS NOT NULL AND address != '' ORDER BY k2.id DESC LIMIT 1) as address,
                    (SELECT gmapsUrl FROM kajian k2 WHERE k2.masjid = k.masjid AND gmapsUrl IS NOT NULL AND gmapsUrl != '' ORDER BY k2.id DESC LIMIT 1) as gmapsUrl,
                    (SELECT city FROM kajian k2 WHERE k2.masjid = k.masjid AND city IS NOT NULL AND city != '' ORDER BY k2.id DESC LIMIT 1) as city,
                    (SELECT lat FROM kajian k2 WHERE k2.masjid = k.masjid AND lat IS NOT NULL ORDER BY k2.id DESC LIMIT 1) as lat,
                    (SELECT lng FROM kajian k2 WHERE k2.masjid = k.masjid AND lng IS NOT NULL ORDER BY k2.id DESC LIMIT 1) as lng
                FROM kajian k
                WHERE masjid IS NOT NULL 
                AND masjid != '' 
                AND LOWER(masjid) LIKE LOWER(?)
                GROUP BY masjid
                ORDER BY count DESC, masjid ASC
                LIMIT 10
            `;
        } else if (type === 'city') {
            sql = `
                SELECT city as value, COUNT(*) as count
                FROM kajian
                WHERE city IS NOT NULL 
                AND city != '' 
                AND LOWER(city) LIKE LOWER(?)
                GROUP BY city
                ORDER BY count DESC, city ASC
                LIMIT 20
            `;
        } else {
            sql = `
                SELECT DISTINCT pemateri as value, COUNT(*) as count
                FROM kajian
                WHERE pemateri IS NOT NULL 
                AND pemateri != '' 
                AND LOWER(pemateri) LIKE LOWER(?)
                GROUP BY pemateri
                ORDER BY count DESC, pemateri ASC
                LIMIT 10
            `;
        }

        const result = await db.execute({
            sql,
            args
        });

        let suggestions = result.rows.map((row: any) => ({
            value: row.value,
            count: row.count,
            ...row
        }));

        // For city, merge with static list
        if (type === 'city') {
            // 1. Get DB values map
            const dbMap = new Map(suggestions.map((s: any) => [s.value.toLowerCase(), s]));

            // 2. Filter static list
            const filteredStatic = indonesianCities
                .filter(city => city.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10); // Limit static matches

            // 3. Merge
            for (const city of filteredStatic) {
                if (!dbMap.has(city.toLowerCase())) {
                    suggestions.push({ value: city, count: 0 });
                }
            }

            // 4. Sort (High count first, then alphabetical)
            suggestions.sort((a: any, b: any) => {
                if (b.count !== a.count) return b.count - a.count;
                return a.value.localeCompare(b.value);
            });

            // 5. Limit final result
            suggestions = suggestions.slice(0, 10);
        }

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
