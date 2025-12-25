import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { extractCoordinatesFromGmapsUrl, isValidCoordinates } from '@/lib/gmaps-utils';

export async function POST() {
    try {
        // Get all kajian with gmapsUrl but no coordinates
        const result = await db.execute({
            sql: `
                SELECT id, gmapsUrl, masjid, city
                FROM kajian
                WHERE gmapsUrl IS NOT NULL 
                AND gmapsUrl != ''
                AND (lat IS NULL OR lng IS NULL)
            `,
            args: []
        });

        const kajianList = result.rows as unknown as Array<{
            id: number;
            gmapsUrl: string;
            masjid: string;
            city: string;
        }>;

        let updated = 0;
        let failed = 0;
        const errors: Array<{ id: number; masjid: string; error: string }> = [];

        for (const kajian of kajianList) {
            try {
                // Extract coordinates from gmapsUrl
                const coords = extractCoordinatesFromGmapsUrl(kajian.gmapsUrl);

                if (coords && isValidCoordinates(coords.lat, coords.lng)) {
                    // Update the kajian with coordinates
                    await db.execute({
                        sql: 'UPDATE kajian SET lat = ?, lng = ? WHERE id = ?',
                        args: [coords.lat, coords.lng, kajian.id]
                    });
                    updated++;
                    console.log(`✓ Updated kajian #${kajian.id} (${kajian.masjid}): ${coords.lat}, ${coords.lng}`);
                } else {
                    failed++;
                    errors.push({
                        id: kajian.id,
                        masjid: kajian.masjid,
                        error: 'Could not extract valid coordinates from URL'
                    });
                    console.log(`✗ Failed to extract coordinates for kajian #${kajian.id} (${kajian.masjid})`);
                }
            } catch (error) {
                failed++;
                errors.push({
                    id: kajian.id,
                    masjid: kajian.masjid,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                console.error(`✗ Error processing kajian #${kajian.id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Coordinate extraction completed`,
            stats: {
                total: kajianList.length,
                updated,
                failed
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error in coordinate extraction:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to extract coordinates',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
