import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        // Get sample gmapsUrl to debug
        const result = await db.execute({
            sql: `
                SELECT id, gmapsUrl, masjid, city
                FROM kajian
                WHERE gmapsUrl IS NOT NULL 
                AND gmapsUrl != ''
                LIMIT 10
            `,
            args: []
        });

        const samples = result.rows.map((row: any) => ({
            id: row.id,
            masjid: row.masjid,
            city: row.city,
            gmapsUrl: row.gmapsUrl,
            urlLength: row.gmapsUrl?.length || 0
        }));

        return NextResponse.json({
            success: true,
            count: samples.length,
            samples
        });

    } catch (error) {
        console.error('Error fetching samples:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch samples',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
