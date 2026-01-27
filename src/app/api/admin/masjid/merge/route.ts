import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Merge multiple masjid into one
export async function POST(request: Request) {
    try {
        const { sourceItems, targetDetails } = await request.json();

        if (!sourceItems || !Array.isArray(sourceItems) || sourceItems.length === 0) {
            return NextResponse.json(
                { error: 'Source items array is required' },
                { status: 400 }
            );
        }

        if (!targetDetails || !targetDetails.name || !targetDetails.city) {
            return NextResponse.json(
                { error: 'Target details (name and city) are required' },
                { status: 400 }
            );
        }

        console.log('[MERGE] Starting merge:', { sourceItems, targetDetails });

        // Update all kajian with source fields to target fields
        let updatedCount = 0;
        for (const source of sourceItems) {
            try {
                // We update ALL location fields to match the target
                // This ensures everything is unified under the target's identity
                const result = await db.execute({
                    sql: `
                        UPDATE kajian 
                        SET masjid = ?, city = ?, address = ?, gmapsUrl = ?, lat = ?, lng = ?
                        WHERE masjid = ? AND city = ?
                    `,
                    args: [
                        targetDetails.name,
                        targetDetails.city,
                        targetDetails.address || '',
                        targetDetails.gmapsUrl || '',
                        targetDetails.lat || null,
                        targetDetails.lng || null,
                        source.name,
                        source.city
                    ],
                });
                console.log(`[MERGE] Updated ${source.name} (${source.city}) -> ${targetDetails.name}:`, result);
                updatedCount++; // This counts query executions, not necessarily affected rows
            } catch (err) {
                console.error(`[MERGE] Error updating ${source.name}:`, err);
                throw err;
            }
        }

        console.log('[MERGE] Merge completed successfully');

        return NextResponse.json({
            message: `Successfully merged ${sourceItems.length} masjid items into "${targetDetails.name}"`,
            mergedCount: sourceItems.length,
            updatedCount: updatedCount,
        });
    } catch (error: any) {
        console.error('[MERGE] Error merging masjid:', error);
        return NextResponse.json(
            {
                error: 'Failed to merge masjid',
                details: error.message || 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
