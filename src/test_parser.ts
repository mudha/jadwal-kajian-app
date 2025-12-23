
import { parseKajianBroadcast } from './lib/parser';

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

console.log('Testing Parser...');
const result = parseKajianBroadcast(input);
console.log(JSON.stringify(result, null, 2));

if (result.length > 0 && result[0].date === 'TBD') {
    console.error('FAIL: Date is TBD');
} else {
    console.log('SUCCESS: Date extracted:', result.length > 0 ? result[0].date : 'No entries');
}
