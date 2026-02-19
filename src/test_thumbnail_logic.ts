
// Mock of the logic used in batch-input/page.tsx
function getThumbnail(entry: { tema?: string, waktu?: string }) {
    const isTarawih = entry.tema?.toLowerCase().includes('tarawih') || entry.waktu?.toLowerCase().includes('tarawih');
    const isFriday = !isTarawih && (entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || (entry.tema || '') === '');

    if (isTarawih) return '/images/tarawih-cover.svg';
    if (isFriday) return '/images/khutbah-jumat-cover.png';
    return undefined;
}

const testCases = [
    {
        name: 'Khutbah Jumat Standard',
        input: { tema: 'Khutbah Jumat', waktu: '12.00 - Selesai' },
        expected: '/images/khutbah-jumat-cover.png'
    },
    {
        name: 'Shalat Tarawih on Friday',
        input: { tema: 'Shalat Tarawih', waktu: "Ba'da Isya (Jumat)" },
        expected: '/images/tarawih-cover.svg'
    },
    {
        name: 'Tarawih in Waktu only',
        input: { tema: 'Kajian Rutin', waktu: 'Shalat Tarawih' },
        expected: '/images/tarawih-cover.svg'
    },
    {
        name: 'Just Friday in Waktu',
        input: { tema: 'Kajian Umum', waktu: 'Jumat' },
        expected: '/images/khutbah-jumat-cover.png' // Should default to friday cover if no other info? logic says yes.
    },
    {
        name: 'Normal Kajian on Friday but not Jumat Prayer',
        // Current logic: if waktu includes 'jumat', it defaults to khutbah cover.
        // This might be debated, but for now we test adherence to current logic + tarawih fix.
        input: { tema: 'Kajian Hadits', waktu: 'Hari Jumat, 16.00' },
        expected: '/images/khutbah-jumat-cover.png'
    },
    {
        name: 'Normal Kajian no Friday no Tarawih',
        input: { tema: 'Kajian Hadits', waktu: 'Sabtu' },
        expected: undefined
    }
];

console.log('--- Testing Thumbnail Logic ---');
let failed = 0;
testCases.forEach((tc, i) => {
    const result = getThumbnail(tc.input);
    const pass = result === tc.expected;
    if (!pass) failed++;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${tc.name}`);
    if (!pass) {
        console.log(`   Input: ${JSON.stringify(tc.input)}`);
        console.log(`   Expected: ${tc.expected}`);
        console.log(`   Actual:   ${result}`);
    }
});

if (failed === 0) {
    console.log('\nAll tests passed! ✅');
} else {
    console.log(`\n${failed} tests failed. ❌`);
    process.exit(1);
}
