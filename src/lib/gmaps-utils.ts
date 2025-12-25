/**
 * Validate coordinates are within reasonable bounds
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
    // Indonesia bounds (approximate)
    // Latitude: -11 to 6
    // Longitude: 95 to 141
    return lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141;
}
