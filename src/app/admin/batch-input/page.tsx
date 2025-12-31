'use client';
import { useState, useEffect } from 'react';
import { KajianEntry, parseKajianBroadcast, splitPemateri, splitWaktu } from '@/lib/parser';
import { parseWithGemini } from '@/lib/ai-parser';
import { Clipboard, Save, Play, CheckCircle, AlertCircle, FileText, Calendar, Clock, MapPin, LogOut, LayoutDashboard, ExternalLink, Database, PlusCircle, History, Info, Trash2, Image as ImageIcon, Loader2, Upload, X, Sparkles, Eye } from 'lucide-react';
import { geocodeAddress } from '@/lib/geocoding';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Tesseract from 'tesseract.js';
import { indonesianCities } from '@/data/cities';
import { parseIndoDate, formatIndoDate, formatYYYYMMDD } from '@/lib/date-utils';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import AIInputSection from '@/components/admin/AIInputSection';
import KajianCard from '@/components/KajianCard';
import './batch-input.css';
import ImageUpload from '@/components/ImageUpload';

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

    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    // State for managing which row has the city dropdown open
    const [activeCityDropdownIndex, setActiveCityDropdownIndex] = useState<number | null>(null);
    const [cityFilter, setCityFilter] = useState('');

    // State for managing which row has the waktu dropdown open
    const [activeWaktuDropdownIndex, setActiveWaktuDropdownIndex] = useState<number | null>(null);

    // Duplicate Check State
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateEntries, setDuplicateEntries] = useState<any[]>([]);
    const [pendingSaveEntries, setPendingSaveEntries] = useState<KajianEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Common waktu suggestions for kajian
    const waktuSuggestions = [
        "Ba'da Shubuh - Selesai",
        "Ba'da Dhuhur - Selesai",
        "Ba'da Ashar - Selesai",
        "Ba'da Maghrib - Selesai",
        "Ba'da Isya - Selesai",
        "Shubuh - Selesai",
        "Dhuhur - Selesai",
        "Ashar - Selesai",
        "Maghrib - Selesai",
        "Isya - Selesai",
        "Sholat Jumat",
    ];

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
            // Use Regex pattern matching for extraction
            setIsGeocoding(true);
            setMessage('Sedang mengekstrak data dengan Regex...');

            const parsed = parseKajianBroadcast(inputText);
            const enrichedEntries = parsed.map(entry => {
                const isFriday = entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || entry.tema === '';
                const defaultImg = isFriday ? '/images/khutbah-jumat-cover.png' : undefined;

                // Auto-split waktu and pemateri
                const waktuSplit = splitWaktu(entry.waktu);
                const pemateriSplit = splitPemateri(entry.pemateri);

                return {
                    ...entry,
                    ...waktuSplit,
                    ...pemateriSplit,
                    imageUrl: lastImageUrl || defaultImg
                };
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
                    // Generate Google Maps URL from coordinates
                    const gmapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng, gmapsUrl };
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

                // Auto-split waktu and pemateri if AI didn't do it
                const waktuSplit = entry.waktu_mulai ? {} : splitWaktu(entry.waktu);
                const pemateriSplit = entry.pemateri2 ? {} : splitPemateri(entry.pemateri);

                return {
                    ...entry,
                    ...waktuSplit,
                    ...pemateriSplit,
                    imageUrl: lastImageUrl || defaultImg
                };
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
                    // Generate Google Maps URL from coordinates
                    const gmapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng, gmapsUrl };
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
            setIsSaving(true);

            // Try to save directly
            const response = await fetch('/api/kajian', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entriesToSave),
            });

            const data = await response.json();

            // Handle duplicate detection (409 status)
            if (response.status === 409 && data.duplicates) {
                setDuplicateEntries(data.duplicates);
                setPendingSaveEntries(entriesToSave);
                setShowDuplicateModal(true);
                setIsSaving(false);
                return;
            }

            if (!response.ok) {
                setMessage(`Gagal menyimpan: ${data.error || 'Server error'}`);
                setIsSaving(false);
                return;
            }

            setMessage(`Alhamdulillah, ${entriesToSave.length} jadwal berhasil disimpan!`);
            fetchStats();

            // Remove saved entries from list
            const savedIndices = new Set(entriesToSave.map(e => entries.indexOf(e)));
            const remainingEntries = entries.filter((_, i) => !savedIndices.has(i));
            setEntries(remainingEntries);
            setSelectedIndices(new Set(remainingEntries.map((_, i) => i)));

            if (remainingEntries.length === 0) {
                setInputText('');
            }
        } catch (e) {
            setMessage('Kesalahan koneksi atau sistem saat menyimpan.');
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmSave = async (action: 'all' | 'skip') => {
        setIsSaving(true);
        setShowDuplicateModal(false);

        let finalEntries = [...pendingSaveEntries];

        if (action === 'skip') {
            // Filter out duplicates using new format
            const duplicateSignatures = new Set(duplicateEntries.map(d =>
                `${d.new.masjid}|${d.new.date}|${d.new.waktu}`
            ));

            finalEntries = pendingSaveEntries.filter(e =>
                !duplicateSignatures.has(`${e.masjid}|${e.date}|${e.waktu}`)
            );
        }

        if (finalEntries.length === 0) {
            setMessage('Tidak ada data baru untuk disimpan (semua dilewati).');
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch('/api/kajian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalEntries),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(`Gagal menyimpan: ${data.error || 'Server error'}`);
                setIsSaving(false);
                return;
            }

            setMessage(`Alhamdulillah, ${finalEntries.length} jadwal berhasil disimpan!`);
            fetchStats();

            // Remove saved entries from list but handle indices carefully
            // It's safer to just remove the saved objects from the entries array
            const savedObjects = new Set(finalEntries);
            const remainingEntries = entries.filter(e => !savedObjects.has(e));

            setEntries(remainingEntries);
            setSelectedIndices(new Set(remainingEntries.map((_, i) => i)));

            if (remainingEntries.length === 0) {
                setInputText('');
            }

        } catch (e) {
            setMessage('Gagal menyimpan data.');
            console.error(e);
        } finally {
            setIsSaving(false);
            setDuplicateEntries([]);
            setPendingSaveEntries([]);
        }
    };

    const updateEntry = (index: number, field: keyof KajianEntry, value: string | number | boolean | undefined) => {
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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="batch-header flex-col md:flex-row items-start md:items-center gap-4">
                <div>
                    <h1 className="batch-title">Input Massal Jadwal Kajian</h1>
                    <p className="batch-subtitle">Ekstrak jadwal dari poster atau broadcast message</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/kajian" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Lihat Publik
                    </Link>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 flex-1 md:flex-none text-center">
                        <p className="text-xs text-blue-600 font-medium">{stats.total} Jadwal</p>
                    </div>
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
                <div className="batch-card min-h-[600px]">
                    <div className="batch-card-header batch-card-header-green flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Hasil Ekstraksi</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{entries.length} entri ditemukan</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handleAddManual}
                                className="batch-btn batch-btn-secondary flex-1 md:flex-none"
                            >
                                <PlusCircle className="w-4 h-4" /> Manual
                            </button>
                            {entries.length > 0 && (
                                <button
                                    onClick={handleSave}
                                    className="batch-btn batch-btn-success flex-1 md:flex-none"
                                >
                                    <Save className="w-4 h-4" /> Simpan {selectedIndices.size}
                                </button>
                            )}
                        </div>
                    </div>

                    {entries.length > 0 ? (
                        <div className="overflow-hidden">
                            <div className="hidden md:block">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-5 w-16">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.size === entries.length && entries.length > 0}
                                                    onChange={toggleAll}
                                                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1 mb-2">
                                                                    Masjid / Lokasi
                                                                    {entry.lat && entry.lng && <span className="flex items-center gap-1 ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-200"><MapPin className="w-3 h-3" /> {(typeof entry.lat === 'number' ? entry.lat : parseFloat(entry.lat)).toFixed(4)}, {(typeof entry.lng === 'number' ? entry.lng : parseFloat(entry.lng)).toFixed(4)}</span>}
                                                                    {entry.khususAkhwat && <span className="ml-2 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[9px] font-black border border-pink-200">🌸 KHUSUS AKHWAT</span>}
                                                                </label>
                                                                <AutosuggestInput
                                                                    type="masjid"
                                                                    value={entry.masjid}
                                                                    onChange={(val) => updateEntry(idx, 'masjid', val)}
                                                                    className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all text-base placeholder:text-slate-400"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2">
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-1">Pemateri / Ustadz</label>
                                                                        {!entry.pemateri2 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateEntry(idx, 'pemateri2', '')}
                                                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                                            >
                                                                                <PlusCircle className="w-3 h-3" /> Tambah
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <AutosuggestInput
                                                                        type="pemateri"
                                                                        value={entry.pemateri}
                                                                        onChange={(val) => updateEntry(idx, 'pemateri', val)}
                                                                        className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                                                        placeholder="Pemateri utama..."
                                                                    />

                                                                    {entry.pemateri2 !== undefined && (
                                                                        <div className="relative">
                                                                            <AutosuggestInput
                                                                                type="pemateri"
                                                                                value={entry.pemateri2 || ''}
                                                                                onChange={(val) => updateEntry(idx, 'pemateri2', val)}
                                                                                className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                                                                placeholder="Pemateri kedua..."
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newEntries = [...entries];
                                                                                    const { pemateri2, ...rest } = newEntries[idx];
                                                                                    newEntries[idx] = rest as any;
                                                                                    setEntries(newEntries);
                                                                                }}
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {entry.pemateri2 && !entry.pemateri3 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => updateEntry(idx, 'pemateri3', '')}
                                                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                                        >
                                                                            <PlusCircle className="w-3 h-3" /> Tambah Ketiga
                                                                        </button>
                                                                    )}

                                                                    {entry.pemateri3 !== undefined && (
                                                                        <div className="relative">
                                                                            <AutosuggestInput
                                                                                type="pemateri"
                                                                                value={entry.pemateri3 || ''}
                                                                                onChange={(val) => updateEntry(idx, 'pemateri3', val)}
                                                                                className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                                                                placeholder="Pemateri ketiga..."
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newEntries = [...entries];
                                                                                    const { pemateri3, ...rest } = newEntries[idx];
                                                                                    newEntries[idx] = rest as any;
                                                                                    setEntries(newEntries);
                                                                                }}
                                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-1 relative">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Kota</label>
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
                                                                        className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-blue-700 transition-all placeholder:text-slate-400"
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
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Tema</label>
                                                                <input type="text" value={entry.tema} onChange={(e) => updateEntry(idx, 'tema', e.target.value)} className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400" />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2">
                                                                <div className="flex gap-4 items-end">
                                                                    <div className="flex-1">
                                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Catatan dari Panitia</label>
                                                                        <input
                                                                            type="text"
                                                                            value={entry.catatan || ''}
                                                                            onChange={(e) => updateEntry(idx, 'catatan', e.target.value)}
                                                                            className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none text-slate-900 transition-all placeholder:text-slate-400"
                                                                            placeholder="Misal: Membawa makanan untuk berbuka, Khusus ikhwan, dll"
                                                                        />
                                                                    </div>
                                                                    <label className={`flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-all h-[42px] mb-[1px] ${entry.isKidsFriendly ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={entry.isKidsFriendly || false}
                                                                            onChange={(e) => updateEntry(idx, 'isKidsFriendly', e.target.checked)}
                                                                            className="hidden"
                                                                        />
                                                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${entry.isKidsFriendly ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                                            {entry.isKidsFriendly && <CheckCircle className="w-3 h-3" />}
                                                                        </div>
                                                                        <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">🎈 Kajian Anak</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-1">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Tanggal</label>
                                                                <div className="relative group">
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
                                                                        className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all"
                                                                    />
                                                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-500" />
                                                                </div>
                                                            </div>
                                                            <div className="col-span-1 relative">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Waktu Mulai</label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="text"
                                                                        value={entry.waktu_mulai || ''}
                                                                        onChange={(e) => {
                                                                            updateEntry(idx, 'waktu_mulai', e.target.value);
                                                                            setActiveWaktuDropdownIndex(idx);
                                                                        }}
                                                                        onFocus={() => setActiveWaktuDropdownIndex(idx)}
                                                                        onBlur={() => setTimeout(() => setActiveWaktuDropdownIndex(null), 200)}
                                                                        className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                                                        placeholder="Ba'da Maghrib / 19.00"
                                                                    />
                                                                    {activeWaktuDropdownIndex === idx && (
                                                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                                            {['Ba\'da Shubuh', 'Ba\'da Dhuhur', 'Ba\'da Ashar', 'Ba\'da Maghrib', 'Ba\'da Isya', 'Shubuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya', 'Sholat Jumat']
                                                                                .filter(w => w.toLowerCase().includes((entry.waktu_mulai || '').toLowerCase()))
                                                                                .map(waktu => (
                                                                                    <button
                                                                                        key={waktu}
                                                                                        type="button"
                                                                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm"
                                                                                        onClick={() => {
                                                                                            updateEntry(idx, 'waktu_mulai', waktu);
                                                                                            setActiveWaktuDropdownIndex(null);
                                                                                        }}
                                                                                    >
                                                                                        {waktu}
                                                                                    </button>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-1">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Waktu Selesai</label>
                                                                <input
                                                                    type="text"
                                                                    value={entry.waktu_selesai || 'Selesai'}
                                                                    onChange={(e) => updateEntry(idx, 'waktu_selesai', e.target.value)}
                                                                    className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                                                    placeholder="Selesai / 20.00"
                                                                />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Alamat</label>
                                                                <input type="text" value={entry.address} onChange={(e) => updateEntry(idx, 'address', e.target.value)} className="w-full bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400" />
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2">
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">CP / Maps / Koordinat</label>
                                                                <div className="flex flex-col md:flex-row gap-4">
                                                                    <input type="text" placeholder="CP (Contact Person)" value={entry.cp || ''} onChange={(e) => updateEntry(idx, 'cp', e.target.value)} className="w-full md:w-1/3 bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-emerald-700 placeholder:text-slate-400" />
                                                                    <div className="flex-1 flex flex-col md:flex-row gap-2">
                                                                        <input type="text" placeholder="Google Maps URL" value={entry.gmapsUrl || ''} onChange={(e) => updateEntry(idx, 'gmapsUrl', e.target.value)} className="flex-[2] bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-4 py-2 outline-none font-bold text-blue-700 text-sm placeholder:text-slate-400" />

                                                                        {/* New Checkboxes */}
                                                                        <div className="flex items-center gap-4 px-2">
                                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={entry.khususAkhwat}
                                                                                    onChange={(e) => updateEntry(idx, 'khususAkhwat', e.target.checked)}
                                                                                    className="w-4 h-4 rounded text-pink-500 border-slate-300 focus:ring-pink-500"
                                                                                />
                                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-pink-600 transition-colors">Akhwat</span>
                                                                            </label>
                                                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={entry.isOnline}
                                                                                    onChange={(e) => updateEntry(idx, 'isOnline', e.target.checked)}
                                                                                    className="w-4 h-4 rounded text-blue-500 border-slate-300 focus:ring-blue-500"
                                                                                />
                                                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-blue-600 transition-colors">Online</span>
                                                                            </label>
                                                                        </div>

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
                                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block px-1">Link Pendaftaran & Info Lokasi (Lat/Lng)</label>
                                                                <div className="flex gap-4">
                                                                    <input type="text" placeholder="Link info (https://...)" value={entry.linkInfo || ''} onChange={(e) => updateEntry(idx, 'linkInfo', e.target.value)} className="flex-1 bg-slate-100/50 border border-slate-100 focus:bg-white focus:border-purple-500 rounded-xl px-4 py-2 outline-none font-bold text-purple-700 text-sm placeholder:text-slate-400" />

                                                                    <div className="flex gap-2 w-40 shrink-0">
                                                                        <input
                                                                            type="number"
                                                                            step="any"
                                                                            value={entry.lat || ''}
                                                                            onChange={(e) => updateEntry(idx, 'lat', e.target.value)}
                                                                            placeholder="Lat"
                                                                            className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-2 py-2 outline-none font-mono text-xs font-bold text-slate-900 text-center placeholder:text-slate-400"
                                                                            title="Latitude"
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            step="any"
                                                                            value={entry.lng || ''}
                                                                            onChange={(e) => updateEntry(idx, 'lng', e.target.value)}
                                                                            placeholder="Lng"
                                                                            className="w-1/2 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-500 rounded-xl px-2 py-2 outline-none font-mono text-xs font-bold text-slate-900 text-center placeholder:text-slate-400"
                                                                            title="Longitude"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-1 md:col-span-2">
                                                                <ImageUpload
                                                                    label="Gambar Kajian"
                                                                    value={entry.imageUrl || ''}
                                                                    onChange={(url) => updateEntry(idx, 'imageUrl', url)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 align-top text-right">
                                                    <div className="flex flex-col gap-2">
                                                        <button onClick={() => setPreviewIndex(idx)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100" title="Preview Tampilan">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleDiscard(idx)} className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100" title="Hapus">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View: Stacked Cards */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {entries.map((entry, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group transition-all hover:shadow-md mb-4 last:mb-0">
                                        {/* Header Bar */}
                                        <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex items-start justify-between gap-3">
                                            <div className="flex gap-3 items-center flex-1">
                                                <button
                                                    onClick={() => toggleSelection(idx)}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIndices.has(idx) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'}`}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Jadwal Kajian</span>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <span>{entry.date && parseIndoDate(entry.date) ? formatIndoDate(parseIndoDate(entry.date)!) : '-'}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span>{entry.waktu}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-1">
                                                <button onClick={() => setPreviewIndex(idx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDiscard(idx)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-6">
                                            {/* Main Info */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Tema Kajian</label>
                                                    <textarea
                                                        rows={2}
                                                        value={entry.tema}
                                                        onChange={(e) => updateEntry(idx, 'tema', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
                                                        placeholder="Judul atau Tema Kajian..."
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <label className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-all ${entry.isKidsFriendly ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={entry.isKidsFriendly || false}
                                                                onChange={(e) => updateEntry(idx, 'isKidsFriendly', e.target.checked)}
                                                                className="hidden"
                                                            />
                                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${entry.isKidsFriendly ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                                {entry.isKidsFriendly && <CheckCircle className="w-3 h-3" />}
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider">🎈 Kajian Anak</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Pemateri</label>
                                                    <AutosuggestInput
                                                        type="pemateri"
                                                        value={entry.pemateri}
                                                        onChange={(val) => updateEntry(idx, 'pemateri', val)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                                        placeholder="Nama Ustadz / Pemateri..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="h-px bg-slate-100" />

                                            {/* Location Info */}
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">
                                                            <MapPin className="w-3 h-3" /> Lokasi Masjid
                                                        </label>
                                                        <AutosuggestInput
                                                            type="masjid"
                                                            value={entry.masjid}
                                                            onChange={(val) => updateEntry(idx, 'masjid', val)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                            placeholder="Nama Masjid..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Kota / Kabupaten</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={entry.city}
                                                                onChange={(e) => updateEntry(idx, 'city', e.target.value)} // Fallback
                                                                onClick={() => {
                                                                    setActiveCityDropdownIndex(activeCityDropdownIndex === idx ? null : idx);
                                                                    setCityFilter('');
                                                                }}
                                                                readOnly
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-100 transition-all"
                                                                placeholder="Pilih Kota..."
                                                            />
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                <LayoutDashboard className="w-4 h-4 rotate-45" />
                                                            </div>

                                                            {/* Dropdown Kota Mobile */}
                                                            {activeCityDropdownIndex === idx && (
                                                                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto left-0 animate-in fade-in zoom-in-95 duration-100">
                                                                    <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                                                        <input
                                                                            type="text"
                                                                            value={cityFilter}
                                                                            onChange={(e) => setCityFilter(e.target.value)}
                                                                            placeholder="Cari kota..."
                                                                            className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                    {indonesianCities
                                                                        .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                                                                        .map(city => (
                                                                            <button
                                                                                key={city}
                                                                                onClick={() => {
                                                                                    updateEntry(idx, 'city', city);
                                                                                    setActiveCityDropdownIndex(null);
                                                                                }}
                                                                                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                                                            >
                                                                                {city}
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="h-px bg-slate-100" />

                                            {/* Details & Options */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narahubung (CP)</label>
                                                        {entry.cp2 === undefined && (
                                                            <button
                                                                onClick={() => updateEntry(idx, 'cp2', '')}
                                                                className="text-[10px] text-blue-500 font-bold hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                            >
                                                                <PlusCircle className="w-3 h-3" /> Tambah
                                                            </button>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={entry.cp || ''}
                                                        onChange={(e) => updateEntry(idx, 'cp', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                        placeholder="CP Utama (08...)"
                                                    />

                                                    {entry.cp2 !== undefined && (
                                                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                                            <input
                                                                type="text"
                                                                value={entry.cp2}
                                                                onChange={(e) => updateEntry(idx, 'cp2', e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                                placeholder="CP Kedua..."
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    // Remove cp2 logic: set explicitly to undefined or empty, 
                                                                    // but here updateEntry handles 'key': undefined fine.
                                                                    updateEntry(idx, 'cp2', undefined);
                                                                    if (entry.cp3) {
                                                                        // Shift cp3 to cp2 if needed? Or just keep cp3?
                                                                        // Simpler to just delete cp2.
                                                                    }
                                                                }}
                                                                className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            {entry.cp3 === undefined && (
                                                                <button
                                                                    onClick={() => updateEntry(idx, 'cp3', '')}
                                                                    className="p-3 text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                                                                    title="Tambah CP 3"
                                                                >
                                                                    <PlusCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {entry.cp3 !== undefined && (
                                                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                                            <input
                                                                type="text"
                                                                value={entry.cp3}
                                                                onChange={(e) => updateEntry(idx, 'cp3', e.target.value)}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                                placeholder="CP Ketiga..."
                                                            />
                                                            <button
                                                                onClick={() => updateEntry(idx, 'cp3', undefined)}
                                                                className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Catatan (Optional)</label>
                                                    <textarea
                                                        value={entry.catatan || ''}
                                                        onChange={(e) => updateEntry(idx, 'catatan', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y min-h-[80px]"
                                                        placeholder="Info tambahan, pengumuman, dsb..."
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="col-span-2 grid grid-cols-2 gap-3">
                                                    <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${entry.khususAkhwat ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={entry.khususAkhwat || false}
                                                            onChange={(e) => updateEntry(idx, 'khususAkhwat', e.target.checked)}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${entry.khususAkhwat ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300'}`}>
                                                            {entry.khususAkhwat && <CheckCircle className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wide">Akhwat</span>
                                                    </label>

                                                    <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${entry.isOnline ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                        <input
                                                            type="checkbox"
                                                            checked={entry.isOnline || false}
                                                            onChange={(e) => updateEntry(idx, 'isOnline', e.target.checked)}
                                                            className="hidden"
                                                        />
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${entry.isOnline ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'}`}>
                                                            {entry.isOnline && <CheckCircle className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-wide">Online</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="h-px bg-slate-100" />

                                            {/* Media Upload */}
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Poster Kajian</label>
                                                <ImageUpload
                                                    label=""
                                                    value={entry.imageUrl || ''}
                                                    onChange={(url) => updateEntry(idx, 'imageUrl', url)}
                                                    className="w-full"
                                                />
                                            </div>

                                        </div>
                                    </div>
                                ))}
                                <div className="h-40" aria-hidden="true" /> {/* Spacer for keyboard */}
                            </div>
                        </div>
                    ) : (
                        <div className="batch-empty-state">
                            <div className="batch-empty-icon">
                                <Database className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="batch-empty-title">Siap Menunggu Data</p>
                            <p className="batch-empty-text">Belum ada jadwal yang diekstrak. Silakan tempel teks atau scan poster.</p>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-10 batch-message ${message.includes('Gagal') ? 'batch-message-error' : 'batch-message-success'} flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500`}>
                            <div className={`p-2 rounded-xl ${message.includes('Gagal') ? 'bg-red-100' : 'bg-blue-100'}`}>
                                <Info className="w-5 h-5" />
                            </div>
                            <span className="font-bold">{message}</span>
                        </div>
                    )}
                </div>
            </div>
            {/* Duplicate Warning Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-amber-50">
                            <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Peringatan Duplikat</h3>
                                <p className="text-sm text-slate-600">Ditemukan {duplicateEntries.length} jadwal yang mungkin sudah ada.</p>
                            </div>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50">
                            <div className="space-y-4">
                                {duplicateEntries.map((d, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border-2 border-amber-200 shadow-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="mt-1">
                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-amber-700 text-sm mb-1">Duplikat #{i + 1}</h4>
                                                <p className="text-xs text-slate-500">Masjid, tanggal, dan waktu yang sama sudah ada</p>
                                            </div>
                                        </div>

                                        {/* New Entry */}
                                        <div className="bg-blue-50 p-3 rounded-lg mb-2">
                                            <p className="text-xs font-bold text-blue-700 mb-2">📝 Data Baru (yang akan disimpan):</p>
                                            <div className="text-xs text-slate-700 space-y-1">
                                                <p className="font-bold">{d.new.tema}</p>
                                                <p>👤 {d.new.pemateri}</p>
                                                <p>🕌 {d.new.masjid}</p>
                                                <p>📅 {d.new.date} • ⏰ {d.new.waktu}</p>
                                            </div>
                                        </div>

                                        {/* Existing Entry */}
                                        <div className="bg-red-50 p-3 rounded-lg">
                                            <p className="text-xs font-bold text-red-700 mb-2">⚠️ Data yang Sudah Ada (ID: {d.existing.id}):</p>
                                            <div className="text-xs text-slate-700 space-y-1">
                                                <p className="font-bold">{d.existing.tema}</p>
                                                <p>👤 {d.existing.pemateri}</p>
                                                <p>🕌 {d.existing.masjid}</p>
                                                <p>📅 {d.existing.date} • ⏰ {d.existing.waktu}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-sm text-center text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                <strong>Perhatian:</strong> Kajian dengan masjid, tanggal, dan waktu yang sama terdeteksi sebagai duplikat.
                                <br />Pilih tindakan yang sesuai di bawah ini.
                            </p>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowDuplicateModal(false);
                                    setPendingSaveEntries([]);
                                    setDuplicateEntries([]);
                                    setMessage('Penyimpanan dibatalkan.');
                                }}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors flex-1"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmSave('skip')}
                                className="px-4 py-2 bg-white border-2 border-amber-500 text-amber-600 font-bold hover:bg-amber-50 rounded-xl transition-colors flex-1"
                            >
                                Lewati Duplikat
                            </button>
                            <button
                                onClick={() => handleConfirmSave('all')}
                                className="px-4 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors flex-1"
                            >
                                Simpan Semua
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewIndex !== null && entries[previewIndex] && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Preview Tampilan</h3>
                            <button
                                onClick={() => setPreviewIndex(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 flex justify-center bg-slate-50">
                            <KajianCard
                                id={0}
                                title={entries[previewIndex].tema}
                                ustadz={entries[previewIndex].pemateri}
                                date={entries[previewIndex].date}
                                location={entries[previewIndex].masjid}
                                imageUrl={entries[previewIndex].imageUrl}
                                khususAkhwat={entries[previewIndex].khususAkhwat}
                                isOnline={entries[previewIndex].isOnline}
                                waktu={entries[previewIndex].waktu}
                                className="w-full max-w-[280px] shadow-xl"
                            />
                        </div>
                        <div className="p-4 bg-white text-center">
                            <p className="text-[10px] text-slate-400 font-medium">Ini adalah tampilan kartu kajian yang akan muncul di halaman depan.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
