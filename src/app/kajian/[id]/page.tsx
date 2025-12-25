'use client';

import { ArrowLeft, Calendar, MapPin, Share2, Clock, Map as MapIcon, Calendar as CalendarIcon, ExternalLink, Hash, User, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { parseIndoDate, getHijriDate } from '@/lib/date-utils';

// Reusing types locally for simplicity or import if shared
interface KajianDetail {
    id: number;
    masjid: string;
    pemateri: string;
    tema: string;
    waktu: string;
    date: string;
    city: string;
    address: string;
    imageUrl?: string;
    gmapsUrl?: string;
    linkInfo?: string;
    attendanceCount?: number;
}

import PrayerTimeWidget from '@/components/PrayerTimeWidget';

export default function KajianDetailPage() {
    // ... existing state ...
    const params = useParams();
    const router = useRouter();
    const [kajian, setKajian] = useState<KajianDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAttended, setHasAttended] = useState(false);
    const [count, setCount] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // ... existing useEffect ...
    useEffect(() => {
        if (params?.id) {
            fetch(`/api/kajian/${params.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Not found');
                    return res.json();
                })
                .then(data => {
                    setKajian(data);
                    setCount(data.attendanceCount || 0);
                    setLoading(false);
                    // Check local storage
                    if (localStorage.getItem(`attended_${data.id}`)) {
                        setHasAttended(true);
                    }
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [params]);

    const handleAttend = async () => {
        if (!kajian || hasAttended) return;

        // Optimistic
        setHasAttended(true);
        setCount(prev => prev + 1);
        localStorage.setItem(`attended_${kajian.id}`, 'true');

        try {
            await fetch(`/api/kajian/${kajian.id}/attend`, { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
    };

    // ... existing loading check ...
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!kajian) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 font-bold mb-4">Kajian tidak ditemukan</p>
                <Link href="/" className="text-teal-600 font-bold hover:underline">Kembali ke Beranda</Link>
            </div>
        );
    }

    // ... existing helper functions ...
    const shareToWA = () => {
        const text = `*INFO KAJIAN SUNNAH*\n\n🕌 *Masjid:* ${kajian.masjid}\n👤 *Pemateri:* ${kajian.pemateri}\n📚 *Tema:* ${kajian.tema}\n🗓 *Hari/Tgl:* ${kajian.date}\n⏰ *Waktu:* ${kajian.waktu}\n📍 *Lokasi:* ${kajian.gmapsUrl || kajian.address}\n\n_Link Aplikasi: jadwal-kajian.app_`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const addToCalendar = () => {
        const title = encodeURIComponent(`Kajian: ${kajian.pemateri} @ ${kajian.masjid}`);
        const details = encodeURIComponent(`Tema: ${kajian.tema}\nLokasi: ${kajian.address}`);
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(kajian.address)}&sf=true&output=xml`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-40 bg-opacity-95 backdrop-blur-sm">
                <div className="flex items-center gap-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold truncate">Detail Kajian</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="md:grid md:grid-cols-12 md:gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-8">
                        <div className="mt-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                                {/* Title Section with Thumbnail */}
                                <div className="border-b border-slate-100 pb-6">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">
                                                {kajian.city}
                                            </span>
                                            <h1 className="text-xl font-bold text-slate-900 leading-snug mb-2">{kajian.tema}</h1>
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <User className="w-4 h-4 text-teal-500" />
                                                <span>{kajian.pemateri}</span>
                                            </div>
                                        </div>

                                        {/* Thumbnail Image */}
                                        {kajian.imageUrl && (
                                            <button
                                                onClick={() => setIsImageModalOpen(true)}
                                                className="shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-105 cursor-pointer group relative"
                                            >
                                                <img
                                                    src={kajian.imageUrl}
                                                    alt={kajian.tema}
                                                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                                        <ExternalLink className="w-4 h-4 text-slate-700" />
                                                    </div>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <Clock className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Waktu</p>
                                            <p className="font-bold text-slate-800">{kajian.date}</p>
                                            <p className="text-[10px] text-teal-600 font-medium">
                                                {(() => {
                                                    const d = parseIndoDate(kajian.date);
                                                    return d ? getHijriDate(d) : '';
                                                })()}
                                            </p>
                                            <p className="text-sm text-slate-600">{kajian.waktu}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <MapPin className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Lokasi</p>
                                            <p className="font-bold text-slate-800">{kajian.masjid}</p>
                                            <p className="text-sm text-slate-600 leading-relaxed">{kajian.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Insyaallah Hadir - Icon & Counter */}
                                <div className="flex items-center justify-center gap-8 py-2">
                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            onClick={handleAttend}
                                            disabled={hasAttended}
                                            title="Insyaallah Hadir"
                                            className={`group relative p-4 rounded-full transition-all duration-300 ${hasAttended
                                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                                : 'bg-slate-100 text-slate-400 hover:bg-teal-50 hover:text-teal-500 hover:scale-110'
                                                }`}
                                        >
                                            <CheckCircle className={`w-8 h-8 ${hasAttended ? 'fill-white' : ''}`} />
                                        </button>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider text-center leading-tight ${hasAttended ? 'text-teal-600' : 'text-slate-400'
                                            }`}>
                                            Insyaallah<br />Saya Hadir
                                        </span>
                                    </div>

                                    <div className="flex flex-col items-center group cursor-help">
                                        <span className="text-3xl font-black text-slate-800 tracking-tight" title="Jamaah yg hadir">
                                            {count}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jamaah</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={shareToWA}
                                        className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share WA
                                    </button>
                                    <button
                                        onClick={addToCalendar}
                                        className="flex items-center justify-center gap-2 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-100 transition-colors"
                                    >
                                        <CalendarIcon className="w-4 h-4" />
                                        Ingatkan
                                    </button>
                                    {kajian.gmapsUrl && (
                                        <a
                                            href={kajian.gmapsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95"
                                        >
                                            <MapIcon className="w-4 h-4" />
                                            Buka Peta Lokasi
                                        </a>
                                    )}
                                    {kajian.linkInfo && (
                                        <a
                                            href={kajian.linkInfo}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Link Streaming / Pendaftaran
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Desktop) */}
                    <div className="hidden md:block md:col-span-4 mt-6 md:mt-0">
                        <PrayerTimeWidget />
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {isImageModalOpen && kajian?.imageUrl && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={kajian.imageUrl}
                            alt={kajian.tema}
                            className="w-full h-full object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
