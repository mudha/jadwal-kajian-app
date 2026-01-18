import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { KajianEntry } from '@/lib/parser';
import { cookies } from 'next/headers';
import { formatMasjidName } from '@/lib/date-utils';

// Enable ISR with 60 second revalidation for better performance under high traffic
export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeCanceled = searchParams.get('include_canceled') === 'true';

        // Auto-generate recurring instances if enabled (NON-BLOCKING)
        const autoGenerate = searchParams.get('auto_generate') !== 'false'; // Default: true

        if (autoGenerate) {
            // Fire and forget - don't wait for generation to complete
            // This runs asynchronously and won't block the response
            (async () => {
                try {
                    const protocol = request.headers.get('x-forwarded-proto') || 'http';
                    const host = request.headers.get('host');
                    if (host) {
                        const baseUrl = `${protocol}://${host}`;
                        await fetch(`${baseUrl}/api/recurring-kajian/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ months: 3 })
                        });
                    }
                } catch (err) {
                    // Silent fail - generation errors should not affect main request
                    console.error('[Kajian API] Auto-generation failed:', err);
                }
            })();
        }

        // Build query with optional filter for canceled
        let sql = 'SELECT * FROM kajian';
        const args: any[] = [];

        // Build WHERE clauses
        const whereClauses: string[] = [];

        // Exclude recurring instances from public view
        whereClauses.push('(recurring_kajian_id IS NULL)');

        if (!includeCanceled) {
            whereClauses.push('(is_canceled = 0 OR is_canceled IS NULL)');
        }

        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        sql += ' ORDER BY id DESC';

        const result = await db.execute({ sql, args });

        // Convert integer booleans from SQLite back to actual booleans for JSON
        const rows = result.rows.map(row => ({
            ...row,
            date: (row.date as string)?.replace(/Minggu/gi, 'Ahad'),
            khususAkhwat: !!row.khususAkhwat,
            isOnline: !!row.isOnline,
            isKidsFriendly: !!row.isKidsFriendly,
            is_recurring_instance: !!row.is_recurring_instance,
            is_canceled: !!row.is_canceled
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
        const existingKajian = await db.execute('SELECT id, masjid, city, date, waktu, tema, pemateri FROM kajian');

        for (const entry of entries) {
            const duplicate = existingKajian.rows.find((existing: any) =>
                existing.masjid === formatMasjidName(entry.masjid) &&
                String(existing.city).toLowerCase() === String(entry.city || '').toLowerCase() &&
                existing.date === entry.date &&
                existing.waktu === entry.waktu
            );

            if (duplicate) {
                duplicates.push({
                    new: {
                        masjid: formatMasjidName(entry.masjid),
                        city: entry.city,
                        date: entry.date,
                        waktu: entry.waktu,
                        tema: entry.tema,
                        pemateri: entry.pemateri
                    },
                    existing: {
                        id: duplicate.id,
                        masjid: duplicate.masjid,
                        city: duplicate.city,
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
                message: 'Ditemukan kajian duplikat. Masjid, kota, tanggal, dan waktu yang sama sudah ada di database.'
            }, { status: 409 });
        }

        // Batch insert using transactions
        const statements = entries.map(item => ({
            sql: `
        INSERT INTO kajian (
            region, city, masjid, address, gmapsUrl, lat, lng, 
            pemateri, pemateri2, pemateri3, tema, waktu, waktu_mulai, waktu_selesai, 
            cp, cp2, cp3, date, khususAkhwat, linkInfo, imageUrl, isOnline, isKidsFriendly, catatan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
            args: [
                item.region || 'INDONESIA',
                item.city,
                formatMasjidName(item.masjid),
                item.address === item.masjid ? formatMasjidName(item.masjid) : item.address,
                item.gmapsUrl,
                (item.lat !== undefined && item.lat !== null && !isNaN(Number(item.lat))) ? Number(item.lat) : null,
                (item.lng !== undefined && item.lng !== null && !isNaN(Number(item.lng))) ? Number(item.lng) : null,
                item.pemateri,
                item.pemateri2 || null,
                item.pemateri3 || null,
                item.tema,
                item.waktu,
                item.waktu_mulai || null,
                item.waktu_selesai || null,
                item.cp,
                item.cp2 || null,
                item.cp3 || null,
                item.date?.replace(/Minggu/gi, 'Ahad'),
                item.khususAkhwat ? 1 : 0,
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
