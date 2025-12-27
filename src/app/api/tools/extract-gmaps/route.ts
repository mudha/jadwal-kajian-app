import { NextResponse } from 'next/server';

/**
 * Expand shortened Google Maps URL by following redirects
 */
/**
 * Expand shortened Google Maps URL by following redirects
 * Returns the final URL and optionally the HTML body if needed
 */
async function expandUrl(shortUrl: string): Promise<{ url: string, html?: string }> {
    try {
        const response = await fetch(shortUrl, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // If we need to parse HTML, we must read it here
        // We only read body if the URL itself doesn't look like it has coordinates, 
        // to save resources, but since we need to cover all cases, reading text might be safer 
        // if we suspect the URL is insufficient.
        // For efficiency: Check URL first? No, we need validation. 
        // Let's just return the response object clone or text.

        const finalUrl = response.url;
        const html = await response.text();
        return { url: finalUrl, html };

    } catch (error) {
        console.error('Expansion error:', error);
        return { url: shortUrl };
    }
}

/**
 * Extract coordinates from URL or HTML content
 */
function extractCoordinates(url: string, html?: string): { lat: number; lng: number } | null {
    try {
        const decodedUrl = decodeURIComponent(url);

        // --- URL PATTERNS ---

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

        // Pattern 7: Protobuf (!3d, !4d)
        const latMatch = decodedUrl.match(/!3d(-?\d+\.?\d*)/);
        const lngMatch = decodedUrl.match(/!4d(-?\d+\.?\d*)/);
        if (latMatch && lngMatch) {
            return { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) };
        }

        // --- HTML FALLBACK ---
        if (html) {
            // Pattern: window.APP_INITIALIZATION_STATE=[[[zoom, long, lat]
            // Note: Google puts Longitude FIRST in this array, Latitude SECOND.
            const initMatch = html.match(/window\.APP_INITIALIZATION_STATE=\[\[\[[^,]+,(-?\d+\.?\d*),(-?\d+\.?\d*)\]/);
            if (initMatch) {
                const lng = parseFloat(initMatch[1]);
                const lat = parseFloat(initMatch[2]);
                return { lat, lng };
            }
        }

        // Pattern 6: Fallback - any coords in URL (Last resort)
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

/**
 * Extract place name from URL or HTML content meta tags
 */
function extractPlaceName(url: string, html?: string): string | null {
    try {
        const decodedUrl = decodeURIComponent(url);

        // Try extract from URL path: /place/Name+Of+Place/
        const placeMatch = decodedUrl.match(/\/place\/([^/@]+)/);
        if (placeMatch) {
            return placeMatch[1].replace(/\+/g, ' ').replace(/%2C/g, ',').trim();
        }

        // Try from HTML title or meta tags (OG tags)
        if (html) {
            const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
            if (ogTitleMatch) {
                // Google Maps often puts "Place Name · Address" in og:title
                return ogTitleMatch[1].split(' · ')[0].trim();
            }

            const titleMatch = html.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) {
                // Title format is usually "Place Name - Google Maps"
                return titleMatch[1].split(' - ')[0].trim();
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const { url: expandedUrl, html } = await expandUrl(url);
        const coords = extractCoordinates(expandedUrl, html);
        const placeName = extractPlaceName(expandedUrl, html);

        if (coords) {
            return NextResponse.json({
                success: true,
                ...coords,
                placeName,
                expandedUrl
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Could not extract coordinates',
                placeName,
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
