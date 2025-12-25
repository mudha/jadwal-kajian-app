import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all masjid with kajian count
export async function GET() {
    try {
        const masjidList = await db.execute(`
            SELECT 
                DISTINCT masjid as name,
                city,
                address,
                gmapsUrl,
                COUNT(*) as kajianCount
            FROM kajian
            WHERE masjid IS NOT NULL AND masjid != ''
            GROUP BY masjid, city, address, gmapsUrl
            ORDER BY masjid ASC
        `);

        const formattedList = masjidList.rows.map((row: any, index: number) => ({
            id: index + 1,
            name: row.name,
            city: row.city || '',
            address: row.address || '',
            gmapsUrl: row.gmapsUrl || '',
            kajianCount: row.kajianCount || 0,
        }));

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
