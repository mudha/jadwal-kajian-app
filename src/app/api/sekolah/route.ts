import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Query parameters
        const jenjang = searchParams.get('jenjang');
        const kota = searchParams.get('kota');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const db = await getDb();

        // Build WHERE clause dynamically
        let whereConditions: string[] = [];
        let params: any[] = [];

        if (jenjang) {
            whereConditions.push('jenjang = ?');
            params.push(jenjang);
        }

        if (kota) {
            whereConditions.push('kota LIKE ?');
            params.push(`%${kota}%`);
        }

        if (search) {
            whereConditions.push('(nama LIKE ? OR alamat LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM sekolah ${whereClause}`;
        const countResult = await db.execute({ sql: countQuery, args: params });
        const total = (countResult.rows[0] as any).total;

        // Get data with pagination
        const dataQuery = `
      SELECT 
        id, nama, slug, jenjang, kota, provinsi,
        spp_bulanan, uang_masuk, khusus_akhwat, khusus_ikhwan,
        imageUrl, alamat, telepon, handphone
      FROM sekolah 
      ${whereClause}
      ORDER BY nama ASC
      LIMIT ? OFFSET ?
    `;

        const dataResult = await db.execute({
            sql: dataQuery,
            args: [...params, limit, offset]
        });

        return NextResponse.json({
            data: dataResult.rows,
            total,
            limit,
            offset
        });

    } catch (error) {
        console.error('Error fetching sekolah:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schools' },
            { status: 500 }
        );
    }
}
