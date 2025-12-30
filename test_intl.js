
const date = new Date('2025-12-30');
const formatter = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
});
console.log('30 Dec 2025:', formatter.format(date));

const startRamadhan = new Date('2026-02-18');
console.log('18 Feb 2026:', formatter.format(startRamadhan));
