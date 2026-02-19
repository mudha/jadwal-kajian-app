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
                    waktu LIKE '%Sholat Jumat%'
                )
                AND tema NOT LIKE '%Tarawih%' 
                AND tema NOT LIKE '%Tarweh%'
            `,
            args: []
        });

        // NEW: Fix Tarawih Thumbnails (Correct existing data)
        const fixTarawihResult = await db.execute({
            sql: `
                UPDATE kajian 
                SET imageUrl = '/images/tarawih-cover.svg' 
                WHERE (tema LIKE '%Tarawih%' OR waktu LIKE '%Tarawih%') 
                AND imageUrl = '/images/khutbah-jumat-cover.png'
            `,
            args: []
        });

        return NextResponse.json({
            success: true,
            message: `Berhasil memperbarui gambar Jumat & Tarawih.`,
            details: { friday: result, tarawih: fixTarawihResult }
        });
    } catch (error: any) {
        console.error('Fix Friday Images Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
