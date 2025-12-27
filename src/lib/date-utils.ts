export const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function parseIndoDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    try {
        // Clean string: remove day names and commas
        // Example: "Selasa, 23 Desember 2025" -> "23 Desember 2025"
        // Example: "Ahad 18 Januari 2026" -> "18 Januari 2026"
        const clean = dateStr
            .replace(/Ahad|Senin|Selasa|Rabu|Kamis|Jum'?at|Sabtu|Minggu/gi, '')
            .replace(/,/g, '')
            .trim();

        const parts = clean.split(' ');
        if (parts.length < 3) return null;

        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const year = parseInt(parts[2]);

        const monthIndex = monthsIndo.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
        if (monthIndex === -1) return null;

        return new Date(year, monthIndex, day);
    } catch (e) {
        console.error('Date parsing error:', e, 'for string:', dateStr);
        return null;
    }
}

export function getKajianStatus(dateStr: string, waktuStr?: string): 'PAST' | 'TODAY' | 'TOMORROW' | 'UPCOMING' {
    const kajianDate = parseIndoDate(dateStr);
    if (!kajianDate) return 'UPCOMING';

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(kajianDate);
    targetDate.setHours(0, 0, 0, 0);

    const tDate = targetDate.getTime();
    const dToday = today.getTime();
    const dTomorrow = tomorrow.getTime();

    if (tDate < dToday) return 'PAST';

    // Check for Tomorrow
    if (tDate === dTomorrow) return 'TOMORROW';

    if (tDate > dToday && tDate !== dTomorrow) return 'UPCOMING';

    // It's Today, let's check the time if provided
    if (waktuStr) {
        const lowerWaktu = waktuStr.toLowerCase();

        // Special handling for Ba'da Maghrib -> Max 20:00
        if (lowerWaktu.includes('maghrib') && (lowerWaktu.includes('selesai') || lowerWaktu.includes('isya'))) {
            const maghribDone = new Date();
            maghribDone.setHours(20, 0, 0, 0); // 20:00 limit
            if (now.getTime() > maghribDone.getTime()) return 'PAST';
        }

        // Special handling for Ba'da Shubuh -> Max 06:15
        if ((lowerWaktu.includes('shubuh') || lowerWaktu.includes('subuh')) && lowerWaktu.includes('selesai')) {
            const shubuhDone = new Date();
            shubuhDone.setHours(6, 15, 0, 0); // 06:15 limit
            if (now.getTime() > shubuhDone.getTime()) return 'PAST';
        }

        // Special handling for Sholat Jumat
        // User def: 11.45 - 12.45. If currently > 12:45, it is PAST.
        if (lowerWaktu.includes('jumat') || lowerWaktu.includes("jum'at")) {
            const jumatDone = new Date();
            jumatDone.setHours(12, 45, 0, 0);
            if (now.getTime() > jumatDone.getTime()) return 'PAST';
        }

        // Try to find a time pattern like 08:00 or 08.00
        // We look for the LAST time in the string as it might be the end time
        // e.g. "08:00 - 11:30" -> 11:30
        const timeMatches = waktuStr.match(/(\d{1,2})[:.](\d{2})/g);

        if (timeMatches) {
            const lastTime = timeMatches[timeMatches.length - 1];
            const [h, m] = lastTime.split(/[:.]/).map(n => parseInt(n));

            const eventTime = new Date();
            eventTime.setHours(h, m, 0, 0);

            // If current time is after the last mentioned time, mark as PAST
            if (now.getTime() > eventTime.getTime()) return 'PAST';
        } else if (lowerWaktu.includes('shubuh') || lowerWaktu.includes('subuh')) {
            // Fallback for Shubuh if no specific time is found but user said "Ba'da Shubuh"
            // Previous default was 08:30, but maybe we should align closer to 06:15 or stick to 07:00?
            // Let's stick to 06:30 as a safe fallback for general Shubuh studies without "selesai" label?
            // Or keep 08:30? The user request specifically mentioned "Ba'da Shubuh - Selesai" is 05:00-06:15.
            // If it just says "Ba'da Shubuh", usually it's short. Let's set fallback to 06:30.
            const shubuhDone = new Date();
            shubuhDone.setHours(6, 30, 0, 0);
            if (now.getTime() > shubuhDone.getTime()) return 'PAST';
        }
    }

    return 'TODAY';
}

