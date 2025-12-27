import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Get autocomplete suggestions for masjid and pemateri
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'masjid' or 'pemateri'
        const query = searchParams.get('q') || '';

        if (!type || !['masjid', 'pemateri'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const field = type === 'masjid' ? 'masjid' : 'pemateri';

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

        // Debug log
        if (type === 'masjid' && result.rows.length > 0) {
            console.log('Suggestion debug:', result.rows[0]);
        }

        const suggestions = result.rows.map((row: any) => ({
            value: row.value,
            count: row.count,
            // Pass all other fields
            ...row
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
