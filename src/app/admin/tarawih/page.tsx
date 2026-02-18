'use client';
import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { parseTarawihSchedule, KajianEntry } from '@/lib/parser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Moon, Save, CheckCircle, AlertCircle, ArrowLeft,
    Loader2, Eye, Trash2, MapPin, Phone, Building2, User
} from 'lucide-react';

export default function TarawihInputPage() {
    const router = useRouter();
    const { role, isLoading: isAdminLoading } = useAdmin();

    const [masjid, setMasjid] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [gmapsUrl, setGmapsUrl] = useState('');
    const [cp, setCp] = useState('');
    const [scheduleText, setScheduleText] = useState('');
    const [entries, setEntries] = useState<KajianEntry[]>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const [isSaving, setIsSaving] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [isParsed, setIsParsed] = useState(false);

    useEffect(() => {
        if (!isAdminLoading && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            router.push('/admin');
        }
    }, [role, isAdminLoading]);

    const handleParse = () => {
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

        setEntries(parsed);
        setIsParsed(true);
        setMessage(`✅ Berhasil memparse ${parsed.length} jadwal imam tarawih. Silakan review sebelum menyimpan.`);
        setMessageType('success');
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
                {/* Stars decoration */}
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                            <Building2 className="w-3.5 h-3.5 inline mr-1" />Nama Masjid *
                        </label>
                        <input
                            type="text"
                            value={masjid}
                            onChange={e => setMasjid(e.target.value)}
                            placeholder="Masjid Al Furqon"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
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
                    <div className="md:col-span-2">
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
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                >
                    <Eye className="w-4 h-4" />
                    Parse & Preview Jadwal
                </button>
            </div>

            {/* Step 3: Preview & Save */}
            {isParsed && entries.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-sm">3</div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Preview ({entries.length} jadwal)
                            </h2>
                        </div>
                        <button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Menyimpan {savedCount}/{entries.length}...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan Semua ({entries.length})
                                </>
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
