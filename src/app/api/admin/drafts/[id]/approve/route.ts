import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { parseIndoDate, getKajianStatus } from '@/lib/date-utils';
import { requireAdminSession } from '@/lib/auth';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const session = await requireAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await context.params;
        const body = await request.json();

        // The body contains the finalized (potentially edited) fields from the Admin UI
        const {
            region, city, masjid, address, gmapsUrl, lat, lng,
            pemateri, tema, waktu, date,
            cp, cp2, cp3, catatan, isOnline, imageUrl,
            khususAkhwat, isKidsFriendly
        } = body;

        // Ensure we handle basic validation
        if (!masjid || !date) {
            return NextResponse.json({ error: 'Masjid dan Tanggal wajib diisi' }, { status: 400 });
        }

        const dateObj = parseIndoDate(date);
        const isoDate = dateObj ? dateObj.toISOString() : new Date().toISOString();

        // 1. Insert into Kajian table
        const insertResult = await db.execute({
            sql: `INSERT INTO kajian (
                region, city, masjid, address, 
                gmapsUrl, lat, lng, 
                pemateri, tema, waktu, date, 
                cp, cp2, cp3, catatan, 
                isOnline, imageUrl, khususAkhwat, isKidsFriendly,
                createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                region || 'INDONESIA', city, masjid, address,
                gmapsUrl || null, lat || null, lng || null,
                pemateri, tema, waktu, date,
                cp || null, cp2 || null, cp3 || null, catatan || null,
                isOnline ? 1 : 0, imageUrl || null, khususAkhwat ? 1 : 0, isKidsFriendly ? 1 : 0,
                isoDate
            ]
        });

        // 2. Update draft status to approved
        await db.execute({
            sql: `UPDATE kajian_drafts SET status = 'approved' WHERE id = ?`,
            args: [id]
        });

        return NextResponse.json({ success: true, id: Number(insertResult.lastInsertRowid) });

    } catch (error: any) {
        console.error('Error approving draft:', error);
        return NextResponse.json({ error: error.message || 'Failed to approve' }, { status: 500 });
    }
}
