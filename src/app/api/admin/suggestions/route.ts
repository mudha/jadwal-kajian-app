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

        // Get distinct values that match the query
        const result = await db.execute({
            sql: `
                SELECT DISTINCT ${field} as value, COUNT(*) as count
                FROM kajian
                WHERE ${field} IS NOT NULL 
                AND ${field} != '' 
                AND LOWER(${field}) LIKE LOWER(?)
                GROUP BY ${field}
                ORDER BY count DESC, ${field} ASC
                LIMIT 10
            `,
            args: [`%${query}%`],
        });

        const suggestions = result.rows.map((row: any) => ({
            value: row.value,
            count: row.count,
        }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
