import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

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
            SET masjid = ?, address = ?, pemateri = ?, tema = ?, waktu = ?, date = ?, city = ?, cp = ?, gmapsUrl = ?, lat = ?, lng = ?, khususAkhwat = ?, linkInfo = ?
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
                id
            ]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
