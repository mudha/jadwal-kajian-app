import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { normalize, similarity } from '@/lib/string-similarity';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, masjid, pemateri, waktu, excludeId } = body;

        if (!date || !masjid) {
            return NextResponse.json({ isDuplicate: false });
        }

        // 1. Fetch all kajian on that specific date
        // Note: handling date string format might be needed depending on DB storage
        // Assuming date is stored as YYYY-MM-DD or similar string in DB
        const result = await db.execute({
            sql: `SELECT id, masjid, pemateri, waktu, tema FROM kajian WHERE date = ?`,
            args: [date]
        });

        const candidates = result.rows;
        let duplicateFound = null;

        for (const candidate of candidates) {
            // Skip self if editing
            if (excludeId && candidate.id === excludeId) continue;

            // 2. Check Masjid Similarity
            const candidateMasjid = String(candidate.masjid || '');
            const masjidSim = similarity(normalize(masjid), normalize(candidateMasjid));

            // 3. Check Pemateri Similarity (if both exist)
            let pemateriSim = 0;
            if (pemateri && candidate.pemateri) {
                const candidatePemateri = String(candidate.pemateri || '');
                pemateriSim = similarity(normalize(pemateri), normalize(candidatePemateri));
            } else {
                // If one doesn't have pemateri, assume match if masjid match is very strong
                pemateriSim = 1;
            }

            // Thresholds
            // Masjid needs to be quite similar
            const isMasjidMatch = masjidSim > 0.8;

            // Pemateri match
            const isPemateriMatch = pemateriSim > 0.8;

            // Simple rules:
            // Same Date + Similar Masjid + Similar Pemateri = DUPLICATE
            if (isMasjidMatch && isPemateriMatch) {
                duplicateFound = candidate;
                break;
            }
        }

        if (duplicateFound) {
            return NextResponse.json({
                isDuplicate: true,
                existing: duplicateFound
            });
        }

        return NextResponse.json({ isDuplicate: false });

    } catch (error) {
        console.error('Error checking duplicates:', error);
        return NextResponse.json({ error: 'Failed to check duplicates' }, { status: 500 });
    }
}
