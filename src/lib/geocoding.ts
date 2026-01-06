export async function geocodeAddress(masjid: string, address: string, city: string) {
    try {
        // Build a query: Masjid Name + Address + City
        const query = `${masjid} ${address} ${city}`.trim();
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        // Fallback: Just Address + City
        const query2 = `${address} ${city}`.trim();
        const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query2)}&limit=1`);
        const data2 = await res2.json();

        if (data2 && data2.length > 0) {
            return {
                lat: parseFloat(data2[0].lat),
                lng: parseFloat(data2[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

export function extractCoordsFromUrl(url: string) {
    if (!url) return null;

    // Pattern 1: @lat,lng (Standard Google Maps)
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = url.match(atPattern);
    if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    }

    // Pattern 2: q=lat,lng (Search query)
    const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = url.match(qPattern);
    if (qMatch) {
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    }

    // Pattern 3: ll=lat,lng (Legacy parameter)
    const llPattern = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const llMatch = url.match(llPattern);
    if (llMatch) {
        return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
    }

    // Pattern 4: 3dlat!4dlng (Embed/Data params)
    const dataPattern = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const dataMatch = url.match(dataPattern);
    if (dataMatch) {
        return { lat: parseFloat(dataMatch[1]), lng: parseFloat(dataMatch[2]) };
    }

    return null;
}
