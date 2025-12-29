import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await db.execute({
            sql: 'SELECT * FROM sekolah WHERE id = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Sekolah not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updates: string[] = [];
        const args: any[] = [];

        const allowedFields = [
            'nama', 'slug', 'jenjang', 'alamat', 'kota', 'provinsi',
            'telepon', 'telpon_2', 'handphone', 'contact_person_nama', 'contact_person_hp',
            'whatsapp_link', 'website', 'email',
            'facebook', 'instagram', 'twitter', 'youtube', 'telegram',
            'gmaps_url', 'lat', 'lng', 'uang_masuk', 'spp_bulanan',
            'deskripsi', 'khusus_akhwat', 'khusus_ikhwan',
            'is_full_day', 'is_boarding', 'is_paket_abc',
            'nama_pembina', 'ketua_yayasan', 'kepala_sekolah', 'nama_yayasan', 'imageUrl'
        ];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                const booleanFields = ['khusus_akhwat', 'khusus_ikhwan', 'is_full_day', 'is_boarding', 'is_paket_abc'];
                if (booleanFields.includes(field)) {
                    args.push(body[field] ? 1 : 0);
                } else {
                    args.push(body[field]);
                }
            }
        }

        if (updates.length === 0) {
            return NextResponse.json({ message: 'No updates provided' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const query = `UPDATE sekolah SET ${updates.join(', ')} WHERE id = ?`;
        args.push(id);

        await db.execute({ sql: query, args });

        return NextResponse.json({ success: true, message: 'Sekolah updated' });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.execute({
            sql: 'DELETE FROM sekolah WHERE id = ?',
            args: [id]
        });
        return NextResponse.json({ success: true, message: 'Sekolah deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
