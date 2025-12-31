import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

// GET single by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await db.execute({ sql: 'SELECT * FROM kajian WHERE id = ?', args: [id] });
        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }
        const row = result.rows[0];
        return NextResponse.json({
            ...row,
            khususAkhwat: !!row.khususAkhwat,
            isOnline: !!row.isOnline
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = (await cookies()).get('admin_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        await db.execute({ sql: 'DELETE FROM kajian WHERE id = ?', args: [id] });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = (await cookies()).get('admin_session');
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const body = await request.json();

        await db.execute({
            sql: `
            UPDATE kajian 
            SET 
                masjid = ?, 
                address = ?, 
                pemateri = ?, 
                pemateri2 = ?,
                pemateri3 = ?,
                tema = ?, 
                waktu = ?, 
                waktu_mulai = ?,
                waktu_selesai = ?,
                date = ?, 
                city = ?, 
                region = ?,
                cp = ?, 
                cp2 = ?,
                cp3 = ?,
                gmapsUrl = ?, 
                lat = ?, 
                lng = ?, 
                khususAkhwat = ?, 
                linkInfo = ?, 
                imageUrl = ?, 
                isOnline = ?,
                isKidsFriendly = ?,
                catatan = ?
            WHERE id = ?
        `,
            args: [
                body.masjid,
                body.address,
                body.pemateri,
                body.pemateri2 || null,
                body.pemateri3 || null,
                body.tema,
                body.waktu,
                body.waktu_mulai || null,
                body.waktu_selesai || null,
                body.date,
                body.city,
                body.region || 'INDONESIA',
                body.cp,
                body.cp2 || null,
                body.cp3 || null,
                body.gmapsUrl,
                (body.lat !== undefined && body.lat !== null && !isNaN(Number(body.lat))) ? Number(body.lat) : null,
                (body.lng !== undefined && body.lng !== null && !isNaN(Number(body.lng))) ? Number(body.lng) : null,
                body.khususAkhwat ? 1 : 0,
                body.linkInfo || null,
                body.imageUrl || null,
                body.isOnline ? 1 : 0,
                body.isKidsFriendly ? 1 : 0,
                body.catatan || null,
                id
            ]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
