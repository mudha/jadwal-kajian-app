import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch all ustadz with kajian count
export async function GET() {
    try {
        const ustadzList = await db.execute(`
            SELECT 
                DISTINCT pemateri as name,
                COUNT(*) as kajianCount
            FROM kajian
            WHERE pemateri IS NOT NULL AND pemateri != ''
            GROUP BY pemateri
            ORDER BY pemateri ASC
        `);

        const formattedList = ustadzList.rows.map((row: any, index: number) => ({
            id: index + 1,
            name: row.name,
            kajianCount: row.kajianCount || 0,
        }));

        return NextResponse.json(formattedList);
    } catch (error) {
        console.error('Error fetching ustadz:', error);
        return NextResponse.json({ error: 'Failed to fetch ustadz' }, { status: 500 });
    }
}

// POST - Add new ustadz (this will be used when creating kajian)
export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check if ustadz already exists
        const existing = await db.execute({
            sql: 'SELECT pemateri FROM kajian WHERE pemateri = ? LIMIT 1',
            args: [name],
        });

        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Ustadz already exists' }, { status: 400 });
        }

        return NextResponse.json({ message: 'Ustadz name validated', name });
    } catch (error) {
        console.error('Error adding ustadz:', error);
        return NextResponse.json({ error: 'Failed to add ustadz' }, { status: 500 });
    }
}
