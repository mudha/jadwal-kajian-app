
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
        waktu: string; // Jam kajian (Misal: 09.00 - Selesai). Untuk Sholat Jumat jika tidak ada jam, isi "Sholat Jumat".
        date: string; // Tanggal kajian (Misal: Senin, 23 Desember 2025). Cari di header global jika tidak ada di entri.
        cp: string; // Contact Person (hanya nomor HP/nama, jangan link WA channel)
        khususAkhwat: boolean; // True jika ada kata "khusus akhwat", "akhwat only", "khusus wanita", dll. False jika untuk umum atau ikhwan-akhwat.
        linkInfo: string; // Link pendaftaran, streaming, atau WAG (Ambil link yang paling penting untuk user)
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
    4. **SHOLAT JUMAT**: Jika teks adalah rekapan Sholat Jumat:
       - Field 'waktu' diisi "Sholat Jumat" (atau "11.30 - 13.00 WIB" jika mau spesifik).
       - Field 'pemateri' diambil dari baris "Khatib / Imam".
       - Field 'tema' jika isinya "-" atau strip, kosongkan saja.
    5. **MULTI-SPEAKER**: Jika satu acara punya BEBERAPA pemateri, gabungkan jadi satu entry dengan " & ".
    6. **KHUSUS AKHWAT**: Set true jika ada indikator khusus wanita.
    7. **LINK INFO**: Ambil link pendaftaran > streaming > WAG.
    8. **GMAPS**: Ambil link gmaps jika ada.
    9. Output HANYA JSON text murni tanpa markdown formatting (tanpa \`\`\`json).
    
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
