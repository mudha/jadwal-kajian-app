'use client';

import { ArrowLeft, Calendar, MapPin, Share2, Clock, Map as MapIcon, Calendar as CalendarIcon, ExternalLink, Hash, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
}

import Sidebar from '@/components/Sidebar';

export default function KajianDetailPage() {
    // ... existing state ...
    const params = useParams();
    const router = useRouter();
    const [kajian, setKajian] = useState<KajianDetail | null>(null);
    const [loading, setLoading] = useState(true);

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
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [params]);

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
                        {/* Hero / Poster Area */}
                        <div className="bg-slate-200 aspect-video relative rounded-3xl overflow-hidden shadow-sm">
                            {kajian.imageUrl ? (
                                <img src={kajian.imageUrl} alt={kajian.tema} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center p-8 text-center text-white">
                                    <div>
                                        <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <h2 className="text-2xl font-bold mb-2 shadow-sm">{kajian.tema}</h2>
                                        <p className="opacity-90">{kajian.pemateri}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                                {/* Title Section */}
                                <div className="border-b border-slate-100 pb-6">
                                    <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">
                                        {kajian.city}
                                    </span>
                                    <h1 className="text-xl font-bold text-slate-900 leading-snug mb-2">{kajian.tema}</h1>
                                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                                        <User className="w-4 h-4 text-teal-500" />
                                        <span>{kajian.pemateri}</span>
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
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
