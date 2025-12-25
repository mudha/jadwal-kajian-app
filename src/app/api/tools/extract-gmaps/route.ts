import { NextResponse } from 'next/server';

/**
 * Expand shortened Google Maps URL by following redirects
 */
async function expandShortenedUrl(shortUrl: string): Promise<string> {
    try {
        if (!shortUrl.includes('goo.gl') && !shortUrl.includes('maps.app.goo.gl')) {
            return shortUrl;
        }

        const response = await fetch(shortUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

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

        // Pattern 1: ?q=lat,lng
        let match = decodedUrl.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

        // Pattern 2: /@lat,lng
        match = decodedUrl.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

        // Pattern 3: /place/name/@lat,lng
        match = decodedUrl.match(/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

        // Pattern 4: ll=lat,lng
        match = decodedUrl.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

        // Pattern 5: /dir//lat,lng
        match = decodedUrl.match(/\/maps\/dir\/\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };

        // Pattern 6: Fallback - any coords
        match = decodedUrl.match(/(-?\d+\.\d{4,}),\s*(-?\d+\.\d{4,})/);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
                return { lat, lng };
            }
        }

        return null;
    } catch (error) {
        console.error('Extraction error:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const expandedUrl = await expandShortenedUrl(url);
        const coords = extractCoordinates(expandedUrl);

        if (coords) {
            return NextResponse.json({
                success: true,
                ...coords,
                expandedUrl
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Could not extract coordinates',
                expandedUrl
            }, { status: 422 });
        }

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
