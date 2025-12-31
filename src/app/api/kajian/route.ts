import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { KajianEntry } from '@/lib/parser';
import { cookies } from 'next/headers';
import { formatMasjidName } from '@/lib/date-utils';

// Enable ISR with 60 second revalidation for better performance under high traffic
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM kajian ORDER BY id DESC');

        // Convert integer booleans from SQLite back to actual booleans for JSON
        const rows = result.rows.map(row => ({
            ...row,
            khususAkhwat: !!row.khususAkhwat,
            isOnline: !!row.isOnline,
            isKidsFriendly: !!row.isKidsFriendly
        }));

        return NextResponse.json(rows, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
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

        // Check for duplicates
        const duplicates: any[] = [];
        const existingKajian = await db.execute('SELECT id, masjid, date, waktu, tema, pemateri FROM kajian');

        for (const entry of entries) {
            const duplicate = existingKajian.rows.find((existing: any) =>
                existing.masjid === formatMasjidName(entry.masjid) &&
                existing.date === entry.date &&
                existing.waktu === entry.waktu
            );

            if (duplicate) {
                duplicates.push({
                    new: {
                        masjid: formatMasjidName(entry.masjid),
                        date: entry.date,
                        waktu: entry.waktu,
                        tema: entry.tema,
                        pemateri: entry.pemateri
                    },
                    existing: {
                        id: duplicate.id,
                        masjid: duplicate.masjid,
                        date: duplicate.date,
                        waktu: duplicate.waktu,
                        tema: duplicate.tema,
                        pemateri: duplicate.pemateri
                    }
                });
            }
        }

        // If duplicates found, return them for user confirmation
        if (duplicates.length > 0) {
            return NextResponse.json({
                duplicates,
                message: 'Ditemukan kajian duplikat. Masjid, tanggal, dan waktu yang sama sudah ada di database.'
            }, { status: 409 });
        }

        // Batch insert using transactions
        const statements = entries.map(item => ({
            sql: `
        INSERT INTO kajian (region, city, masjid, address, gmapsUrl, lat, lng, pemateri, tema, waktu, cp, cp2, cp3, date, khususAkhwat, linkInfo, imageUrl, isOnline, isKidsFriendly, catatan)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            args: [
                item.region,
                item.city,
                formatMasjidName(item.masjid),
                item.address === item.masjid ? formatMasjidName(item.masjid) : item.address,
                item.gmapsUrl,
                item.lat || null,
                item.lng || null,
                item.pemateri,
                item.tema,
                item.waktu,
                item.cp,
                item.cp2 || null,
                item.cp3 || null,
                item.date,
                item.khususAkhwat ? 1 : 0, // SQLite boolean as integer
                item.linkInfo || null,
                item.imageUrl || null,
                item.isOnline ? 1 : 0,
                item.isKidsFriendly ? 1 : 0,
                item.catatan || null
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
