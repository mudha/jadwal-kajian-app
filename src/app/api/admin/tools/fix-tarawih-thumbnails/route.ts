import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // 1. Identify records that are Tarawih but have the Jumat cover
        const checkQuery = `
            SELECT id, tema, waktu, imageUrl 
            FROM kajian 
            WHERE (tema LIKE '%Tarawih%' OR waktu LIKE '%Tarawih%') 
            AND imageUrl = '/images/khutbah-jumat-cover.png'
        `;

        const checkResult = await db.execute(checkQuery, []);
        const affectedCount = checkResult.rows.length;

        if (affectedCount === 0) {
            return NextResponse.json({
                success: true,
                message: 'Tidak ada jadwal Tarawih dengan thumbnail Khutbah Jumat yang ditemukan.',
                affectedCount: 0
            });
        }

        // 2. Update them
        const updateQuery = `
            UPDATE kajian 
            SET imageUrl = '/images/tarawih-cover.svg' 
            WHERE (tema LIKE '%Tarawih%' OR waktu LIKE '%Tarawih%') 
            AND imageUrl = '/images/khutbah-jumat-cover.png'
        `;

        const updateResult = await db.execute(updateQuery, []);

        return NextResponse.json({
            success: true,
            message: `Berhasil memperbaiki ${affectedCount} jadwal Tarawih yang salah thumbnail.`,
            details: updateResult
        });
    } catch (error: any) {
        console.error('Fix Tarawih Thumbnails Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
