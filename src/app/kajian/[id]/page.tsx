'use client';

import { ArrowLeft, Calendar, MapPin, Share2, Clock, Map as MapIcon, Calendar as CalendarIcon, ExternalLink, Hash, User, Loader2, CheckCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { parseIndoDate, getHijriDate, formatMasjidName, getKajianStatus } from '@/lib/date-utils';
import { useAdmin } from '@/hooks/useAdmin';

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
    khususAkhwat?: boolean;
    isOnline?: boolean;
}

import MiniPrayerTimeWidget from '@/components/MiniPrayerTimeWidget';
import LeftSidebar from '@/components/LeftSidebar';
import OngoingKajianWidget from '@/components/OngoingKajianWidget';

export default function KajianDetailPage() {
    // ... existing state ...
    const params = useParams();
    const router = useRouter();
    const { isAdmin } = useAdmin();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [kajian, setKajian] = useState<KajianDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAttended, setHasAttended] = useState(false);
    const [count, setCount] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [relatedKajian, setRelatedKajian] = useState<KajianDetail[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

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

                    // Fetch related kajian (same masjid, next 7 days)
                    fetchRelated(data.masjid, data.id);
                })
                .catch(() => {
                    setLoading(false);
                });
        }
    }, [params]);

    const fetchRelated = async (masjidName: string, currentId: number) => {
        setLoadingRelated(true);
        try {
            const res = await fetch('/api/kajian');
            const data = await res.json();
            if (Array.isArray(data)) {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const sevenDaysLater = new Date(now);
                sevenDaysLater.setDate(now.getDate() + 7);

                // Simple exact match with case-insensitive comparison
                const targetMasjid = masjidName.toLowerCase().trim();

                const related = data.filter(k => {
                    if (k.id === currentId) return false;

                    // Exact match with case-insensitive comparison
                    const kMasjid = k.masjid.toLowerCase().trim();
                    if (kMasjid !== targetMasjid) return false;

                    const kDate = parseIndoDate(k.date);
                    if (!kDate) return false;

                    return kDate >= now && kDate <= sevenDaysLater;
                });

                // Sort by date
                related.sort((a, b) => {
                    const da = parseIndoDate(a.date)?.getTime() || 0;
                    const db = parseIndoDate(b.date)?.getTime() || 0;
                    return da - db;
                });

                setRelatedKajian(related);
            }
        } catch (e) {
            console.error('Error fetching related kajian:', e);
        } finally {
            setLoadingRelated(false);
        }
    };

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
        const text = `*INFO KAJIAN SUNNAH*\n\n🕌 *Masjid:* ${formatMasjidName(kajian.masjid)}\n👤 *Pemateri:* ${kajian.pemateri}\n📚 *Tema:* ${kajian.tema}\n🗓 *Hari/Tgl:* ${kajian.date}\n⏰ *Waktu:* ${kajian.waktu}\n📍 *Lokasi:* ${kajian.gmapsUrl || kajian.address}\n\n_Link Aplikasi: jadwal-kajian.app_`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const addToCalendar = () => {
        const title = encodeURIComponent(`Kajian: ${kajian.pemateri} @ ${formatMasjidName(kajian.masjid)}`);
        const details = encodeURIComponent(`Tema: ${kajian.tema}\nLokasi: ${kajian.address}`);
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(kajian.address)}&sf=true&output=xml`;
        window.open(url, '_blank');
    };

    const handleDelete = async () => {
        if (!kajian || !confirm('Apakah Anda yakin ingin menghapus kajian ini?')) return;

        try {
            const res = await fetch(`/api/kajian/${kajian.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push('/kajian');
            } else {
                alert('Gagal menghapus kajian');
            }
        } catch (e) {
            console.error('Error deleting kajian:', e);
            alert('Terjadi kesalahan saat menghapus');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative overflow-x-hidden">
            {/* Mobile Sidebar / Drawer */}
            <div className={`fixed inset-0 z-[100] bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
                <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`} onClick={e => e.stopPropagation()}>
                    <div className="p-6 bg-teal-600 text-white shrink-0">
                        <h2 className="font-bold text-xl mb-1">Menu</h2>
                        <p className="text-teal-100 text-xs">PortalKajian.online</p>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                        <LeftSidebar />
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-40 bg-opacity-95 backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-3 max-w-7xl mx-auto px-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold truncate">Detail Kajian</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="md:grid md:grid-cols-12 md:gap-8">
                    {/* Left Column (Desktop Sidebar) */}
                    <aside className="md:col-span-4 space-y-6 hidden md:block order-1">
                        <LeftSidebar />
                        <OngoingKajianWidget />
                    </aside>

                    {/* Right Column (Main Content) */}
                    <div className="md:col-span-8 order-2">

                        <div className="mt-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
                                {/* Title Section with Thumbnail */}
                                <div className="border-b border-slate-100 pb-6">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-teal-100">
                                                    {kajian.city}
                                                </span>
                                                {kajian.isOnline && (
                                                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-100">
                                                        🎥 Kajian Online
                                                    </span>
                                                )}
                                                {(kajian.khususAkhwat || kajian.pemateri.toLowerCase().includes('ustadzah')) && (
                                                    <span className="inline-block px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-pink-100 animate-pulse">
                                                        🌸 Khusus Akhwat
                                                    </span>
                                                )}
                                                {getKajianStatus(kajian.date, kajian.waktu) === 'PAST' && (
                                                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-200">
                                                        ✓ Selesai
                                                    </span>
                                                )}
                                            </div>
                                            <h1 className="text-xl font-bold text-slate-900 leading-snug mb-3">{kajian.tema}</h1>
                                            <div className="flex items-center gap-2 text-slate-600 font-bold bg-slate-50 w-fit px-3 py-1.5 rounded-xl border border-slate-100">
                                                <User className="w-4 h-4 text-teal-500" />
                                                <span className="text-sm">{kajian.pemateri}</span>
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
                                            <p className="font-bold text-slate-800">{formatMasjidName(kajian.masjid)}</p>
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
                                            Rute ke Lokasi
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

                                {/* Admin Controls */}
                                {isAdmin && (
                                    <div className="mt-6 pt-6 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Admin Controls</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href={`/admin/manage?edit=${kajian.id}`}
                                                className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Kajian
                                            </Link>
                                            <button
                                                onClick={handleDelete}
                                                className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Weekly Schedule Section */}
                            {(loadingRelated || relatedKajian.length > 0) && (
                                <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-teal-50 rounded-xl">
                                            <CalendarIcon className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Jadwal Kajian di Masjid Ini</h3>
                                            <p className="text-xs text-slate-500 font-medium tracking-wide">(7 Hari Kedepan)</p>
                                        </div>
                                    </div>

                                    {loadingRelated ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {relatedKajian.map((rk) => (
                                                <Link
                                                    href={`/kajian/${rk.id}`}
                                                    key={rk.id}
                                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-teal-50 transition-all border border-transparent hover:border-teal-100 group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-lg uppercase tracking-wider">
                                                                {rk.date.split(',')[0]}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{rk.waktu}</span>
                                                            {getKajianStatus(rk.date, rk.waktu) === 'PAST' && (
                                                                <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-lg uppercase tracking-wider">
                                                                    ✓ Selesai
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-teal-700 transition-colors truncate">
                                                            {rk.tema}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500 font-medium truncate">{rk.pemateri}</p>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
