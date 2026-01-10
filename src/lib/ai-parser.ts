
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KajianEntry } from "./parser";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function parseWithGemini(originalText: string): Promise<KajianEntry[]> {
    if (!API_KEY) {
        throw new Error("API Key Gemini belum disetting di .env.local");
    }

    // Menggunakan Gemini 2.0 Flash (Latest & Fast)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Saya memiliki teks broadcast WhatsApp berisi informasi kajian sunnah ATAU rekapan Sholat Jumat.
    Tolong ekstrak data di dalamnya menjadi array JSON dengan format typescript berikut:
    
    interface KajianEntry {
        region: string; // Misal: INDONESIA, JABODETABEK
        city: string; // Misal: Jakarta Timur, Bogor (Normalisasi nama kota)
        masjid: string; // Nama masjid
        address: string; // Alamat lengkap
        gmapsUrl: string; // Link google maps jika ada
        pemateri: string; // Pemateri utama / pertama
        pemateri2?: string; // Pemateri kedua (jika ada lebih dari 1 pemateri di acara yang sama)
        pemateri3?: string; // Pemateri ketiga (jika ada)
        tema: string; // Judul kajian. Jika ada LEBIH DARI SATU tema untuk acara yang sama, gabungkan dengan " | ". Untuk Sholat Jumat, jika tema "-", biarkan kosong.
        waktu: string; // Jam kajian. PENTING: Normalisasi waktu ke format yang rapi!
        waktu_mulai?: string; // Waktu mulai spesifik (jika bisa dideteksi)
        waktu_selesai?: string; // Waktu selesai spesifik (jika ada, default: "Selesai")
        date: string; // Tanggal kajian (Misal: Senin, 23 Desember 2025). Cari di header global jika tidak ada di entri.
        cp: string; // Contact Person (hanya nomor HP/nama, jangan link WA channel)
        khususAkhwat: boolean; // True jika ada kata "khusus akhwat", "akhwat only", "khusus wanita", ATAU jika pematerinya adalah seorang "Ustadzah". False jika untuk umum atau ikhwan-akhwat.
        linkInfo: string; // Link pendaftaran, streaming, atau WAG (Ambil link yang paling penting untuk user)
        isOnline: boolean; // True jika acara diselenggarakan via Zoom, YouTube, GMeet, atau platform online lainnya.
        catatan?: string; // Catatan tambahan dari panitia (misal: "Membawa makanan untuk berbuka", "Dresscode Muslimah", "Pendaftaran wajib", "Free Konsumsi", "Khusus Ikhwan", dll). Jangan isi jika tidak ada catatan spesial.
    }

    ATURAN KHUSUS:
    1. Bersihkan semua emoji sampah, karakter aneh seperti '】', '▶️', '○●', '《《', '》》' dari hasil ekstraksi.
    2. Jika tanggal ada di header (bagian atas teks), gunakan tanggal itu untuk semua entri di bawahnya (Contoh: "Jum'at, 26 Desember 2025").
    3. Normalkan nama kota singkatan:
       - JAK-TIM -> Jakarta Timur
       - JAK-SEL -> Jakarta Selatan
       - JAK-BAR -> Jakarta Barat
       - JAK-PUS -> Jakarta Pusat
       - JAK-UT -> Jakarta Utara
       - TANG-SEL -> Tangerang Selatan
       - BOGOR, DEPOK, BEKASI, BANDUNG -> Biarkan normal.
    4. **WAKTU (SANGAT PENTING!)**: Field 'waktu' harus dinormalisasi dengan aturan berikut:
       - Jika ada kata "ba'da", "ba'da", "ba'dha", "bada", "setelah", "habis", "usai" diikuti nama sholat, normalisasi jadi "Ba'da [Nama Sholat] - Selesai"
       - Contoh: "ba'da magrib", "bada maghrib", "setelah maghrib" -> "Ba'da Maghrib - Selesai"
       - Contoh: "ba'da shubuh", "bada subuh" -> "Ba'da Shubuh - Selesai"
       - Contoh: "ba'da dzuhur", "bada dhuhur", "ba'da luhur" -> "Ba'da Dhuhur - Selesai"
       - Contoh: "ba'da ashar", "ba'da asar" -> "Ba'da Ashar - Selesai"
       - Contoh: "ba'da isya", "ba'da isa" -> "Ba'da Isya - Selesai"
       - Jika hanya nama sholat saja (misal: "Maghrib", "Shubuh") tanpa ba'da, format jadi "[Nama Sholat] - Selesai"
       - Jika ada jam spesifik (misal: "19.00", "07:30 WIB"), pertahankan formatnya (misal: "19.00 - Selesai" atau "07.30 WIB")
       - Normalisasi ejaan sholat: subuh/shubuh->Shubuh, dzuhur/dhuhur/zuhur/luhur->Dhuhur, asar/ashar->Ashar, magrib/maghrib->Maghrib, isa/isya->Isya
       - Jika bisa detect waktu mulai dan selesai yang berbeda, isi field waktu_mulai dan waktu_selesai juga
    5. **MULTIPLE PEMATERI (PENTING!)**: Jika ada LEBIH DARI SATU pemateri dalam SATU acara (sama tanggal, sama masjid):
       - Jangan buat entry terpisah!
       - Pisahkan pemateri ke field pemateri, pemateri2, dan pemateri3
       - Deteksi separator seperti: "&", "dan", "," (koma)
       - Contoh: "Ust. Ahmad & Ust. Budi" -> pemateri: "Ust. Ahmad", pemateri2: "Ust. Budi"
       - Contoh: "Ust. A, Ust. B, Ust. C" -> pemateri: "Ust. A", pemateri2: "Ust. B", pemateri3: "Ust. C"
    6. **CATATAN (PENTING!)**: Field 'catatan' untuk informasi tambahan dari panitia:
       - Contoh catatan: "Membawa makanan untuk berbuka", "Dresscode Muslimah", "Pendaftaran wajib", "Free Konsumsi", "Khusus Ikhwan", "Absensi diwajibkan", "Bawa alat tulis"
       - JANGAN masukkan info yang sudah masuk kategori lain (tema, pemateri, waktu, dll)
       - Kosongkan jika tidak ada catatan khusus
    7. **SHOLAT JUMAT**: Jika teks adalah rekapan Sholat Jumat:
       - Field 'waktu' diisi "Sholat Jumat" (atau waktu spesifik jika ada, misal "11.30 - 13.00 WIB").
       - Field 'pemateri' diambil dari baris "Khatib / Imam".
       - Field 'tema' jika isinya "-" atau strip, kosongkan saja.
    8. **KAJIAN ONLINE**: Jika acara diselenggarakan secara Online (Zoom, YouTube, dll):
       - Field 'isOnline' set ke true.
       - Field 'city', 'masjid', dan 'address' otomatis diisi "Online".
       - Simpan link Zoom, Meeting ID, atau detail lainnya di 'linkInfo' atau 'address' agar user tahu cara aksesnya.
    9. **KHUSUS AKHWAT**: Set true jika ada indikator khusus wanita ATAU pematerinya Ustadzah.
    10. **LINK INFO**: Ambil link pendaftaran > link Zoom > streaming > WAG.
    11. **GMAPS**: Ambil link gmaps jika ada. Kosongkan (null) jika Online.
    12. **MASJID & ALAMAT (SANGAT PENTING!)**: Ekstrak nama masjid dan alamat APA ADANYA sesuai teks. JANGAN mencoba menormalisasi atau mengubah nama masjid ke versi "resmi" jika di teks berbeda.
    13. Output HANYA JSON text murni tanpa markdown formatting (tanpa \`\`\`json).
    14. JANGAN PERNAH MENGGUNAKAN NILAI 'undefined' dalam JSON. Jika field kosong/tidak ada, gunakan NULL atau string kosong "". JSON tidak valid jika ada 'undefined'.
    15. Pastikan struktur JSON valid sepenuhnya.
    16. **CONTOH FORMAT KHUSUS (SURABAYA MENGAJI)**:
        Jika formatnya seperti ini:
        "📝 *JADWAL KAJIAN SURABAYA & SEKITARNYA* 
        🗓️ *Senin Ke-1, 5 Januari 2025*"
        Maka:
        - Ambil tanggal "5 Januari 2025" dari header tersebut untuk semua item dibawahnya.
        - Abaikan teks intro seperti "Disusun oleh...", "Share info ini...".
        - ⏰ = Waktu
        - 📚 = Tema/Kitab
        - 👤 = Pemateri
        - 📍 = Masjid/Lokasi

    16. **CONTOH FORMAT KHUSUS (PALEMBANG)**:
        Jika format header seperti: "🔰 Jadwal Kajian Kota Palembang 🔰"
        Dan tanggal: "📆 Selasa, 17 Syakban 1447 H / 6 Januari 2026 M"
        Maka:
        - Tanggal Global: Ambil tanggal Masehi "6 Januari 2026". Gunakan untuk SEMUA item di bawahnya.
        - Kota Default: "Palembang". Jika nama masjid disebut (misal "Masjid At-Tauhid"), dan tidak ada kota lain disebut, ASUMSIKAN di "Palembang".
        - Emojis:
          - 🕌 = Masjid & Alamat & Link Maps (Link di baris bawahnya)
          - ⏰ = Waktu
          - 👤 = Pemateri
          - 📚 = Tema
          - 👥 = Target (Abaikan field ini, tapi set khususAkhwat=true jika cuma "Akhwat")
        - Pemisahan Item: Tiap item biasanya diawali dengan emoji 🕌 (Masjid).

    TEKS BROADCAST:
            ${originalText}
    `;

    try {
        let result;
        let retries = 3;
        let delay = 2000;

        while (retries > 0) {
            try {
                result = await model.generateContent(prompt);
                break; // Sukses, keluar dari loop
            } catch (err: any) {
                const isOverloaded = err.message?.includes('503') ||
                    err.message?.includes('overloaded') ||
                    err.message?.includes('504') ||
                    err.message?.includes('429');

                if (isOverloaded && retries > 1) {
                    retries--;
                    console.warn(`Gemini sibuk (503), mencoba lagi dalam ${delay / 1000} detik... (Sisa percobaan: ${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                    continue;
                }
                throw err;
            }
        }

        if (!result) throw new Error("Gagal mendapatkan respon dari AI setelah beberapa kali mencoba.");

        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // SANITIZE: Replace invalid 'undefined' values with 'null' because Gemini sometimes hallucinates undefined in JSON
        cleanJson = cleanJson.replace(/:\s*undefined/g, ': null');

        return JSON.parse(cleanJson) as KajianEntry[];
    } catch (error: any) {
        console.error("Error parsing with Gemini:", error);
        const errorMessage = error.message || "Kesalahan tidak diketahui";
        throw new Error(`Gagal mengekstrak data menggunakan AI: ${errorMessage}`);
    }
}
