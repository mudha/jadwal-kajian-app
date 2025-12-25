/**
 * Extract coordinates from Google Maps URL
 * Supports various Google Maps URL formats:
 * - https://maps.google.com/?q=-6.123,106.456
 * - https://www.google.com/maps/place/@-6.123,106.456,17z
 * - https://maps.app.goo.gl/xyz (shortened URL - needs redirect)
 * - https://www.google.com/maps?q=-6.123,106.456
 * - https://maps.app.goo.gl/... (shortened)
 */
export function extractCoordinatesFromGmapsUrl(url: string): { lat: number; lng: number } | null {
    if (!url) return null;

    try {
        // Decode URL first
        const decodedUrl = decodeURIComponent(url);

        console.log('Extracting from URL:', decodedUrl.substring(0, 100));

        // Pattern 1: ?q=lat,lng or ?q=lat,lng,zoom
        const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const qMatch = decodedUrl.match(qPattern);
        if (qMatch) {
            console.log('✓ Matched pattern 1 (q=)');
            return {
                lat: parseFloat(qMatch[1]),
                lng: parseFloat(qMatch[2])
            };
        }

        // Pattern 2: /@lat,lng,zoom or /@lat,lng
        const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const atMatch = decodedUrl.match(atPattern);
        if (atMatch) {
            console.log('✓ Matched pattern 2 (@)');
            return {
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2])
            };
        }

        // Pattern 3: /place/name/@lat,lng
        const placePattern = /place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const placeMatch = decodedUrl.match(placePattern);
        if (placeMatch) {
            console.log('✓ Matched pattern 3 (place/@)');
            return {
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2])
            };
        }

        // Pattern 4: ll=lat,lng (legacy)
        const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const llMatch = decodedUrl.match(llPattern);
        if (llMatch) {
            console.log('✓ Matched pattern 4 (ll=)');
            return {
                lat: parseFloat(llMatch[1]),
                lng: parseFloat(llMatch[2])
            };
        }

        // Pattern 5: /maps/dir//lat,lng (directions)
        const dirPattern = /\/maps\/dir\/\/(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const dirMatch = decodedUrl.match(dirPattern);
        if (dirMatch) {
            console.log('✓ Matched pattern 5 (dir//)');
            return {
                lat: parseFloat(dirMatch[1]),
                lng: parseFloat(dirMatch[2])
            };
        }

        // Pattern 6: Just two numbers separated by comma (fallback)
        const coordPattern = /(-?\d+\.\d{4,}),\s*(-?\d+\.\d{4,})/;
        const coordMatch = decodedUrl.match(coordPattern);
        if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            // Validate it looks like Indonesia coordinates
            if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
                console.log('✓ Matched pattern 6 (fallback coords)');
                return { lat, lng };
            }
        }

        console.log('✗ No pattern matched');
        return null;
    } catch (error) {
        console.error('Error extracting coordinates from URL:', error);
        return null;
    }
}

/**
 * Validate coordinates are within reasonable bounds
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
    // Indonesia bounds (approximate)
    // Latitude: -11 to 6
    // Longitude: 95 to 141
    return lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
}
