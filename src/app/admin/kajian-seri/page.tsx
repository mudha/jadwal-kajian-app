'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import ImageUpload from '@/components/ImageUpload';
import {
    Calendar,
    ArrowLeft,
    Save,
    Loader2,
    MapPin,
    Info,
    CheckCircle,
    Layers,
    X,
    RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { indonesianCities } from '@/data/cities';

// ─────── Helpers ───────────────────────────────────────────────────────────

const HARI: Record<number, string> = {
    0: 'Ahad',
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: "Jum'at",
    6: 'Sabtu',
};

const BULAN: Record<number, string> = {
    1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
    5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
    9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
};

function formatIndoDateFromDate(d: Date): string {
    const hari = HARI[d.getDay()];
    const tgl = d.getDate();
    const bulan = BULAN[d.getMonth() + 1];
    const tahun = d.getFullYear();
    return `${hari}, ${tgl} ${bulan} ${tahun}`;
}

/** Generate array of KajianEntry for each date in [start, end] inclusive */
function generateEntriesForRange(
    startDate: Date,
    endDate: Date,
    formData: FormFields,
): object[] {
    const entries: object[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
        const dateStr = formatIndoDateFromDate(new Date(current));

        const entry: Record<string, unknown> = {
            region: 'INDONESIA',
            city: formData.city,
            masjid: formData.masjid,
            address: formData.address,
            gmapsUrl: formData.gmapsUrl,
            lat: formData.lat ?? undefined,
            lng: formData.lng ?? undefined,
            pemateri: formData.pemateri,
            pemateri2: formData.pemateri2 || undefined,
            pemateri3: formData.pemateri3 || undefined,
            tema: formData.tema,
            waktu: formData.waktu_mulai
                ? `${formData.waktu_mulai} - ${formData.waktu_selesai || 'Selesai'}`
                : '',
            waktu_mulai: formData.waktu_mulai,
            waktu_selesai: formData.waktu_selesai || 'Selesai',
            cp: formData.cp,
            cp2: formData.cp2 || undefined,
            cp3: formData.cp3 || undefined,
            imageUrl: formData.imageUrl || undefined,
            date: dateStr,
            catatan: formData.catatan || undefined,
            linkInfo: formData.linkInfo || undefined,
            khususAkhwat: formData.khususAkhwat,
            isOnline: formData.isOnline,
            isKidsFriendly: formData.isKidsFriendly,
        };

        entries.push(entry);
        current.setDate(current.getDate() + 1);
    }

    return entries;
}

// ─────── Types ─────────────────────────────────────────────────────────────

interface FormFields {
    masjid: string;
    address: string;
    city: string;
    gmapsUrl: string;
    lat: number | null;
    lng: number | null;
    pemateri: string;
    pemateri2: string;
    pemateri3: string;
    tema: string;
    waktu_mulai: string;
    waktu_selesai: string;
    cp: string;
    cp2: string;
    cp3: string;
    imageUrl: string;
    catatan: string;
    linkInfo: string;
    khususAkhwat: boolean;
    isOnline: boolean;
    isKidsFriendly: boolean;
}

const DEFAULT_FORM: FormFields = {
    masjid: '',
    address: '',
    city: 'Jakarta',
    gmapsUrl: '',
    lat: null,
    lng: null,
    pemateri: '',
    pemateri2: '',
    pemateri3: '',
    tema: '',
    waktu_mulai: '',
    waktu_selesai: 'Selesai',
    cp: '',
    cp2: '',
    cp3: '',
    imageUrl: '',
    catatan: '',
    linkInfo: '',
    khususAkhwat: false,
    isOnline: false,
    isKidsFriendly: false,
};

// ─────── Component ─────────────────────────────────────────────────────────

export default function KajianSeriPage() {
    const router = useRouter();
    const { role, isLoading } = useAdmin();

    const [formData, setFormData] = useState<FormFields>(DEFAULT_FORM);
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isWaktuDropdownOpen, setIsWaktuDropdownOpen] = useState(false);

    // Preview calculated dates
    const previewDates: Date[] = [];
    if (startDateStr && endDateStr) {
        const s = new Date(startDateStr + 'T00:00:00');
        const e = new Date(endDateStr + 'T00:00:00');
        if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
            const cur = new Date(s);
            while (cur <= e && previewDates.length < 60) {
                previewDates.push(new Date(cur));
                cur.setDate(cur.getDate() + 1);
            }
        }
    }

    const set = (key: keyof FormFields, value: unknown) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    useEffect(() => {
        if (!isLoading && !role) router.push('/login');
    }, [role, isLoading, router]);

    const handleExtractCoords = async (url: string) => {
        if (!url) return;
        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    lat: data.lat,
                    lng: data.lng,
                    gmapsUrl: data.expandedUrl || url,
                }));
                setMessage(`✅ Koordinat: ${data.lat}, ${data.lng}`);
            } else {
                setMessage('❌ Gagal mengekstrak koordinat');
            }
        } catch {
            setMessage('❌ Error saat ekstrak koordinat');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!startDateStr || !endDateStr) {
            setMessage('❌ Pilih tanggal mulai dan selesai terlebih dahulu.');
            return;
        }
        if (previewDates.length === 0) {
            setMessage('❌ Rentang tanggal tidak valid.');
            return;
        }
        if (!formData.masjid || !formData.pemateri || !formData.waktu_mulai) {
            setMessage('❌ Masjid, Pemateri, dan Waktu Mulai wajib diisi.');
            return;
        }

        setIsSaving(true);
        setMessage('');
        setIsSuccess(false);

        const startDate = new Date(startDateStr + 'T00:00:00');
        const endDate = new Date(endDateStr + 'T00:00:00');
        const entries = generateEntriesForRange(startDate, endDate, formData);

        try {
            const res = await fetch('/api/kajian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entries),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(`❌ Gagal menyimpan: ${data.error || 'Server Error'}`);
            } else {
                setIsSuccess(true);
                setMessage(`✅ Alhamdulillah! ${entries.length} kajian berhasil disimpan.`);

                // Reset form completely for new input
                setFormData(DEFAULT_FORM);
                setStartDateStr('');
                setEndDateStr('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            setMessage('❌ Kesalahan koneksi atau sistem.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const waktuOptions = [
        "Ba'da Shubuh", "Ba'da Dhuhur", "Ba'da Ashar", "Ba'da Maghrib", "Ba'da Isya",
        'Shubuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya', 'Sholat Jumat',
    ];

    if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/30 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm border border-slate-200">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Layers className="w-4 h-4 text-teal-600" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900">Kajian Seri</h1>
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">Input kajian yang berlangsung beberapa hari sekaligus</p>
                    </div>
                </div>

                {/* Message Banner */}
                {message && (
                    <div className={`rounded-2xl p-4 text-sm font-bold border flex items-center gap-3 ${isSuccess
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : message.startsWith('✅')
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {isSuccess ? <CheckCircle className="w-5 h-5 shrink-0" /> : null}
                        <span>{message}</span>
                        <button onClick={() => setMessage('')} className="ml-auto">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* ── Date Range ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Rentang Tanggal</h2>
                        </div>
                        <p className="text-xs text-slate-500">Kajian yang sama akan dibuat untuk setiap hari dalam rentang ini.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Tanggal Mulai *</label>
                                <input
                                    type="date"
                                    required
                                    value={startDateStr}
                                    onChange={e => setStartDateStr(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-bold bg-slate-50"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Tanggal Selesai *</label>
                                <input
                                    type="date"
                                    required
                                    value={endDateStr}
                                    min={startDateStr}
                                    onChange={e => setEndDateStr(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm font-bold bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* Preview Dates */}
                        {previewDates.length > 0 && (
                            <div className="mt-2 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                                    <span className="text-xs font-black text-teal-700">
                                        Akan dibuat <span className="text-teal-900">{previewDates.length} kajian</span>:
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                    {previewDates.map((d, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-white border border-teal-200 text-teal-700 rounded-lg text-xs font-semibold shadow-sm">
                                            {formatIndoDateFromDate(d)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Location ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Lokasi</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Nama Masjid *</label>
                                <AutosuggestInput
                                    type="masjid"
                                    value={formData.masjid}
                                    onChange={val => set('masjid', val)}
                                    onSelect={item => setFormData(prev => ({
                                        ...prev,
                                        masjid: item.value,
                                        city: item.city || prev.city,
                                        address: item.address || prev.address,
                                        gmapsUrl: item.gmapsUrl || item.gmapsurl || prev.gmapsUrl,
                                        lat: item.lat ?? prev.lat,
                                        lng: item.lng ?? prev.lng,
                                    }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                    placeholder="Masjid..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Kota</label>
                                <AutosuggestInput
                                    type="city"
                                    value={formData.city}
                                    onChange={val => set('city', val)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                    placeholder="Kota..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Alamat</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => set('address', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                placeholder="Alamat lengkap..."
                            />
                        </div>

                        {/* GMaps */}
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Link Google Maps</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.gmapsUrl}
                                    onChange={e => set('gmapsUrl', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 truncate"
                                    placeholder="https://maps.app.goo.gl/..."
                                />
                                <button
                                    type="button"
                                    onClick={() => handleExtractCoords(formData.gmapsUrl)}
                                    disabled={!formData.gmapsUrl}
                                    title="Ekstrak Koordinat"
                                    className="px-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-50"
                                >
                                    <MapPin className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <input
                                    type="number" step="any" placeholder="Latitude"
                                    value={formData.lat ?? ''}
                                    onChange={e => set('lat', e.target.value === '' ? null : parseFloat(e.target.value))}
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                                <input
                                    type="number" step="any" placeholder="Longitude"
                                    value={formData.lng ?? ''}
                                    onChange={e => set('lng', e.target.value === '' ? null : parseFloat(e.target.value))}
                                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Kajian Info ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">Info Kajian</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Pemateri *</label>
                                <AutosuggestInput
                                    type="pemateri"
                                    value={formData.pemateri}
                                    onChange={val => set('pemateri', val)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                    placeholder="Ustadz..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Pemateri 2</label>
                                <AutosuggestInput
                                    type="pemateri"
                                    value={formData.pemateri2}
                                    onChange={val => set('pemateri2', val)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                    placeholder="Opsional..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Tema / Judul Kajian</label>
                            <input
                                type="text"
                                value={formData.tema}
                                onChange={e => set('tema', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                placeholder="mis. Tafsir Ayat-Ayat Shiyam, Kajian Ramadhan..."
                            />
                        </div>

                        {/* Waktu */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Waktu Mulai *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.waktu_mulai}
                                        onChange={e => { set('waktu_mulai', e.target.value); setIsWaktuDropdownOpen(true); }}
                                        onFocus={() => setIsWaktuDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsWaktuDropdownOpen(false), 200)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                        placeholder="Ba'da Ashar"
                                        required
                                    />
                                    {isWaktuDropdownOpen && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                            {waktuOptions
                                                .filter(w => w.toLowerCase().includes((formData.waktu_mulai || '').toLowerCase()))
                                                .map(waktu => (
                                                    <button
                                                        key={waktu}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2.5 hover:bg-teal-50 font-medium text-slate-700 text-sm transition-colors"
                                                        onClick={() => { set('waktu_mulai', waktu); setIsWaktuDropdownOpen(false); }}
                                                    >
                                                        {waktu}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Waktu Selesai</label>
                                <input
                                    type="text"
                                    value={formData.waktu_selesai}
                                    onChange={e => set('waktu_selesai', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                    placeholder="Selesai / 17.00 WIB"
                                />
                            </div>
                        </div>

                        {/* CP */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">CP</label>
                                <input
                                    type="text"
                                    value={formData.cp}
                                    onChange={e => set('cp', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono"
                                    placeholder="08..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 mb-2 block">Link Info</label>
                                <input
                                    type="text"
                                    value={formData.linkInfo}
                                    onChange={e => set('linkInfo', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Catatan */}
                        <div>
                            <label className="text-xs font-bold text-slate-600 mb-2 block">Catatan</label>
                            <textarea
                                value={formData.catatan}
                                onChange={e => set('catatan', e.target.value)}
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none"
                                placeholder="Terbuka untuk umum, gratis, dll..."
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-wrap gap-4 pt-1">
                            {[
                                { key: 'khususAkhwat', label: 'Khusus Akhwat' },
                                { key: 'isOnline', label: 'Online' },
                                { key: 'isKidsFriendly', label: 'Ramah Anak' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer select-none group">
                                    <input
                                        type="checkbox"
                                        checked={!!formData[key as keyof FormFields]}
                                        onChange={e => set(key as keyof FormFields, e.target.checked)}
                                        className="w-4 h-4 rounded accent-teal-600"
                                    />
                                    <span className="text-sm text-slate-700 font-medium group-hover:text-teal-700 transition-colors">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* ── Poster ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">Poster / Flyer</h2>
                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={url => set('imageUrl', url)}
                            label="Upload poster kajian"
                        />
                    </div>

                    {/* ── Submit ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        {previewDates.length === 0 && (
                            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                                Pilih rentang tanggal di atas untuk melihat jumlah kajian yang akan dibuat.
                            </p>
                        )}
                        {previewDates.length > 0 && (
                            <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-100 text-sm font-bold text-teal-700">
                                🗓 Siap membuat <span className="text-teal-900">{previewDates.length} kajian</span> dari{' '}
                                {formatIndoDateFromDate(previewDates[0])} hingga{' '}
                                {formatIndoDateFromDate(previewDates[previewDates.length - 1])}.
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('Reset semua form? Data yang belum disimpan akan hilang.')) {
                                        setFormData(DEFAULT_FORM);
                                        setStartDateStr('');
                                        setEndDateStr('');
                                        setMessage('');
                                    }
                                }}
                                className="px-4 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || previewDates.length === 0}
                                className="flex-1 px-6 py-4 bg-teal-600 text-white rounded-xl font-black hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 hover:-translate-y-0.5"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan {previewDates.length} kajian...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Simpan Semua ({previewDates.length} Kajian)
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
