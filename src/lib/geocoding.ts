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
