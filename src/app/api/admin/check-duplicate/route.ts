import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { normalize, similarity } from '@/lib/string-similarity';

export async function POST(request: Request) {
    try {
        const { masjid, pemateri, date, waktu } = await request.json();

        if (!masjid || !date) {
            return NextResponse.json({ isDuplicate: false });
        }

        // 1. Fetch ALL kajian on that specific date (Strict date match is good for performance)
        const result = await db.execute({
            sql: `
                SELECT id, masjid, pemateri, tema, date, waktu, city
                FROM kajian
                WHERE date = ?
            `,
            args: [date],
        });

        const candidates = result.rows;
        const duplicates = [];

        for (const candidate of candidates) {
            // 2. Check Masjid Similarity
            const candidateMasjid = String(candidate.masjid || '');
            const masjidSim = similarity(normalize(masjid), normalize(candidateMasjid));

            // 3. Check Pemateri Similarity (if both exist)
            let pemateriSim = 1.0; // Default match if pemateri is not key comparison

            if (pemateri && candidate.pemateri) {
                const candidatePemateri = String(candidate.pemateri || '');
                pemateriSim = similarity(normalize(pemateri), normalize(candidatePemateri));
            } else if ((pemateri && !candidate.pemateri) || (!pemateri && candidate.pemateri)) {
                // One has pemateri, the other doesn't -> likely not duplicate unless masjid match is perfect
                pemateriSim = 0.5;
            }

            // Criteria for Duplicate:
            // 1. Masjid is VERY similar (> 0.8) AND Pemateri is similar (> 0.8)
            // 2. OR Masjid is IDENTICAL (normalized) and Time is similar

            const isMasjidMatch = masjidSim > 0.8;
            const isPemateriMatch = pemateriSim > 0.8;

            if (isMasjidMatch && isPemateriMatch) {
                duplicates.push(candidate);
            }
        }

        if (duplicates.length > 0) {
            return NextResponse.json({
                isDuplicate: true,
                duplicates: duplicates,
            });
        }

        return NextResponse.json({ isDuplicate: false });
    } catch (error) {
        console.error('Error checking duplicates:', error);
        return NextResponse.json({ error: 'Failed to check duplicates' }, { status: 500 });
    }
}
