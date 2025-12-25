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

        // Update all kajian with source names to target name
        for (const sourceName of sourceNames) {
            await db.execute({
                sql: 'UPDATE kajian SET masjid = ? WHERE masjid = ?',
                args: [targetName, sourceName],
            });
        }

        return NextResponse.json({
            message: `Successfully merged ${sourceNames.length} masjid names into "${targetName}"`,
            mergedCount: sourceNames.length,
        });
    } catch (error) {
        console.error('Error merging masjid:', error);
        return NextResponse.json(
            { error: 'Failed to merge masjid' },
            { status: 500 }
        );
    }
}
