var { parseKajianBroadcast } = require('./lib/parser.ts'); // Will likely fail with TS, need to use built version or mock
// Actually better to just create a new test file in typescript or use existing JS runner if setup.
// Let's rely on the existing parser and just mock the execution context or create a quick ts-node script.

// However, I see `src/test_parser_standalone.js`. I can reuse that.
const text = `Belajar Bahasa Arab (Online)
Nahwu & Sharaf Mudah
Gratis Terbuka Untuk Umum

---------------

Rabu Malam,
12 Rajab 1447 H.
31 Desember 2025.

(Pukul: 20.00 WIB - Selesai) 

---------------

Pertemuan ke-26
Sesi Nahwu
• Isim Manshub: Hal

Sesi Sharaf
- Ragam Bina\` Bab Fa'ala - Yaf'ulu (Lanjutan)

Ustadz Abu 'Afiyah Agus Waluyo, Lc. حفظه الله

---------------

(Ada sesi interaktif & latihan tashrif)

Layanan Interaktif:
Telepon: (022) 8686-2637

Zoom Meeting ID: 857 9320 7069
Password: nahwumudah
(Klik) https://bit.ly/gabungnahwumudah

Kitab Panduan:
(Klik) https://bit.ly/46GwXdG

---------------

مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِى الدِّينِ

“Barangsiapa yang Allah kehendaki mendapatkan seluruh kebaikan, maka Allah akan memahamkan dia tentang agama.” (HR. Bukhari no. 71 dan Muslim No. 1037)

Subscribe & Dapatkan Kebaikannya
» (klik): bit.ly/tarbiyahsunnah

---------------

Didukung Oleh:
▪️Donat Bahagia
https://instagram.com/officialdonat_bahagia

---------------

RADIO TARBIYAH SUNNAH
Lillah, Nyunnah, Merenah`;

console.log("Testing Parser with provided text:");
// Mocking the TS import issue by manually checking logic or assuming I can run it via nextjs api if needed.
// But to speed up, I will create a reproduction unit test file I can run with ts-node if available, or just analyze the code.
// Given no ts-node in environment usually, I will modify `src/lib/parser.ts` directly based on analysis.
`;
