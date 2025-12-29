import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;
        // db is already imported at top

        // Get school detail by slug
        const result = await db.execute({
            sql: `
        SELECT 
          id, nama, slug, jenjang, alamat, kota, provinsi,
          telepon, handphone, whatsapp_link, website,
          gmaps_url, lat, lng,
          uang_masuk, spp_bulanan, deskripsi,
          khusus_akhwat, khusus_ikhwan,
          nama_pembina, ketua_yayasan, kepala_sekolah,
          imageUrl, created_at, updated_at
        FROM sekolah 
        WHERE slug = ?
      `,
            args: [slug]
        });

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'School not found' },
                { status: 404 }
            );
        }

        const school = result.rows[0];

        // Get related schools (same city and jenjang, limit 6)
        const relatedResult = await db.execute({
            sql: `
        SELECT 
          id, nama, slug, jenjang, kota, spp_bulanan, imageUrl
        FROM sekolah 
        WHERE kota = ? AND jenjang = ? AND id != ?
        ORDER BY RANDOM()
        LIMIT 6
      `,
            args: [school.kota, school.jenjang, school.id]
        });

        return NextResponse.json({
            school,
            related: relatedResult.rows
        });

    } catch (error) {
        console.error('Error fetching sekolah detail:', error);
        return NextResponse.json(
            { error: 'Failed to fetch school details' },
            { status: 500 }
        );
    }
}
