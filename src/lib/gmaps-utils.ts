/**
 * Extract coordinates from Google Maps URL
 * Supports various Google Maps URL formats:
 * - https://maps.google.com/?q=-6.123,106.456
 * - https://www.google.com/maps/place/@-6.123,106.456,17z
 * - https://maps.app.goo.gl/xyz (shortened URL - needs redirect)
 * - https://www.google.com/maps?q=-6.123,106.456
 */
export function extractCoordinatesFromGmapsUrl(url: string): { lat: number; lng: number } | null {
    if (!url) return null;

    try {
        // Pattern 1: ?q=lat,lng or ?q=lat,lng,zoom
        const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const qMatch = url.match(qPattern);
        if (qMatch) {
            return {
                lat: parseFloat(qMatch[1]),
                lng: parseFloat(qMatch[2])
            };
        }

        // Pattern 2: /@lat,lng,zoom or /@lat,lng
        const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const atMatch = url.match(atPattern);
        if (atMatch) {
            return {
                lat: parseFloat(atMatch[1]),
                lng: parseFloat(atMatch[2])
            };
        }

        // Pattern 3: /place/name/@lat,lng
        const placePattern = /place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const placeMatch = url.match(placePattern);
        if (placeMatch) {
            return {
                lat: parseFloat(placeMatch[1]),
                lng: parseFloat(placeMatch[2])
            };
        }

        // Pattern 4: ll=lat,lng (legacy)
        const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
        const llMatch = url.match(llPattern);
        if (llMatch) {
            return {
                lat: parseFloat(llMatch[1]),
                lng: parseFloat(llMatch[2])
            };
        }

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
