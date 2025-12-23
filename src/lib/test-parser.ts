import { parseKajianBroadcast } from './parser';

const sampleText = `
*🕋REKAPAN KAJIAN SUNNAH INDONESIA🕋*
*☪️Untuk Wilayah Jabodetabek & Sekitarnya☪️*
\`✍🏻Creative by : Tim Jadwal Kajian Kaskus\`
*▶️Selasa, 23 Desember 2025*
_Pekan Ke-empat_
.
---------
> *⛔️Dilarang Mengubah (Menambahkan / Mengurangi) Isi Seluruh Rakapan ini Tanpa se-Izin Dari Tim Jadwal Kajian Kaskus⛔️*
.
《《 JABODETABEK 》》
.
*○●JAK-TIM●○*
.
🕌 Masjid Fatahillah
(Komplek AD Bulak Rantai)
Kp. Tengah, Kec. Kramat jati, Kota Jakarta Timur
🌏 G-maps :  https://goo.gl/maps/XqH3SNkUmQY289R36
】Pemateri : Ustadz Azhar Khalid bin Seff, Lc., M.A
】Tema : Ada Apa Dengan Rajab?
】Waktu : 09.00 WIB – selesai
】CP : – 🚹/🚺
***
.
🕌 Masjid Soleh Hawa
Jl. Raya Ceger No.3, RT.5/RW.1, Ceger, Kec. Cipayung, Kota Jakarta Timur
🌏 G-maps : https://maps.app.goo.gl/6dSvjLiXdJTJiqY69
≡ SESI 1
】Pemateri : Ustadz Dr. Khalid Basalamah, M.A
】Tema : Kitab Kunci Sukses di Alam Kubur,
bab : Ribath di Jalan Allah
】Waktu : 12.30 WIB – selesai (khusus akhwat)
≡ SESI 2
】Pemateri : Ustadz Abu Usaamah Syamsul Hadi
】Tema : Tafsir QS. An-Nazi'at
】Waktu : Ba'da Maghrib – selesai
】CP : 0852-1235-0060  🚹🚺
***
`;

console.log("Testing Parser...");
const results = parseKajianBroadcast(sampleText);
// console.log(JSON.stringify(results, null, 2));

import * as fs from 'fs';
fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
console.log("Results written to output.json");

if (results.length === 2 || results.length >= 2) {
    // Note: The second entry "Masjid Soleh Hawa" has SESI 1 and SESI 2. 
    // My parser logic currently resets on '🕌', so SESI 2 might be merged or ignored or overwrite depending on logic.
    // Ideally SESI 1 and SESI 2 should be separate entries or one complex entry. 
    // Let's see how simple logic handles it. If it overwrites, I need to fix.
    console.log("Parser test run complete.");
} else {
    console.warn("Unexpected number of results:", results.length);
}
