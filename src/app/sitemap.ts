import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://portalkajian.online';

    // Static routes
    const routes = [
        '',
        '/kajian',
        '/masjid',
        '/ustadz',
        '/notifikasi',
        '/catatan-kajian',
        '/kalender-puasa',
        '/jadwal-sholat',
        '/sekolah-sunnah',
        '/hubungi-kami',
        '/dzikir',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
