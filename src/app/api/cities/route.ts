
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db.execute('SELECT city, COUNT(*) as count FROM kajian WHERE city IS NOT NULL AND city != "" GROUP BY city ORDER BY city ASC');
        const cities = result.rows.map(row => ({ city: row.city as string, count: Number(row.count) }));
        return NextResponse.json(cities);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
    }
}
