'use client';
import { useState, useEffect } from 'react';
import { KajianEntry } from '@/lib/parser';
import { parseWithGemini } from '@/lib/ai-parser';
import { Clipboard, Save, Play, CheckCircle, AlertCircle, FileText, Calendar, Clock, MapPin, LogOut, LayoutDashboard, ExternalLink, Database, PlusCircle, History, Info, Trash2, Image as ImageIcon, Loader2, Upload, X, Sparkles } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Tesseract from 'tesseract.js';
import { indonesianCities } from '@/data/cities';
import { parseIndoDate, formatIndoDate, formatYYYYMMDD } from '@/lib/date-utils';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import AIInputSection from '@/components/admin/AIInputSection';

export default function BatchInputPage() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [entries, setEntries] = useState<KajianEntry[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [message, setMessage] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);

    const [isImageUploading, setIsImageUploading] = useState(false);

    // State for managing which row has the city dropdown open
    const [activeCityDropdownIndex, setActiveCityDropdownIndex] = useState<number | null>(null);
    const [cityFilter, setCityFilter] = useState('');

    // Stats and Recent Data
    const [stats, setStats] = useState({ total: 0, today: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const searchParams = useSearchParams();
    const isManualMode = searchParams.get('mode') === 'manual';

    useEffect(() => {
        if (isManualMode && entries.length === 0) {
            handleAddManual();
        }
    }, [isManualMode]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/kajian');
            const data = await res.json();

            if (Array.isArray(data)) {
                setStats({
                    total: data.length,
                    today: data.filter((k: any) => k.date?.toLowerCase().includes('hari ini')).length || 0
                });
            } else {
                console.error('Stats data is not an array:', data);
            }
        } catch (e) {
            console.error('Failed to fetch stats', e);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/login', { method: 'DELETE' });
        router.push('/login');
        router.refresh();
    };

    const handleImageUpload = async (file: File) => {
        setIsOcrLoading(true);
        setIsImageUploading(true);
        setOcrProgress(0);
        try {
            // 1. Upload to Cloudinary (Unsigned Preset)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'jadwal_kajian_preset');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (cloudName) {
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.secure_url) {
                    setLastImageUrl(uploadData.secure_url);
                }
            }
            setIsImageUploading(false);

            // 2. Tesseract OCR
            const result = await Tesseract.recognize(
                file,
                'ind+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );
            setInputText(prev => prev + (prev ? '\n\n' : '') + result.data.text);
            setMessage('Alhamdulillah, gambar berhasil diupload dan teks berhasil dibaca! Sekarang silakan klik "Ekstrak Jadwal".');
        } catch (e) {
            console.error(e);
            setMessage('Gagal memproses gambar. Pastikan format benar dan konfigurasi Cloudinary sesuai.');
        } finally {
            setIsOcrLoading(false);
            setIsImageUploading(false);
        }
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) handleImageUpload(file);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleProcess = async () => {
        try {
            // Updated to use AI Parser as per request (Regex fallback deprecated)
            setIsGeocoding(true);
            setMessage('Sedang mengekstrak data... (Metode Cerdas)');

            const parsed = await parseWithGemini(inputText);
            const enrichedEntries = parsed.map(entry => {
                const isFriday = entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || entry.tema === '';
                const defaultImg = isFriday ? '/images/khutbah-jumat-cover.png' : undefined;
                return { ...entry, imageUrl: lastImageUrl || defaultImg };
            });
            setEntries(enrichedEntries);
            setSelectedIndices(new Set(enrichedEntries.map((_, i) => i)));
            setMessage(`Berhasil mengekstrak ${parsed.length} jadwal. Memulai pencarian koordinat lokasi...`);

            const withCoords = [...enrichedEntries];

            // 1. Geocoding
            for (let i = 0; i < withCoords.length; i++) {
                const entry = withCoords[i];
                const coords = await geocodeAddress(entry.masjid, entry.address, entry.city);
                if (coords) {
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng };
                    setEntries([...withCoords]); // Live update UI
                }
            }

            // 2. Normalization (Matching AI settings)
            setMessage('Menormalisasi nama ustadz dan masjid...');
            const normalized = [...withCoords];

            for (let i = 0; i < normalized.length; i++) {
                const entry = normalized[i];

                // Normalize ustadz name
                try {
                    const ustadzResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.pemateri, type: 'ustadz', threshold: 0.8 }),
                    });
                    const ustadzData = await ustadzResponse.json();

                    if (ustadzData.hasExactMatch || (ustadzData.suggestions && ustadzData.suggestions.length > 0)) {
                        const bestMatch = ustadzData.hasExactMatch
                            ? ustadzData.canonicalName
                            : ustadzData.suggestions[0].name;
                        normalized[i] = { ...entry, pemateri: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing ustadz:', e);
                }

                // Normalize masjid name
                try {
                    const masjidResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.masjid, type: 'masjid', threshold: 0.8 }),
                    });
                    const masjidData = await masjidResponse.json();

                    if (masjidData.hasExactMatch || (masjidData.suggestions && masjidData.suggestions.length > 0)) {
                        const bestMatch = masjidData.hasExactMatch
                            ? masjidData.canonicalName
                            : masjidData.suggestions[0].name;
                        normalized[i] = { ...normalized[i], masjid: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing masjid:', e);
                }

                setEntries([...normalized]); // Live update UI
            }

            setLastImageUrl(null); // Reset after processing
            setMessage(`Ekstraksi selesai. Data telah diproses dan dinormalisasi.`);
        } catch (e: any) {
            setMessage(`Gagal memproses: ${e.message || 'Kesalahan'}. Pastikan format sesuai.`);
            console.error(e);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleAiProcess = async () => {
        try {
            setIsAiLoading(true);
            setMessage('Sedang meminta bantuan AI Gemini untuk mengekstrak data... (Mohon tunggu sebentar)');

            const parsed = await parseWithGemini(inputText);
            const enrichedEntries = parsed.map(entry => {
                const isFriday = entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || entry.tema === '';
                const defaultImg = isFriday ? '/images/khutbah-jumat-cover.png' : undefined;
                return { ...entry, imageUrl: lastImageUrl || defaultImg };
            });
            setEntries(enrichedEntries);
            setSelectedIndices(new Set(enrichedEntries.map((_, i) => i)));
            setMessage(`Alhamdulillah! AI berhasil mengekstrak ${parsed.length} jadwal. Memulai pencarian koordinat lokasi...`);

            setIsGeocoding(true);
            const withCoords = [...enrichedEntries];

            for (let i = 0; i < withCoords.length; i++) {
                const entry = withCoords[i];
                const coords = await geocodeAddress(entry.masjid, entry.address, entry.city);
                if (coords) {
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng };
                    setEntries([...withCoords]); // Live update UI
                }
            }

            // Auto-normalize names
            setMessage('Menormalisasi nama ustadz dan masjid...');
            const normalized = [...withCoords];

            for (let i = 0; i < normalized.length; i++) {
                const entry = normalized[i];

                // Normalize ustadz name
                try {
                    const ustadzResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.pemateri, type: 'ustadz', threshold: 0.8 }),
                    });
                    const ustadzData = await ustadzResponse.json();

                    if (ustadzData.hasExactMatch || (ustadzData.suggestions && ustadzData.suggestions.length > 0)) {
                        const bestMatch = ustadzData.hasExactMatch
                            ? ustadzData.canonicalName
                            : ustadzData.suggestions[0].name;
                        normalized[i] = { ...entry, pemateri: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing ustadz:', e);
                }

                // Normalize masjid name
                try {
                    const masjidResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.masjid, type: 'masjid', threshold: 0.8 }),
                    });
                    const masjidData = await masjidResponse.json();

                    if (masjidData.hasExactMatch || (masjidData.suggestions && masjidData.suggestions.length > 0)) {
                        const bestMatch = masjidData.hasExactMatch
                            ? masjidData.canonicalName
                            : masjidData.suggestions[0].name;
                        normalized[i] = { ...normalized[i], masjid: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing masjid:', e);
                }

                setEntries([...normalized]); // Live update UI
            }

            setLastImageUrl(null); // Reset after processing
            setIsGeocoding(false);
            setMessage(`Ekstraksi AI selesai. Nama ustadz dan masjid telah dinormalisasi.`);
        } catch (e: any) {
            setMessage(`Gagal memproses dengan AI: ${e.message || 'Kesalahan tidak diketahui'}`);
            setIsGeocoding(false);
            console.error(e);
        } finally {
            setIsAiLoading(false);
        }
    };

    const toggleSelection = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
    };

    const toggleAll = () => {
        if (selectedIndices.size === entries.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(entries.map((_, i) => i)));
        }
    };

    const handleSave = async () => {
        const entriesToSave = entries.filter((_, i) => selectedIndices.has(i));

        if (entriesToSave.length === 0) {
            setMessage('Pilih setidaknya satu jadwal untuk disimpan.');
            return;
        }

        try {
            // Check for duplicates
            const duplicateChecks = await Promise.all(
                entriesToSave.map(async (entry) => {
                    const response = await fetch('/api/admin/check-duplicate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            masjid: entry.masjid,
                            pemateri: entry.pemateri,
                            date: entry.date,
                            waktu: entry.waktu,
                        }),
                    });
                    const data = await response.json();
                    return { entry, ...data };
                })
            );

            const duplicates = duplicateChecks.filter(check => check.isDuplicate);

            if (duplicates.length > 0) {
                const duplicateInfo = duplicates.map(d =>
                    `- ${d.entry.masjid} | ${d.entry.pemateri} | ${d.entry.date}`
                ).join('\n');

                const confirmSave = confirm(
                    `⚠️ PERINGATAN DUPLIKAT!\n\n` +
                    `Ditemukan ${duplicates.length} jadwal yang mungkin sudah ada:\n\n` +
                    `${duplicateInfo}\n\n` +
                    `Apakah Anda yakin ingin tetap menyimpan semua data?`
                );

                if (!confirmSave) {
                    setMessage('Penyimpanan dibatalkan karena ada duplikat.');
                    return;
                }
            }

            // Proceed with saving
            const response = await fetch('/api/kajian', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entriesToSave),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(`Gagal menyimpan: ${errorData.error || 'Server error'}`);
                return;
            }

            setMessage(`Alhamdulillah, ${entriesToSave.length} jadwal berhasil disimpan!`);
            fetchStats();
            setEntries([]);
            setInputText('');
        } catch (e) {
            setMessage('Kesalahan koneksi atau sistem saat menyimpan.');
            console.error(e);
        }
    };

    const updateEntry = (index: number, field: keyof KajianEntry, value: string | number) => {
        setEntries(prev => {
            const newEntries = [...prev];
            newEntries[index] = { ...newEntries[index], [field]: value };
            return newEntries;
        });
    };

    const handleAddManual = () => {
        const newEntry: KajianEntry = {
            region: 'INDONESIA',
            city: 'Jakarta',
            masjid: '',
            address: '',
            pemateri: '',
            tema: '',
            waktu: '',
            date: '',
            cp: '',
            gmapsUrl: ''
        };
        setEntries([newEntry, ...entries]);
        setSelectedIndices(new Set([0, ...Array.from(selectedIndices).map(i => i + 1)]));
        setMessage('Baru: Baris kosong ditambahkan. Silakan isi detailnya.');
    };

    const handleDiscard = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
        const newSelected = new Set<number>();
        selectedIndices.forEach(i => {
            if (i < index) newSelected.add(i);
            else if (i > index) newSelected.add(i - 1);
        });
        setSelectedIndices(newSelected);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Input Massal Jadwal Kajian</h1>
                    <p className="text-sm text-slate-500 mt-1">Ekstrak jadwal dari poster atau broadcast message</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/kajian" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Lihat Publik
                    </Link>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-600 font-medium">{stats.total} Jadwal</p>
                    </div>
                    <button
                        onClick={async () => {
                            if (!confirm('Perbaiki data lama: Pasang gambar default untuk semua Sholat Jumat yg tidak ada gambarnya?')) return;
                            try {
                                const res = await fetch('/api/admin/tools/fix-friday-images', { method: 'POST' });
                                const data = await res.json();
                                alert(data.message || 'Selesai');
                                fetchStats();
                            } catch (e) { alert('Gagal memproses'); }
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Fix Gambar Sholat Jumat Lama"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {!isManualMode && (
                <AIInputSection
                    onProcess={handleProcess}
                    onAiProcess={handleAiProcess}
                    onImageUpload={handleImageUpload}
                    inputText={inputText}
                    setInputText={setInputText}
                    lastImageUrl={lastImageUrl}
                    setLastImageUrl={setLastImageUrl}
                    isOcrLoading={isOcrLoading}
                    ocrProgress={ocrProgress}
                    isGeocoding={isGeocoding}
                    isAiLoading={isAiLoading}
                />
            )}

            <div className="w-full">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-2xl tracking-tighter text-slate-900">List Input Jadwal</h3>
                                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{entries.length} entri ditemukan</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddManual}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all flex items-center gap-2"
                            >
                                <PlusCircle className="w-5 h-5" /> Tambah Manual
                            </button>
                            {entries.length > 0 && (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 text-sm"
                                >
                                    <Save className="w-6 h-6" /> Simpan {selectedIndices.size} Jadwal Baru
                                </button>
                            )}
                        </div>
                    </div>

                    {entries.length > 0 ? (
                        <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-5 w-16">
                                            <input
                                                type="checkbox"
                                                checked={selectedIndices.size === entries.length && entries.length > 0}
                                                onChange={toggleAll}
                                                className="w-6 h-6 rounded-xl border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[11px]">Rincian Jadwal</th>
                                        <th className="p-5 w-16 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {entries.map((entry, idx) => (
                                        <tr key={idx} className={`transition-all group/row ${selectedIndices.has(idx) ? 'bg-white' : 'opacity-40 hover:opacity-100'}`}>
                                            <td className="p-5 align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.has(idx)}
                                                    onChange={() => toggleSelection(idx)}
                                                    className="w-6 h-6 rounded-xl border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="p-3 space-y-6 flex gap-6">
                                                {entry.imageUrl && (
                                                    <div className="shrink-0 group/img relative">
                                                        <img src={entry.imageUrl} className="w-24 h-32 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                                            <button onClick={() => updateEntry(idx, 'imageUrl', '')} className="text-white hover:text-red-400 transition-colors">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                                Masjid / Lokasi
                                                                {entry.lat && <span className="flex items-center gap-1 ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-200"><MapPin className="w-3 h-3" /> {entry.lat.toFixed(4)}, {entry.lng?.toFixed(4)}</span>}
                                                                {entry.khususAkhwat && <span className="ml-2 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[9px] font-black border border-pink-200">🌸 KHUSUS AKHWAT</span>}
                                                            </label>
                                                            <AutosuggestInput
                                                                type="masjid"
                                                                value={entry.masjid}
                                                                onChange={(val) => updateEntry(idx, 'masjid', val)}
                                                                className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all text-base"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Pemateri</label>
                                                            <AutosuggestInput
                                                                type="pemateri"
                                                                value={entry.pemateri}
                                                                onChange={(val) => updateEntry(idx, 'pemateri', val)}
                                                                className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-700 transition-all"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 relative">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Kota</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={entry.city}
                                                                    onChange={(e) => {
                                                                        updateEntry(idx, 'city', e.target.value);
                                                                        setCityFilter(e.target.value);
                                                                        setActiveCityDropdownIndex(idx);
                                                                    }}
                                                                    onFocus={() => {
                                                                        setCityFilter(entry.city);
                                                                        setActiveCityDropdownIndex(idx);
                                                                    }}
                                                                    onBlur={() => setTimeout(() => setActiveCityDropdownIndex(null), 200)}
                                                                    className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-blue-600 transition-all"
                                                                />
                                                                {activeCityDropdownIndex === idx && (
                                                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                                        {indonesianCities
                                                                            .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                                                                            .map(city => (
                                                                                <button
                                                                                    key={city}
                                                                                    type="button"
                                                                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm"
                                                                                    onClick={() => {
                                                                                        updateEntry(idx, 'city', city);
                                                                                        setActiveCityDropdownIndex(null);
                                                                                    }}
                                                                                >
                                                                                    {city}
                                                                                </button>
                                                                            ))
                                                                        }
                                                                        {indonesianCities.filter(c => c.toLowerCase().includes(cityFilter.toLowerCase())).length === 0 && (
                                                                            <div className="px-4 py-3 text-slate-400 text-xs text-center italic">Kota tidak ditemukan</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tema</label>
                                                            <input type="text" value={entry.tema} onChange={(e) => updateEntry(idx, 'tema', e.target.value)} className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-medium italic text-slate-600 transition-all" />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                                                            <input
                                                                type="date"
                                                                value={(() => {
                                                                    const d = parseIndoDate(entry.date);
                                                                    return d ? formatYYYYMMDD(d) : '';
                                                                })()}
                                                                onChange={(e) => {
                                                                    const val = e.target.valueAsDate;
                                                                    if (val) {
                                                                        updateEntry(idx, 'date', formatIndoDate(val));
                                                                    }
                                                                }}
                                                                className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-700 transition-all"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Waktu</label>
                                                            <input type="text" value={entry.waktu} onChange={(e) => updateEntry(idx, 'waktu', e.target.value)} className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-700 transition-all" />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Alamat</label>
                                                            <input type="text" value={entry.address} onChange={(e) => updateEntry(idx, 'address', e.target.value)} className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-medium text-slate-600 transition-all" />
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">CP / Maps / Koordinat</label>
                                                            <div className="flex flex-col md:flex-row gap-4">
                                                                <input type="text" placeholder="CP (Contact Person)" value={entry.cp} onChange={(e) => updateEntry(idx, 'cp', e.target.value)} className="w-full md:w-1/3 bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-emerald-600" />
                                                                <div className="flex-1 flex gap-2">
                                                                    <input type="text" placeholder="Google Maps URL" value={entry.gmapsUrl} onChange={(e) => updateEntry(idx, 'gmapsUrl', e.target.value)} className="flex-[2] bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-medium text-blue-500 text-sm" />
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!entry.gmapsUrl) return alert('Masukkan URL Maps terlebih dahulu');
                                                                            setIsGeocoding(true);
                                                                            try {
                                                                                const res = await fetch('/api/tools/extract-gmaps', {
                                                                                    method: 'POST',
                                                                                    body: JSON.stringify({ url: entry.gmapsUrl }),
                                                                                    headers: { 'Content-Type': 'application/json' }
                                                                                });
                                                                                const data = await res.json();
                                                                                if (data.success) {
                                                                                    updateEntry(idx, 'lat', data.lat);
                                                                                    updateEntry(idx, 'lng', data.lng);
                                                                                    updateEntry(idx, 'gmapsUrl', data.expandedUrl);
                                                                                    alert(`Koordinat berhasil diekstrak!\nLat: ${data.lat}\nLng: ${data.lng}`);
                                                                                } else {
                                                                                    alert('Gagal mengekstrak: ' + data.error);
                                                                                }
                                                                            } catch (e) {
                                                                                alert('Terjadi kesalahan sistem');
                                                                            } finally {
                                                                                setIsGeocoding(false);
                                                                            }
                                                                        }}
                                                                        className="px-3 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1 font-bold text-xs"
                                                                        title="Ekstrak Koordinat dari Link"
                                                                    >
                                                                        <MapPin className="w-4 h-4" />
                                                                        <span className="hidden md:inline">Ekstrak</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-1 md:col-span-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Link Pendaftaran & Info Lokasi (Lat/Lng)</label>
                                                            <div className="flex gap-4">
                                                                <input type="text" placeholder="Link info (https://...)" value={entry.linkInfo || ''} onChange={(e) => updateEntry(idx, 'linkInfo', e.target.value)} className="flex-1 bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-purple-500 rounded-xl px-4 py-2 outline-none font-medium text-purple-600 text-sm" />

                                                                <div className="flex gap-2 w-40 shrink-0">
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={entry.lat || ''}
                                                                        onChange={(e) => updateEntry(idx, 'lat', e.target.value)}
                                                                        placeholder="Lat"
                                                                        className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-2 py-2 outline-none font-mono text-xs font-bold text-slate-600 text-center"
                                                                        title="Latitude"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        step="any"
                                                                        value={entry.lng || ''}
                                                                        onChange={(e) => updateEntry(idx, 'lng', e.target.value)}
                                                                        placeholder="Lng"
                                                                        className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-2 py-2 outline-none font-mono text-xs font-bold text-slate-600 text-center"
                                                                        title="Longitude"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 align-top text-right">
                                                <button onClick={() => handleDiscard(idx)} className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-200 border-4 border-dashed border-slate-50 rounded-[3.5rem] bg-slate-50/20 py-20">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm mb-6">
                                <Database className="w-16 h-16 opacity-10" />
                            </div>
                            <p className="text-2xl font-black tracking-tighter text-slate-400">Siap Menunggu Data</p>
                            <p className="text-slate-400 font-bold max-w-xs text-center mt-2 leading-relaxed">Belum ada jadwal yang diekstrak. Silakan tempel teks atau scan poster.</p>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-10 p-6 rounded-[2rem] text-sm font-black flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500 ${message.includes('Gagal') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100 shadow-lg shadow-blue-50'}`}>
                            <div className={`p-2 rounded-xl ${message.includes('Gagal') ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
