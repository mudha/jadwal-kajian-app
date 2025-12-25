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
        } else if (waktuStr.toLowerCase().includes('shubuh') || waktuStr.toLowerCase().includes('subuh')) {
            // Special handling for Ba'da Shubuh, usually done by 08:30
            const shubuhDone = new Date();
            shubuhDone.setHours(8, 30, 0, 0);
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
