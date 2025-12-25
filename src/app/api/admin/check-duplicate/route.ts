import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { masjid, pemateri, date, waktu } = await request.json();

        // Check for duplicates based on masjid, pemateri, date, and waktu
        const duplicates = await db.execute({
            sql: `
                SELECT id, masjid, pemateri, tema, date, waktu, city
                FROM kajian
                WHERE masjid = ? AND pemateri = ? AND date = ? AND waktu = ?
                LIMIT 5
            `,
            args: [masjid, pemateri, date, waktu],
        });

        if (duplicates.rows.length > 0) {
            return NextResponse.json({
                isDuplicate: true,
                duplicates: duplicates.rows,
            });
        }

        return NextResponse.json({ isDuplicate: false });
    } catch (error) {
        console.error('Error checking duplicates:', error);
        return NextResponse.json({ error: 'Failed to check duplicates' }, { status: 500 });
    }
}
