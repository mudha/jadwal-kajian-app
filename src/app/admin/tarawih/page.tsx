'use client';
import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { parseTarawihSchedule, KajianEntry } from '@/lib/parser';
import { geocodeAddress, extractCoordsFromUrl } from '@/lib/geocoding';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Save, CheckCircle, AlertCircle, ArrowLeft,
    Loader2, Eye, Trash2, MapPin, Phone, Building2, User, Navigation, Search, X
} from 'lucide-react';

interface MasjidOption {
    id: string;
    name: string;
    city: string;
    address: string;
    gmapsUrl: string;
    lat: number | null;
    lng: number | null;
    kajianCount: number;
}

export default function TarawihInputPage() {
    const router = useRouter();
    const { role, isLoading: isAdminLoading } = useAdmin();
    const masjidInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Masjid info fields
    const [masjid, setMasjid] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [gmapsUrl, setGmapsUrl] = useState('');
    const [cp, setCp] = useState('');

    // Masjid autocomplete
    const [allMasjid, setAllMasjid] = useState<MasjidOption[]>([]);
    const [masjidSuggestions, setMasjidSuggestions] = useState<MasjidOption[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isMasjidLoading, setIsMasjidLoading] = useState(false);
    const [selectedMasjid, setSelectedMasjid] = useState<MasjidOption | null>(null);

    // Schedule
    const [scheduleText, setScheduleText] = useState('');
    const [entries, setEntries] = useState<KajianEntry[]>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [isSaving, setIsSaving] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [isParsed, setIsParsed] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number; gmapsUrl: string } | null>(null);

    useEffect(() => {
        if (!isAdminLoading && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            router.push('/admin');
        }
    }, [role, isAdminLoading]);

    // Fetch all masjid on mount
    useEffect(() => {
        const fetchMasjid = async () => {
            setIsMasjidLoading(true);
            try {
                const res = await fetch('/api/admin/masjid');
                if (res.ok) {
                    const data = await res.json();
                    setAllMasjid(data);
                }
            } catch (e) {
                console.error('Failed to fetch masjid list', e);
            } finally {
                setIsMasjidLoading(false);
            }
        };
        fetchMasjid();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                masjidInputRef.current && !masjidInputRef.current.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMasjidInput = (value: string) => {
        setMasjid(value);
        setSelectedMasjid(null); // clear selection when typing manually

        if (value.trim().length < 2) {
            setMasjidSuggestions([]);
            setShowDropdown(false);
            return;
        }

        const q = value.toLowerCase();
        const filtered = allMasjid.filter(m =>
            m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q)
        ).slice(0, 8);

        setMasjidSuggestions(filtered);
        setShowDropdown(filtered.length > 0);
    };

    const handleSelectMasjid = (option: MasjidOption) => {
        setMasjid(option.name);
        setCity(option.city);
        setAddress(option.address || '');
        setGmapsUrl(option.gmapsUrl || '');
        setSelectedMasjid(option);
        setShowDropdown(false);

        // If masjid already has coords, set them immediately
        if (option.lat && option.lng) {
            const resolvedGmapsUrl = option.gmapsUrl || `https://www.google.com/maps?q=${option.lat},${option.lng}`;
            setCoords({ lat: option.lat, lng: option.lng, gmapsUrl: resolvedGmapsUrl });
        } else {
            setCoords(null);
        }
    };

    const handleClearMasjid = () => {
        setMasjid('');
        setCity('');
        setAddress('');
        setGmapsUrl('');
        setSelectedMasjid(null);
        setCoords(null);
        setMasjidSuggestions([]);
        setShowDropdown(false);
        masjidInputRef.current?.focus();
    };

    const handleParse = async () => {
        if (!masjid.trim() || !city.trim()) {
            setMessage('Nama masjid dan kota wajib diisi terlebih dahulu.');
            setMessageType('error');
            return;
        }
        if (!scheduleText.trim()) {
            setMessage('Tempel jadwal tarawih di kolom teks terlebih dahulu.');
            setMessageType('error');
            return;
        }

        const parsed = parseTarawihSchedule(scheduleText, {
            masjid: masjid.trim(),
            city: city.trim(),
            address: address.trim() || masjid.trim(),
            gmapsUrl: gmapsUrl.trim() || undefined,
            cp: cp.trim() || undefined,
            tahun: 2026,
        });

        if (parsed.length === 0) {
            setMessage('Tidak ada jadwal yang berhasil diparse. Pastikan format sesuai (kolom: Malam | Tanggal Masehi | Hari | Nama Imam).');
            setMessageType('error');
            return;
        }

        // If masjid already has coords from selection, apply immediately
        let resolvedLat: number | undefined = selectedMasjid?.lat ?? undefined;
        let resolvedLng: number | undefined = selectedMasjid?.lng ?? undefined;
        let resolvedGmapsUrl = gmapsUrl.trim();

        if (resolvedLat && resolvedLng) {
            // Already have coords from DB selection
            if (!resolvedGmapsUrl) resolvedGmapsUrl = `https://www.google.com/maps?q=${resolvedLat},${resolvedLng}`;
            const withCoords = parsed.map(e => ({ ...e, lat: resolvedLat, lng: resolvedLng, gmapsUrl: resolvedGmapsUrl }));
            setEntries(withCoords);
            setIsParsed(true);
            setCoords({ lat: resolvedLat, lng: resolvedLng, gmapsUrl: resolvedGmapsUrl });
            setMessage(`✅ Berhasil memparse ${parsed.length} jadwal imam tarawih. Koordinat dari database (${resolvedLat.toFixed(5)}, ${resolvedLng.toFixed(5)}).`);
            setMessageType('success');
            return;
        }

        // Need to geocode
        setEntries(parsed);
        setIsParsed(true);
        setMessage(`✅ Berhasil memparse ${parsed.length} jadwal. Sedang mencari koordinat lokasi masjid...`);
        setMessageType('info');

        setIsGeocoding(true);
        try {
            // 1. Try extract from GMaps URL
            if (resolvedGmapsUrl) {
                const urlCoords = extractCoordsFromUrl(resolvedGmapsUrl);
                if (urlCoords) {
                    resolvedLat = urlCoords.lat;
                    resolvedLng = urlCoords.lng;
                }
            }

            // 2. Geocode via name + address + city
            if (!resolvedLat || !resolvedLng) {
                const geocoded = await geocodeAddress(
                    masjid.trim(),
                    address.trim() || masjid.trim(),
                    city.trim()
                );
                if (geocoded) {
                    resolvedLat = geocoded.lat;
                    resolvedLng = geocoded.lng;
                    if (!resolvedGmapsUrl) {
                        resolvedGmapsUrl = `https://www.google.com/maps?q=${geocoded.lat},${geocoded.lng}`;
                    }
                }
            }

            if (resolvedLat && resolvedLng) {
                setEntries(prev => prev.map(e => ({
                    ...e,
                    lat: resolvedLat,
                    lng: resolvedLng,
                    gmapsUrl: resolvedGmapsUrl || e.gmapsUrl,
                })));
                setCoords({ lat: resolvedLat, lng: resolvedLng, gmapsUrl: resolvedGmapsUrl });
                setMessage(`✅ Berhasil memparse ${parsed.length} jadwal imam tarawih. Koordinat ditemukan (${resolvedLat.toFixed(5)}, ${resolvedLng.toFixed(5)}).`);
                setMessageType('success');
            } else {
                setMessage(`✅ Berhasil memparse ${parsed.length} jadwal. Koordinat tidak ditemukan — filter terdekat tidak akan bekerja untuk jadwal ini.`);
                setMessageType('success');
            }
        } catch (e) {
            console.error('Geocoding error:', e);
            setMessage(`✅ Berhasil memparse ${parsed.length} jadwal. Geocoding gagal — silakan isi Google Maps URL secara manual.`);
            setMessageType('success');
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleRemoveEntry = (index: number) => {
        setEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        if (entries.length === 0) return;

        setIsSaving(true);
        setSavedCount(0);
        setMessage(`Menyimpan ${entries.length} jadwal...`);
        setMessageType('info');

        let successCount = 0;
        let failCount = 0;

        for (const entry of entries) {
            try {
                const res = await fetch('/api/kajian', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                });
                if (res.ok) {
                    successCount++;
                    setSavedCount(successCount);
                } else {
                    failCount++;
                }
            } catch (e) {
                failCount++;
            }
        }

        setIsSaving(false);
        if (failCount === 0) {
            setMessage(`✅ Alhamdulillah! ${successCount} jadwal imam tarawih berhasil disimpan.`);
            setMessageType('success');
            setEntries([]);
            setIsParsed(false);
            setCoords(null);
        } else {
            setMessage(`⚠️ ${successCount} berhasil, ${failCount} gagal disimpan.`);
            setMessageType('error');
        }
    };

    if (isAdminLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 rounded-3xl p-8 text-white shadow-2xl">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-yellow-200"
                            style={{
                                width: Math.random() * 3 + 1 + 'px',
                                height: Math.random() * 3 + 1 + 'px',
                                top: Math.random() * 100 + '%',
                                left: Math.random() * 100 + '%',
                                opacity: Math.random() * 0.7 + 0.3,
                            }}
                        />
                    ))}
                </div>
                <div className="relative z-10 flex items-center gap-4">
                    <Link href="/admin" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-14 h-14 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-3xl">
                        🌙
                    </div>
                    <div>
                        <div className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Ramadhan 1447 H</div>
                        <h1 className="text-2xl font-bold">Input Jadwal Imam Tarawih</h1>
                        <p className="text-emerald-200 text-sm mt-1">
                            Paste jadwal dari DKM → parse otomatis → simpan 30 hari sekaligus
                        </p>
                    </div>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`flex items-start gap-3 p-4 rounded-2xl border ${messageType === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : messageType === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                    {messageType === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}

            {/* Step 1: Masjid Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">1</div>
                    <h2 className="text-lg font-bold text-slate-800">Info Masjid</h2>
                    {isMasjidLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Masjid name with autocomplete */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            <Building2 className="w-3.5 h-3.5 inline mr-1" />Nama Masjid *
                        </label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    ref={masjidInputRef}
                                    type="text"
                                    value={masjid}
                                    onChange={e => handleMasjidInput(e.target.value)}
                                    onFocus={() => {
                                        if (masjidSuggestions.length > 0) setShowDropdown(true);
                                    }}
                                    placeholder="Ketik nama masjid untuk mencari..."
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-colors ${selectedMasjid
                                        ? 'border-emerald-300 bg-emerald-50'
                                        : 'border-slate-200'
                                        }`}
                                />
                                {masjid && (
                                    <button
                                        onClick={handleClearMasjid}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown suggestions */}
                            {showDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
                                >
                                    {masjidSuggestions.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelectMasjid(option)}
                                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-slate-50 last:border-0"
                                        >
                                            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${option.lat && option.lng
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 text-sm truncate">{option.name}</div>
                                                <div className="text-xs text-slate-500 truncate">{option.city}{option.address ? ` · ${option.address}` : ''}</div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {option.lat && option.lng ? (
                                                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                                            <Navigation className="w-2.5 h-2.5" />
                                                            Ada koordinat
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Belum ada koordinat</span>
                                                    )}
                                                    <span className="text-xs text-slate-400">· {option.kajianCount} kajian</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected masjid badge */}
                        {selectedMasjid && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    Dipilih dari database
                                </span>
                                {selectedMasjid.lat && selectedMasjid.lng && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
                                        <Navigation className="w-3 h-3" />
                                        {Number(selectedMasjid.lat).toFixed(5)}, {Number(selectedMasjid.lng).toFixed(5)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            <MapPin className="w-3.5 h-3.5 inline mr-1" />Kota *
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder="Tangerang Selatan"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            <Phone className="w-3.5 h-3.5 inline mr-1" />CP / Kontak DKM
                        </label>
                        <input
                            type="text"
                            value={cp}
                            onChange={e => setCp(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            Alamat
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            Google Maps URL (opsional)
                        </label>
                        <input
                            type="text"
                            value={gmapsUrl}
                            onChange={e => setGmapsUrl(e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Step 2: Paste Schedule */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">2</div>
                    <h2 className="text-lg font-bold text-slate-800">Paste Jadwal Tarawih</h2>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                    <strong>Format yang didukung:</strong> Copy-paste dari spreadsheet/WhatsApp. Setiap baris berisi:
                    <code className="block mt-1 bg-amber-100 px-2 py-1 rounded font-mono">
                        1 Ramadhan | 18 Februari | RABU | Ust. Bayu
                    </code>
                    Separator bisa tab, pipe (|), atau spasi ganda. Gunakan kolom tanggal <strong>Masehi</strong>.
                </div>
                <textarea
                    value={scheduleText}
                    onChange={e => setScheduleText(e.target.value)}
                    placeholder={`Contoh:\n1 Ramadhan\t18 Februari\tRABU\tUst.Bayu\n2 Ramadhan\t19 Februari\tKAMIS\tUst.Yasir Nasrullah\n3 Ramadhan\t20 Februari\tJUMAT\tUst.Imat Ruhimat`}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono resize-y"
                />
                <button
                    onClick={handleParse}
                    disabled={isGeocoding}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                >
                    {isGeocoding ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Mencari koordinat...</>
                    ) : (
                        <><Eye className="w-4 h-4" />Parse & Preview Jadwal</>
                    )}
                </button>
            </div>

            {/* Step 3: Preview & Save */}
            {isParsed && entries.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">3</div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Preview ({entries.length} jadwal)
                            </h2>
                            {coords && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                                    <Navigation className="w-3 h-3" />
                                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan {savedCount}/{entries.length}...</>
                            ) : (
                                <><Save className="w-4 h-4" />Simpan Semua ({entries.length})</>
                            )}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Malam</th>
                                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Tanggal</th>
                                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Imam</th>
                                    <th className="text-left py-2 px-3 text-xs font-bold text-slate-500 uppercase">Catatan</th>
                                    <th className="py-2 px-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry, i) => {
                                    const malamMatch = entry.tema.match(/Malam ke-(\d+)/);
                                    const malam = malamMatch ? malamMatch[1] : (i + 1).toString();
                                    return (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-2.5 px-3">
                                                <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg font-black text-xs">
                                                    {malam}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-700 font-medium">{entry.date}</td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-slate-800 font-semibold">{entry.pemateri}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-500 text-xs">{entry.catatan || '-'}</td>
                                            <td className="py-2.5 px-3">
                                                <button
                                                    onClick={() => handleRemoveEntry(i)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Save button bottom */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan {savedCount}/{entries.length}...</>
                            ) : (
                                <><Save className="w-4 h-4" />Simpan {entries.length} Jadwal Imam Tarawih</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