export function formatIndoDate(date: Date): string {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = monthsIndo[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
}

export function formatYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getHijriDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

export function isKajianOngoing(dateStr: string, waktuStr: string): boolean {
    // 1. Check if date is TODAY
    const status = getKajianStatus(dateStr, waktuStr);
    if (status === 'PAST' || status === 'TOMORROW' || status === 'UPCOMING') return false;

    // It's TODAY. Now check precise time.
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const lowerWaktu = waktuStr.toLowerCase();

    // Standard mappings based on user request
    const ranges = [
        { key: /syuruq/i, start: 5 * 60 + 30, end: 6 * 60 + 45 }, // 05:30 - 06:45
        { key: /(shubuh|subuh)/i, start: 5 * 60, end: 6 * 60 + 30 }, // 05:00 - 06:30
        { key: /(dhuhur|luhur|zuhur)/i, start: 12 * 60 + 30, end: 14 * 60 + 30 }, // 12:30 - 14:30
        { key: /(ashar|asar)/i, start: 15 * 60 + 30, end: 17 * 60 }, // 15:30 - 17:00
        { key: /maghrib/i, start: 18 * 60, end: 19 * 60 + 30 }, // 18:00 - 19:30
        { key: /(isya|isa)/i, start: 19 * 60 + 45, end: 21 * 60 }, // 19:45 - 21:00
        { key: /(jumat|jum'at)/i, start: 11 * 60 + 45, end: 13 * 60 }, // 11:45 - 13:00 (Approx for Jumat)
    ];

    // Priority 1: Check keyword mappings
    for (const range of ranges) {
        if (range.key.test(lowerWaktu)) {
            if (currentTime >= range.start && currentTime <= range.end) {
                return true;
            }
        }
    }

    // Priority 2: Check explicit time ranges (e.g. "09:00 - 11:00")
    // Regex to find HH:MM
    const timeMatches = lowerWaktu.match(/(\d{1,2})[:.](\d{2})/g);
    if (timeMatches && timeMatches.length >= 2) {
        // Assume first match is start, last match is end
        const startMatch = timeMatches[0];
        const endMatch = timeMatches[timeMatches.length - 1];

        const parseTimeCoords = (str: string) => {
            const [h, m] = str.split(/[:.]/).map(Number);
            return h * 60 + m;
        };

        const startTime = parseTimeCoords(startMatch);
        const endTime = parseTimeCoords(endMatch);

        // If "Selesai" is keyword, maybe extend end time? But let's trust explicit time.
        if (currentTime >= startTime && currentTime <= endTime) {
            return true;
        }
    }

    return false;
}

export function formatMasjidName(name: string): string {
    if (!name) return '';
    const n = name.trim();
    const lower = n.toLowerCase();

    // List of common prefixes that should NOT have "Masjid" prepended
    const prefixes = [
        'masjid', 'mushalla', 'mushola', 'islamic center', 'ic ', 'ic-',
        'studio', 'aula', 'markaz', 'pesantren', 'ponpes', 'mahad', 'ma\'had',
        'balai', 'kantor', 'rumah', 'lapangan'
    ];

    const hasPrefix = prefixes.some(p => lower.startsWith(p));

    // Ignore cases where it's TBD or Online
    if (lower === 'tbd' || lower === 'online' || lower.includes('zoom')) {
        return n;
    }

    if (!hasPrefix) {
        return `Masjid ${n}`;
    }

    return n;
}
