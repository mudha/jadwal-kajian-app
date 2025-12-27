import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isValidCoordinates } from '@/lib/gmaps-utils';

/**
 * Expand shortened Google Maps URL by following redirects
 */
async function expandShortenedUrl(shortUrl: string): Promise<string> {
    try {
        if (!shortUrl.includes('goo.gl') && !shortUrl.includes('maps.app.goo.gl')) {
            return shortUrl;
        }

        console.log('Expanding:', shortUrl.substring(0, 50));

        const response = await fetch(shortUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        console.log('Expanded to:', response.url.substring(0, 100));
        return response.url;
    } catch (error) {
        console.error('Expansion error:', error);
        return shortUrl;
    }
}

/**
 * Extract coordinates from expanded URL
 */
function extractCoordinates(url: string): { lat: number; lng: number } | null {
    try {
        const decodedUrl = decodeURIComponent(url);
        console.log('Extracting from:', decodedUrl.substring(0, 100));

        // Pattern 1: ?q=lat,lng
        let match = decodedUrl.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
            console.log('✓ Pattern 1 (q=)');
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }

        // Pattern 2: /@lat,lng
        match = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
            console.log('✓ Pattern 2 (@)');
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }

        // Pattern 3: /place/name/@lat,lng
        match = decodedUrl.match(/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
            console.log('✓ Pattern 3 (place/@)');
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }

        // Pattern 4: ll=lat,lng
        match = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
            console.log('✓ Pattern 4 (ll=)');
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }

        // Pattern 5: /dir//lat,lng
        match = decodedUrl.match(/\/maps\/dir\/\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) {
            console.log('✓ Pattern 5 (dir//)');
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }

        // Pattern 6: Fallback - any coords
        match = decodedUrl.match(/(-?\d+\.\d{4,}),\s*(-?\d+\.\d{4,})/);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
                console.log('✓ Pattern 6 (fallback)');
                return { lat, lng };
            }
        }

        // Pattern 7: Protobuf/Data URL parameters (!3d and !4d)
        // Example: ...!3d-6.2868913!4d107.0307183...
        const latMatch = decodedUrl.match(/!3d(-?\d+\.?\d*)/);
        const lngMatch = decodedUrl.match(/!4d(-?\d+\.?\d*)/);
        if (latMatch && lngMatch) {
            console.log('✓ Pattern 7 (!3d!4d)');
            return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
        }

        console.log('✗ No pattern matched');
        return null;
    } catch (error) {
        console.error('Extraction error:', error);
        return null;
    }
}

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
        const errors: Array<{ id: number; masjid: string; url: string; error: string }> = [];
        const sampleUrls: string[] = [];

        for (const kajian of kajianList) {
            // Collect first 5 URLs as samples
            if (sampleUrls.length < 5) {
                sampleUrls.push(kajian.gmapsUrl);
            }

            try {
                // Step 1: Expand shortened URL
                const expandedUrl = await expandShortenedUrl(kajian.gmapsUrl);

                // Step 2: Extract coordinates
                const coords = extractCoordinates(expandedUrl);

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
                        url: kajian.gmapsUrl.substring(0, 100), // First 100 chars
                        error: coords ? 'Invalid coordinates (out of bounds)' : 'Could not extract coordinates from URL'
                    });
                    console.log(`✗ Failed to extract coordinates for kajian #${kajian.id} (${kajian.masjid})`);
                    console.log(`  URL: ${kajian.gmapsUrl.substring(0, 100)}`);
                }
            } catch (error) {
                failed++;
                errors.push({
                    id: kajian.id,
                    masjid: kajian.masjid,
                    url: kajian.gmapsUrl.substring(0, 100),
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
            sampleUrls, // Include sample URLs for debugging
            errors: errors.length > 0 ? errors.slice(0, 10) : undefined // First 10 errors only
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
