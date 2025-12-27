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
            SET masjid = ?, address = ?, pemateri = ?, tema = ?, waktu = ?, date = ?, city = ?, cp = ?, gmapsUrl = ?, lat = ?, lng = ?, khususAkhwat = ?, linkInfo = ?, imageUrl = ?, isOnline = ?
            WHERE id = ?
        `,
            args: [
                body.masjid,
                body.address,
                body.pemateri,
                body.tema,
                body.waktu,
                body.date,
                body.city,
                body.cp,
                body.gmapsUrl,
                body.lat || null,
                body.lng || null,
                body.khususAkhwat ? 1 : 0,
                body.linkInfo || null,
                body.imageUrl || null,
                body.isOnline ? 1 : 0,
                id
            ]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
