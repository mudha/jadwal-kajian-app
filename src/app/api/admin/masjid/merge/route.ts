import { NextResponse } from 'next/server';
import db from '@/lib/db';

// POST - Merge multiple masjid into one
export async function POST(request: Request) {
    try {
        const { sourceNames, targetName } = await request.json();

        if (!sourceNames || !Array.isArray(sourceNames) || sourceNames.length === 0) {
            return NextResponse.json(
                { error: 'Source names array is required' },
                { status: 400 }
            );
        }

        if (!targetName) {
            return NextResponse.json(
                { error: 'Target name is required' },
                { status: 400 }
            );
        }

        console.log('[MERGE] Starting merge:', { sourceNames, targetName });

        // Update all kajian with source names to target name
        let updatedCount = 0;
        for (const sourceName of sourceNames) {
            try {
                const result = await db.execute({
                    sql: 'UPDATE kajian SET masjid = ? WHERE masjid = ?',
                    args: [targetName, sourceName],
                });
                console.log(`[MERGE] Updated ${sourceName} -> ${targetName}:`, result);
                updatedCount++;
            } catch (err) {
                console.error(`[MERGE] Error updating ${sourceName}:`, err);
                throw err;
            }
        }

        console.log('[MERGE] Merge completed successfully');

        return NextResponse.json({
            message: `Successfully merged ${sourceNames.length} masjid names into "${targetName}"`,
            mergedCount: sourceNames.length,
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
