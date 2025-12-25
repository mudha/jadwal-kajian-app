# WhatsApp Share dengan Gambar - Manual Update

## ✅ Yang Sudah Selesai:
1. ✅ Helper function `shareToWhatsApp()` sudah dibuat di `src/lib/whatsapp-share.ts`
2. ✅ Import sudah ditambahkan di `src/app/kajian/page.tsx` (line 12)

## 📝 Yang Perlu Diupdate Manual:

### File: `src/app/kajian/page.tsx`

**Cari baris sekitar line 593-596:**

```tsx
onClick={() => {
    const text = `*INFO KAJIAN SUNNAH*\\n\\n🕌 *Masjid:* ${kajian.masjid}\\n👤 *Pemateri:* ${kajian.pemateri}\\n📚 *Tema:* ${kajian.tema}\\n🗓 *Hari/Tgl:* ${kajian.date}\\n⏰ *Waktu:* ${kajian.waktu}\\n📍 *Lokasi:* ${kajian.gmapsUrl || kajian.address}\\n\\n_Disebarkan melalui Aplikasi Jadwal Kajian_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}}
```

**Ganti menjadi:**

```tsx
onClick={() => shareToWhatsApp(kajian)}
```

---

## 🎯 Hasil Akhir:

Setelah perubahan, tombol Share WhatsApp akan:
- ✅ Mengirim info kajian lengkap
- ✅ **Menyertakan link ke gambar poster** (jika ada)
- ✅ User bisa langsung klik link untuk lihat/download poster

### Contoh Pesan WhatsApp:

```
*INFO KAJIAN SUNNAH*

🕌 *Masjid:* Masjid Al-Ikhlas
👤 *Pemateri:* Ustadz Ahmad
📚 *Tema:* Tafsir Surat Al-Baqarah
🗓 *Hari/Tgl:* Kamis, 26 Desember 2025
⏰ *Waktu:* 19:30 - 21:00 WIB
📍 *Lokasi:* https://maps.google.com/...

📸 *Lihat Poster:*
https://example.com/poster.jpg

_Disebarkan melalui Aplikasi Jadwal Kajian_
```

---

## ⚠️ Catatan Penting:

WhatsApp Web API **tidak bisa** langsung attach gambar. Yang bisa dilakukan:
- ✅ Kirim link ke gambar (sudah diimplementasikan)
- ❌ Attach file gambar langsung (tidak didukung wa.me API)

User perlu:
1. Klik link poster di pesan WhatsApp
2. Download/save gambar
3. Forward manual jika perlu

Ini adalah limitasi dari WhatsApp Web API, bukan dari aplikasi kita.
