import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface MergeRequest {
    type: 'masjid' | 'ustadz';
    from: string;
    to: string;
}

export async function POST(request: Request) {
    try {
        const body: MergeRequest = await request.json();
        const { type, from, to } = body;

        if (!type || !from || !to) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let result;

        if (type === 'masjid') {
            // Update all kajian with the old masjid name to the new canonical name
            result = await db.execute({
                sql: 'UPDATE kajian SET masjid = ? WHERE masjid = ?',
                args: [to, from]
            });
        } else if (type === 'ustadz') {
            // Update all kajian with the old ustadz name to the new canonical name
            result = await db.execute({
                sql: 'UPDATE kajian SET pemateri = ? WHERE pemateri = ?',
                args: [to, from]
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid type' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully merged "${from}" into "${to}"`,
            rowsAffected: result.rowsAffected
        });

    } catch (error) {
        console.error('Error merging duplicates:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to merge duplicates' },
            { status: 500 }
        );
    }
}
