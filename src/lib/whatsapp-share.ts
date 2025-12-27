// Helper function to generate WhatsApp share text with image
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
    text += `📍 *Lokasi:* ${kajian.gmapsUrl || kajian.address}`;

    // Add image link if available
    if (kajian.imageUrl) {
        text += `\n\n📸 *Lihat Poster:*\n${kajian.imageUrl}`;
    }

    text += `\n\n_Disebarkan melalui PortalKajian.online_`;

    return text;
}

// Helper function to open WhatsApp share
export function shareToWhatsApp(kajian: Parameters<typeof generateWhatsAppShareText>[0]): void {
    const text = generateWhatsAppShareText(kajian);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
