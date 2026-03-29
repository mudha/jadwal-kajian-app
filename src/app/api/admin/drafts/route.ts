import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute(`
            SELECT * FROM kajian_drafts 
            WHERE status = 'pending' 
            ORDER BY createdAt DESC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
    }
}
