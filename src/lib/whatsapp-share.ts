// Helper to shorten/clean Google Maps URL
function cleanMapsUrl(url?: string): string {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        // If it's a long google maps url with /place/, try to strip the data param
        if (urlObj.hostname.includes('google.com') && urlObj.pathname.includes('/maps/place')) {
            // Keep only the path (place name and coordinates)
            // Example: https://www.google.com/maps/place/Masjid+.../@-6.2,106.7,15z/data=...!
            // We want up to the coordinate part or just remove 'data' query param if it exists

            // Simplest safe approach: remove everything after 'data=' if present in path or query
            // But 'data' is usually part of the path in new maps urls

            // Strategy: return the url without the 'data' part if feasible, 
            // but a simpler readable way is searching for the last useful segment.
            // Let's just return the URL, but if it has 'data=', truncate before it.
            const dataIndex = url.indexOf('/data=');
            if (dataIndex !== -1) {
                return url.substring(0, dataIndex);
            }
        }
        return url;
    } catch (e) {
        return url;
    }
}

export function generateWhatsAppShareText(kajian: {
    masjid: string;
    pemateri: string;
    tema: string;
    date: string;
    waktu: string;
    gmapsUrl?: string;
    address: string;
    imageUrl?: string;
}): string {
    let text = `*INFO KAJIAN SUNNAH*\n\n`;
    text += `🕌 *Masjid:* ${kajian.masjid}\n`;
    text += `👤 *Pemateri:* ${kajian.pemateri}\n`;
    text += `📚 *Tema:* ${kajian.tema}\n`;
    text += `🗓 *Hari/Tgl:* ${kajian.date}\n`;
    text += `⏰ *Waktu:* ${kajian.waktu}\n`;

    // Add image link if available (ABOVE Location)
    if (kajian.imageUrl) {
        text += `\n📸 *Lihat Poster:*\n${kajian.imageUrl}\n`;
    }

    // Cleaned Location URL
    const location = cleanMapsUrl(kajian.gmapsUrl) || kajian.address;
    text += `📍 *Lokasi:* ${location}`;

    text += `\n\n_Disebarkan melalui PortalKajian.online_`;

    return text;
}

// Helper function to open WhatsApp share
export function shareToWhatsApp(kajian: Parameters<typeof generateWhatsAppShareText>[0]): void {
    const text = generateWhatsAppShareText(kajian);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
