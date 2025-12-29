import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET for Admin List (Optional, can just use public GET with params if fields are same)
// But often admin needs more data or raw data.
// For now, let's reuse public GET for listing? 
// Actually, the Admin Page currently fetches `/api/sekolah?limit=100`.
// If we move everything to `/api/admin/sekolah`, we should handle GET there too.
// Let's implement a simple GET here for admin that mirrors the public one but maybe less formatted?
// Or just proxy? For simplicity, let's Duplicate the GET logic but simpler (no complex filters needed yet?)
// User admin page uses simple search.

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // Admin usually wants all data, usually latest first or alphabetical.
        // Current Admin page uses client side filtering for list.

        let query = 'SELECT * FROM sekolah';
        let args: any[] = [];

        if (search) {
            query += ' WHERE nama LIKE ? OR kota LIKE ?';
            args.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY nama ASC'; // Or created_at DESC

        const result = await db.execute({ sql: query, args });
        return NextResponse.json({ data: result.rows });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.nama || !body.jenjang || !body.kota) {
            return NextResponse.json(
                { error: 'Nama, Jenjang, and Kota are required' },
                { status: 400 }
            );
        }

        const slug = body.slug || body.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const query = `
            INSERT INTO sekolah (
                nama, slug, jenjang, alamat, kota, provinsi,
                telepon, telpon_2, handphone, contact_person_nama, contact_person_hp,
                whatsapp_link, website, email,
                facebook, instagram, twitter, youtube, telegram,
                gmaps_url, lat, lng,
                uang_masuk, spp_bulanan, deskripsi,
                khusus_akhwat, khusus_ikhwan,
                is_full_day, is_boarding, is_paket_abc,
                nama_pembina, ketua_yayasan, kepala_sekolah, nama_yayasan, imageUrl
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        `;

        const args = [
            body.nama, slug, body.jenjang, body.alamat || '', body.kota, body.provinsi || '',
            body.telepon || null, body.telpon_2 || null, body.handphone || null, body.contact_person_nama || null, body.contact_person_hp || null,
            body.whatsapp_link || null, body.website || null, body.email || null,
            body.facebook || null, body.instagram || null, body.twitter || null, body.youtube || null, body.telegram || null,
            body.gmaps_url || null, body.lat || null, body.lng || null,
            body.uang_masuk || 0, body.spp_bulanan || 0, body.deskripsi || '',
            body.khusus_akhwat ? 1 : 0, body.khusus_ikhwan ? 1 : 0,
            body.is_full_day ? 1 : 0, body.is_boarding ? 1 : 0, body.is_paket_abc ? 1 : 0,
            body.nama_pembina || null, body.ketua_yayasan || null, body.kepala_sekolah || null, body.nama_yayasan || null, body.imageUrl || null
        ];

        await db.execute({ sql: query, args });

        return NextResponse.json({ success: true, message: 'Sekolah added successfully' }, { status: 201 });

    } catch (error: any) {
        console.error('Error adding sekolah:', error);
        return NextResponse.json(
            {
                error: 'Failed to add school',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
