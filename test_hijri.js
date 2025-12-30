
const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' ath-Thani',
    'Jumada al-Ula', 'Jumada ath-Thaniyah', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul-Qa\'dah', 'Dhul-Hijjah'
];

function toHijri(gregorianDate) {
    const gYear = gregorianDate.getFullYear();
    const gMonth = gregorianDate.getMonth();
    const gDay = gregorianDate.getDate();

    const julianDay = Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
        Math.floor((367 * (gMonth - 2 - 12 * (Math.floor((gMonth - 14) / 12)))) / 12) -
        Math.floor((3 * (Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100))) / 4) +
        gDay - 32075;
    const hijriJD = julianDay - 1948440 + 10632;
    const y = Math.floor((30 * hijriJD + 10646) / 10631);
    const month = Math.min(12, Math.ceil((hijriJD - 29 - Math.floor((y - 1) * 10631 / 30)) / 29.5) + 1);
    const day = hijriJD - Math.floor((y - 1) * 10631 / 30) - Math.floor((month - 1) * 29.5) + 1;

    return {
        year: Math.floor(y),
        month: Math.floor(month),
        day: Math.floor(day),
        monthName: HIJRI_MONTHS[Math.floor(month) - 1] || 'Unknown'
    };
}

// Check Dec 30 2025
const today = new Date('2025-12-30');
console.log('30 Dec 2025:', toHijri(today));

// Check Feb 18 2026 (Expected Approx start of Ramadhan 1447H)
const startRamadhan = new Date('2026-02-18');
console.log('18 Feb 2026:', toHijri(startRamadhan));

// Check mid Ramadhan
const midRamadhan = new Date('2026-03-01');
console.log('01 Mar 2026:', toHijri(midRamadhan));
