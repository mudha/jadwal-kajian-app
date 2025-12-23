
function parseKajianBroadcast(text) {
    const cleanText = text.replace(/[\u200B-\u200D\uFEFF\u2063]/g, '').trim();
    const lines = cleanText.split('\n').map(line => line.trim());

    // Simple detection for test
    return parseRekapanFormat(lines);
}

function cleanValue(val) {
    if (!val) return '';
    let result = val.replace(/[】】］\]\[［【○●▶️🚩📍🕌🕍🌏≡]/gu, ' ');
    result = result.replace(/[\*_~`]/g, '');
    result = result.replace(/^[ \-\:\|\u200B-\u200D\uFEFF\u2063\t\n\r\.\,]+/, '');
    result = result.replace(/[ \-\:\|\u200B-\u200D\uFEFF\u2063\t\n\r\.\,]+$/, '');
    return result.trim();
}

function normalizeCity(city) {
    const raw = cleanValue(city).toUpperCase();
    return cleanValue(city); // Simplified for test
}

function parseRekapanFormat(lines) {
    const entries = [];
    let currentDate = '';
    let currentCity = '';

    let tempEntry = null;

    const finalize = (entry) => {
        if (!entry.masjid) return;
        entries.push({
            masjid: cleanValue(entry.masjid),
            pemateri: cleanValue(entry.pemateri || 'TBD'),
            tema: cleanValue(entry.tema || 'Kajian'),
            waktu: cleanValue(entry.waktu || 'TBD'),
            date: cleanValue(entry.date || currentDate || 'TBD'),
        });
    };

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Enhanced Date Header detection
        const dateMatch = line.match(/[\*]*[▶️▶🗓📅][\*]*\s*([^▶️▶🗓📅\*]+)/i);
        if (dateMatch) {
            const val = cleanValue(dateMatch[1]);
            if (val.length > 8) {
                currentDate = val;
            }
        }

        if (!currentDate && /^(?:Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Ahad)/i.test(cleanValue(line))) {
            currentDate = cleanValue(line);
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('🕌') || line.includes('🕍')) {
            if (tempEntry) finalize(tempEntry);
            const parts = line.split(/[🕌🕍]/);
            tempEntry = { masjid: cleanValue(parts[parts.length - 1]) };
        }
        else if (tempEntry) {
            const upperLine = line.toUpperCase();

            if (upperLine.includes('PEMATERI')) {
                if (tempEntry.pemateri) finalize(tempEntry);
                tempEntry.pemateri = cleanValue(line.split(/Pemateri\s*[:\-]/i).pop() || '');
            } else if (upperLine.includes('TEMA')) {
                tempEntry.tema = cleanValue(line.split(/Tema\s*[:\-]/i).pop() || '');
            } else if (upperLine.includes('WAKTU')) {
                tempEntry.waktu = cleanValue(line.split(/Waktu\s*[:\-]/i).pop() || '');
            } else if (line.trim() === '***' || line.trim() === '.') {
                finalize(tempEntry);
                tempEntry = null;
            }
        }
    }

    if (tempEntry) finalize(tempEntry);
    return entries;
}

// TEST RUNNER
const input = `
*🕋REKAPAN KAJIAN SUNNAH INDONESIA🕋*
*☪️Untuk Wilayah Jabodetabek & Sekitarnya☪️*
\`✍🏻Creative by : Tim Jadwal Kajian Kaskus\`
*▶️Selasa, 23 Desember 2025*
_Pekan Ke-empat_
.
---------
> *⛔️Dilarang Mengubah (Menambahkan / Mengurangi) Isi Seluruh Rakapan ini Tanpa se-Izin Dari Tim Jadwal Kajian Kaskus⛔️*
.
📱 WhatsApp (WA) Channel / Saluran : https://whatsapp.com/channel/0029VamBns5KLaHl0a7jma1t
.
> ✅ Perhatian : Kami Tim Jadwal Kajian Kaskus hanya memberikan informasi kajian dan bukan sebagai pihak penyelenggara, Mohon cek kembali info rekapan yang kami dapat dan telah kami rangkum.
.
《《 JABODETABEK 》》
.
*○●JAK-TIM●○*
.
🕌 Masjid Fatahillah
(Komplek AD Bulak Rantai)
Kp. Tengah, Kec. Kramat jati, Kota Jakarta Timur
🌏 G-maps :  https://goo.gl/maps/XqH3SNkUmQY289R36
Pemateri : Ustadz Azhar Khalid bin Seff, Lc., M.A
Tema : Ada Apa Dengan Rajab?
Waktu : 09.00 WIB – selesai
CP : – 🚹/🚺
***
.
🕌 Masjid Soleh Hawa
Jl. Raya Ceger No.3, RT.5/RW.1, Ceger, Kec. Cipayung, Kota Jakarta Timur
🌏 G-maps : https://maps.app.goo.gl/6dSvjLiXdJTJiqY69
≡ SESI 1
Pemateri : Ustadz Dr. Khalid Basalamah, M.A
Tema : Kitab Kunci Sukses di Alam Kubur,
bab : Ribath di Jalan Allah
Waktu : 12.30 WIB – selesai (khusus akhwat)
≡ SESI 2
Pemateri : Ustadz Abu Usaamah Syamsul Hadi
Tema : Tafsir QS. An-Nazi'at
Waktu : Ba'da Maghrib – selesai
CP : 0852-1235-0060  🚹🚺
***
`;

console.log('Testing Parser Standalone JS...');
const result = parseKajianBroadcast(input);
console.log('Extracted Date:', result.length > 0 ? result[0].date : 'No entries');
console.log('Extracted Time:', result.length > 0 ? result[0].waktu : 'No entries');

if (result.length > 0 && result[0].date !== 'TBD') {
    console.log('SUCCESS: Date found!');
} else {
    console.log('FAIL: Date is TBD');
}
