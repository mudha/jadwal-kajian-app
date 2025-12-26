import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Update records where imageUrl is missing AND it is a Friday Prayer (Jumat)
        const result = await db.execute({
            sql: `
                UPDATE kajian 
                SET imageUrl = '/images/khutbah-jumat-cover.png' 
                WHERE (imageUrl IS NULL OR imageUrl = '') 
                AND (
                    waktu LIKE '%Jumat%' 
                    OR waktu LIKE '%Jum''at%' 
                    OR waktu LIKE '%Sholat Jumat%'
                )
            `,
            args: []
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil memperbarui gambar untuk Jadwal Sholat Jumat yang kosong.`,
            details: result
        });
    } catch (error: any) {
        console.error('Fix Friday Images Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
