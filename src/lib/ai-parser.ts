
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KajianEntry } from "./parser";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function parseWithGemini(originalText: string): Promise<KajianEntry[]> {
    if (!API_KEY) {
        throw new Error("API Key Gemini belum disetting di .env.local");
    }

    // Menggunakan Gemini 2.5 Flash (terbaru dan lebih canggih!)
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const prompt = `
    Saya memiliki teks broadcast WhatsApp berisi informasi kajian sunnah ATAU rekapan Sholat Jumat.
    Tolong ekstrak data di dalamnya menjadi array JSON dengan format typescript berikut:
    
    interface KajianEntry {
        region: string; // Misal: INDONESIA, JABODETABEK
        city: string; // Misal: Jakarta Timur, Bogor (Normalisasi nama kota)
        masjid: string; // Nama masjid
        address: string; // Alamat lengkap
        gmapsUrl: string; // Link google maps jika ada
        pemateri: string; // Nama pemateri. Jika ada LEBIH DARI SATU pemateri di acara yang sama, gabungkan dengan " & " (contoh: "Ust A & Ust B"). Untuk Sholat Jumat, ambil dari "Khatib / Imam".
        tema: string; // Judul kajian. Jika ada LEBIH DARI SATU tema untuk acara yang sama, gabungkan dengan " | ". Untuk Sholat Jumat, jika tema "-", biarkan kosong.
        waktu: string; // Jam kajian. PENTING: Normalisasi waktu ke format yang rapi!
        date: string; // Tanggal kajian (Misal: Senin, 23 Desember 2025). Cari di header global jika tidak ada di entri.
        cp: string; // Contact Person (hanya nomor HP/nama, jangan link WA channel)
        khususAkhwat: boolean; // True jika ada kata "khusus akhwat", "akhwat only", "khusus wanita", ATAU jika pematerinya adalah seorang "Ustadzah" (karena ustadzah biasanya mengisi kajian khusus wanita). False jika untuk umum atau ikhwan-akhwat.
        linkInfo: string; // Link pendaftaran, streaming, atau WAG (Ambil link yang paling penting untuk user)
        isOnline: boolean; // True jika acara diselenggarakan via Zoom, YouTube, GMeet, atau platform online lainnya.
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
    5. **SHOLAT JUMAT**: Jika teks adalah rekapan Sholat Jumat:
       - Field 'waktu' diisi "Sholat Jumat" (atau waktu spesifik jika ada, misal "11.30 - 13.00 WIB").
       - Field 'pemateri' diambil dari baris "Khatib / Imam".
       - Field 'tema' jika isinya "-" atau strip, kosongkan saja.
    6. **KAJIAN ONLINE**: Jika acara diselenggarakan secara Online (Zoom, YouTube, dll):
       - Field 'isOnline' set ke true.
       - Field 'city', 'masjid', dan 'address' otomatis diisi "Online".
       - Simpan link Zoom, Meeting ID, atau detail lainnya di 'linkInfo' atau 'address' agar user tahu cara aksesnya.
    7. **MULTI-SPEAKER**: Jika satu acara punya BEBERAPA pemateri, gabungkan jadi satu entry dengan " & ".
    8. **KHUSUS AKHWAT**: Set true jika ada indikator khusus wanita ATAU pematerinya Ustadzah.
    9. **LINK INFO**: Ambil link pendaftaran > link Zoom > streaming > WAG.
    10. **GMAPS**: Ambil link gmaps jika ada. Kosongkan (null) jika Online.
    11. Output HANYA JSON text murni tanpa markdown formatting (tanpa \`\`\`json).

        TEKS BROADCAST:
            ${originalText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson) as KajianEntry[];
    } catch (error: any) {
        console.error("Error parsing with Gemini:", error);
        const errorMessage = error.message || "Kesalahan tidak diketahui";
        throw new Error(`Gagal mengekstrak data menggunakan AI: ${errorMessage}`);
    }
}
