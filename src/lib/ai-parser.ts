
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
    Saya memiliki teks broadcast WhatsApp berisi jadwal kajian sunnah.
    Tolong ekstrak data di dalamnya menjadi array JSON dengan format typescript berikut:
    
    interface KajianEntry {
        region: string; // Misal: INDONESIA, JABODETABEK
        city: string; // Misal: Jakarta Timur, Bogor (Normalisasi nama kota)
        masjid: string; // Nama masjid
        address: string; // Alamat lengkap
        gmapsUrl: string; // Link google maps jika ada
        pemateri: string; // Nama pemateri. Jika ada LEBIH DARI SATU pemateri di acara yang sama, gabungkan dengan " & " (contoh: "Ust A & Ust B")
        tema: string; // Judul kajian. Jika ada LEBIH DARI SATU tema untuk acara yang sama (multiple speakers), gabungkan dengan " | " (contoh: "Tema A | Tema B")
        waktu: string; // Jam kajian (Misal: 09.00 - Selesai)
        date: string; // Tanggal kajian (Misal: Senin, 23 Desember 2025). Cari di header global jika tidak ada di entri.
        cp: string; // Contact Person (hanya nomor HP/nama, jangan link WA channel)
        khususAkhwat: boolean; // True jika ada kata "khusus akhwat", "akhwat only", "khusus wanita", dll. False jika untuk umum atau ikhwan-akhwat.
        linkInfo: string; // Link pendaftaran, streaming, atau WAG (Ambil link yang paling penting untuk user, misal link pendaftaran atau zoom)
    }

    ATURAN KHUSUS:
    1. Bersihkan semua emoji sampah, karakter aneh seperti '】', '▶️', dll dari hasil ekstraksi.
    2. Jika tanggal ada di header (bagian atas teks), gunakan tanggal itu untuk semua entri di bawahnya.
    3. Normalkan nama kota (Misal 'JAK-TIM' jadi 'Jakarta Timur').
    4. Jika ada data yg tidak tersedia, isi dengan "TBD" atau string kosong.
    5. Contact Person (CP) ambil nomor HP nya saja.
    6. **MULTI-SPEAKER**: Jika satu acara punya BEBERAPA pemateri (misal: "1. Ust A - Tema X, 2. Ust B - Tema Y"), JANGAN buat entry terpisah. Gabungkan jadi satu entry dengan pemateri="Ust A & Ust B" dan tema="Tema X | Tema Y".
    7. **KHUSUS AKHWAT**: Set khususAkhwat=true jika ada kata seperti "khusus akhwat", "only akhwat", "khusus wanita", "for sisters only", dll.
    8. **LINK INFO**: Jika ada link pendaftaran, streaming, zoom, atau WAG, ambil link yang PALING PENTING untuk user (prioritas: link pendaftaran > link streaming/zoom > link WAG). Simpan di field linkInfo.
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
