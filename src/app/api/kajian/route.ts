import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { KajianEntry } from '@/lib/parser';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM kajian ORDER BY id DESC');

        // Convert integer booleans from SQLite back to actual booleans for JSON
        const rows = result.rows.map(row => ({
            ...row,
            khususAkhwat: !!row.khususAkhwat
        }));

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = (await cookies()).get('admin_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const body = await request.json();
        const entries: KajianEntry[] = Array.isArray(body) ? body : [body];

        // Batch insert using transactions
        const statements = entries.map(item => ({
            sql: `
        INSERT INTO kajian (region, city, masjid, address, gmapsUrl, lat, lng, pemateri, tema, waktu, cp, date, khususAkhwat, linkInfo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            args: [
                item.region,
                item.city,
                item.masjid,
                item.address,
                item.gmapsUrl,
                item.lat || null,
                item.lng || null,
                item.pemateri,
                item.tema,
                item.waktu,
                item.cp,
                item.date,
                item.khususAkhwat ? 1 : 0, // SQLite boolean as integer
                item.linkInfo || null
            ]
        }));

        await db.batch(statements);

        return NextResponse.json({ success: true, count: entries.length });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await db.execute('DELETE FROM kajian');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
