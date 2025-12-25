import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all masjid with kajian count
export async function GET() {
    try {
        const masjidList = await db.execute(`
            SELECT 
                masjid as name,
                city,
                MAX(address) as address,
                MAX(gmapsUrl) as gmapsUrl,
                MAX(lat) as lat,
                MAX(lng) as lng,
                COUNT(*) as kajianCount
            FROM kajian
            WHERE masjid IS NOT NULL AND masjid != ''
            GROUP BY masjid, city
            ORDER BY masjid ASC
        `);

        // Simple hash function for generating unique IDs
        const simpleHash = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(36);
        };

        const formattedList = masjidList.rows.map((row: any, index: number) => {
            // Create a unique ID using name + city + a hash of the combination
            const baseId = `${row.name}-${row.city}`.replace(/\s+/g, '-').toLowerCase();
            const uniqueHash = simpleHash(`${row.name}|${row.city}|${row.address || ''}`);
            const id = `${baseId}-${uniqueHash}`;

            return {
                id: id,
                name: row.name,
                city: row.city || '',
                address: row.address || '',
                gmapsUrl: row.gmapsUrl || '',
                lat: row.lat,
                lng: row.lng,
                kajianCount: row.kajianCount || 0,
            };
        });

        return NextResponse.json(formattedList);
    } catch (error) {
        console.error('Error fetching masjid:', error);
        return NextResponse.json({ error: 'Failed to fetch masjid' }, { status: 500 });
    }
}

// POST - Add new masjid (this will be used when creating kajian)
export async function POST(request: Request) {
    try {
        const { name, city, address } = await request.json();

        if (!name || !city) {
            return NextResponse.json({ error: 'Name and city are required' }, { status: 400 });
        }

        // Check if masjid already exists
        const existing = await db.execute({
            sql: 'SELECT masjid FROM kajian WHERE masjid = ? AND city = ? LIMIT 1',
            args: [name, city],
        });

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Masjid already exists in this city' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Masjid data validated', name, city, address });
    } catch (error) {
        console.error('Error adding masjid:', error);
        return NextResponse.json({ error: 'Failed to add masjid' }, { status: 500 });
    }
}
