'use client';
import { useEffect, useState, Suspense } from 'react';
import { KajianEntry } from '@/lib/parser';
import { Calendar, MapPin, User, Clock, Search, Trash2, ArrowLeft, History, ListFilter, MessageCircle, Edit, X, Save, Map as MapIcon, Share2, ExternalLink, ImageIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import Link from 'next/link';
import { getKajianStatus } from '@/lib/date-utils';
import dynamic from 'next/dynamic';
import PrayerTimeWidget from '@/components/PrayerTimeWidget';
import MenuGrid from '@/components/MenuGrid';

const KajianMap = dynamic(() => import('@/components/KajianMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Harap tunggu, peta sedang dimuat...</div>

});

import { parseIndoDate, getHijriDate } from '@/lib/date-utils';

interface KajianWithId extends KajianEntry {
    id: number;
    distance?: number; // Distance in km
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function KajianListContent() {
    const searchParams = useSearchParams();
    const filterMode = searchParams.get('mode');
    const filterCity = searchParams.get('city');

    const [kajianList, setKajianList] = useState<KajianWithId[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('today');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKajian, setEditingKajian] = useState<KajianWithId | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocatingUser, setIsLocatingUser] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/kajian');
            const data = await response.json();
            if (Array.isArray(data)) {
                setKajianList(data);
            }
        } catch (e) {
            console.error('Error fetching kajian data', e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Effect for nearby mode
    useEffect(() => {
        if (filterMode === 'nearby') {
            setIsLocatingUser(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                        setIsLocatingUser(false);
                    },
                    (error) => {
                        console.error('Error getting location', error);
                        setIsLocatingUser(false);
                        alert('Gagal mengambil lokasi Anda. Pastikan GPS aktif.');
                    }
                );
            } else {
                alert('Geolocation tidak didukung browser ini.');
                setIsLocatingUser(false);
            }
        }
    }, [filterMode]);

    let processedKajian = [...kajianList];

    // Calculate distance if user location is available
    if (userLocation) {
        processedKajian = processedKajian.map(k => {
            if (k.lat && k.lng) {
                const dist = haversineDistance(userLocation.lat, userLocation.lng, k.lat, k.lng);
                return { ...k, distance: dist };
            }
            return k;
        });
    }

    const filteredKajian = processedKajian.filter(k => {
        // City Filtering (Priority)
        if (filterCity) {
            if (k.city.toLowerCase() !== filterCity.toLowerCase()) return false;
        }

        // Mode Filtering
        if (filterMode === 'online') {
            const isOnline = k.city.toLowerCase().includes('online') ||
                k.masjid.toLowerCase().includes('online') ||
                k.address.toLowerCase().includes('online') ||
                k.city.toLowerCase() === 'live streaming' ||
                !!k.linkInfo; // Also check if streaming link exists
            if (!isOnline) return false;
        }

        if (filterMode === 'akhwat') {
            const isAkhwat = (k.khususAkhwat as unknown as number) === 1 ||
                k.khususAkhwat === true ||
                k.tema.toLowerCase().includes('muslimah') ||
                k.tema.toLowerCase().includes('akhwat');
            if (!isAkhwat) return false;
        }

        // Nearby filtering (Improved)
        // Only strict filter if no specific city/search is applied
        if (filterMode === 'nearby' && !searchTerm && !filterCity) {
            if (userLocation) {
                // If kajian has coordinates, use distance-based filtering
                if (k.distance !== undefined) {
                    if (k.distance > 80) return false; // 80km radius
                } else {
                    // If no coordinates, include nearby cities (Jakarta & Tangerang area)
                    const nearbyCities = [
                        'jakarta', 'tangerang', 'bekasi', 'depok', 'bogor',
                        'jakarta barat', 'jakarta selatan', 'jakarta timur', 'jakarta utara', 'jakarta pusat',
                        'tangerang selatan', 'tangerang kota', 'bekasi kota', 'bekasi barat', 'bekasi timur',
                        'depok kota', 'bogor kota'
                    ];

                    const cityLower = k.city.toLowerCase();
                    const isNearbyCity = nearbyCities.some(city =>
                        cityLower.includes(city) || city.includes(cityLower)
                    );

                    if (!isNearbyCity) return false;
                }
            }
        }

        const matchesSearch = k.masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.pemateri.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.city.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;

        const status = getKajianStatus(k.date, k.waktu);
        if (activeTab === 'today') return status === 'TODAY';
        if (activeTab === 'upcoming') return status === 'UPCOMING';
        if (activeTab === 'past') return status === 'PAST';

        return true;
    });

    // Sort by distance if mode is nearby
    if (filterMode === 'nearby' && userLocation) {
        filteredKajian.sort((a, b) => {
            if (a.distance !== undefined && b.distance !== undefined) {
                return a.distance - b.distance;
            }
            // Put items with distance first
            if (a.distance !== undefined) return -1;
            if (b.distance !== undefined) return 1;
            return 0;
        });
    }

    const clearData = async () => {
        if (confirm('Apakah Anda yakin ingin menghapus semua data kajian dari database?')) {
            try {
                await fetch('/api/kajian', { method: 'DELETE' });
                setKajianList([]);
            } catch (e) {
                console.error('Error deleting data', e);
            }
        }
    };

    const deleteIndividual = async (id: number) => {
        if (confirm('Hapus jadwal kajian ini?')) {
            try {
                const res = await fetch(`/api/kajian/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setKajianList(prev => prev.filter(k => k.id !== id));
                }
            } catch (e) {
                console.error('Delete error', e);
            }
        }
    };

    const openEditModal = (kajian: KajianWithId) => {
        setEditingKajian({ ...kajian });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKajian) return;

        try {
            const res = await fetch(`/api/kajian/${editingKajian.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingKajian),
            });

            if (res.ok) {
                setKajianList(prev => prev.map(k => k.id === editingKajian.id ? editingKajian : k));
                setIsEditModalOpen(false);
                setEditingKajian(null);
            }
        } catch (e) {
            console.error('Update error', e);
        }
    };

    const [isLocating, setIsLocating] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung oleh browser Anda');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Reverse geocoding using Nominatim (free)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12`);
                const data = await res.json();

                // Extract administrative areas
                const addr = data.address;
                let city = addr.city || addr.town || addr.city_district || addr.county || addr.state || '';

                // Smart Normalization for Greater Regions
                let searchKey = city;

                if (city.toLowerCase().includes('tangerang')) {
                    // Normalize 'Tangerang Selatan' or 'Kota Tangerang' to just 'Tangerang' 
                    // to catch nearby results in both cities
                    searchKey = 'Tangerang';
                } else if (city.toLowerCase().includes('jakarta')) {
                    // For Jakarta, usually searching just 'Jakarta' is better than 'Jakarta Selatan'
                    searchKey = 'Jakarta';
                }

                if (searchKey) {
                    setSearchTerm(searchKey);
                } else {
                    alert('Tidak dapat mendeteksi nama daerah Anda');
                }
            } catch (e) {
                console.error('Location error', e);
                alert('Gagal mengambil data lokasi');
            } finally {
                setIsLocating(false);
            }
        }, (err) => {
            console.error(err);
            setIsLocating(false);
            alert('Izin lokasi ditolak atau gagal mengambil posisi');
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Mobile Header */}
            <header className="bg-teal-600 text-white px-4 py-3 sticky top-0 z-40 md:hidden">
                <div className="flex items-center gap-3 mb-3">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold flex-1">Daftar Jadwal Kajian</h1>
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari masjid, ustadz,atau kota..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 rounded-full placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between py-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Jadwal Kajian Sunnah</h1>
                    <p className="text-slate-500">Temukan jadwal kajian ilmiah di berbagai kota di Indonesia</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className={`p-2.5 rounded-xl border border-slate-200 transition-all ${showMap ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 hover:border-teal-300'}`}
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="md:grid md:grid-cols-12 md:gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Left Column (Kajian List) */}
                <div className="md:col-span-8">
                    <main className="px-4 py-4 pb-24 md:px-0 md:py-0">
                        {/* Map Section */}
                        <div className="mb-12">
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-[0.2em] mb-4 ${showMap
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50'
                                    }`}
                            >
                                <MapIcon className={`w-4 h-4 ${showMap ? 'animate-bounce' : ''}`} />
                                {showMap ? 'Sembunyikan Peta Lokasi' : 'Lihat Sebaran Kajian di Peta'}
                            </button>

                            {showMap && (
                                <div className="animate-in slide-in-from-top-4 duration-500">
                                    <KajianMap items={filteredKajian} />
                                </div>
                            )}
                        </div>

                        {/* Filter Kota (Pills) */}
                        {
                            kajianList.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Kota</p>
                                        <div className="text-[10px] font-bold text-teal-600 cursor-pointer hover:underline" onClick={() => setSearchTerm('')}>Reset Filter</div>
                                    </div>
                                    <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 md:scrollbar-default">
                                        {Array.from(new Set(kajianList.map(k => k.city)))
                                            .sort()
                                            .map(city => {
                                                const isActive = searchTerm.toLowerCase() === city.toLowerCase();
                                                const count = kajianList.filter(k => k.city === city).length;
                                                return (
                                                    <button
                                                        key={city}
                                                        onClick={() => setSearchTerm(isActive ? '' : city)}
                                                        className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all border shadow-sm ${isActive
                                                            ? 'bg-teal-600 text-white border-teal-600 shadow-teal-100 ring-2 ring-teal-600 ring-offset-2'
                                                            : 'bg-white text-slate-600 border-slate-100 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600'
                                                            }`}
                                                    >
                                                        {city}
                                                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                            {count}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )
                        }

                        {/* Tabs Filter */}
                        <div className="flex flex-wrap gap-2 mb-8 bg-white/50 p-1.5 rounded-2xl border border-slate-200 w-fit">
                            {[
                                { id: 'all', label: 'Semua', icon: ListFilter },
                                { id: 'today', label: 'Hari Ini', icon: Clock },
                                { id: 'upcoming', label: 'Mendatang', icon: Calendar },
                                { id: 'past', label: 'Berlalu', icon: History },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 ring-2 ring-teal-600 ring-offset-2'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {
                            filteredKajian.length === 0 ? (
                                <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 shadow-sm">
                                    <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                                        <Calendar className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Tidak ditemukan jadwal</h2>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Coba ubah kriteria pencarian atau pindah kategori filter.</p>
                                    <Link
                                        href="/admin/batch-input"
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        Input Jadwal Baru
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {filteredKajian.map((kajian, idx) => {
                                        const status = getKajianStatus(kajian.date, kajian.waktu);
                                        return (
                                            <div key={kajian.id} className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group ${status === 'PAST' ? 'opacity-75 grayscale-[0.3]' : ''}`}>

                                                <div className="flex flex-col gap-4 mb-6 border-b border-dashed border-slate-100 pb-4">
                                                    <div className="flex flex-wrap gap-2 items-center">
                                                        {status === 'TODAY' && (
                                                            <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm animate-pulse whitespace-nowrap">
                                                                Hari Ini
                                                            </div>
                                                        )}
                                                        {status === 'TOMORROW' && (
                                                            <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm whitespace-nowrap">
                                                                Besok
                                                            </div>
                                                        )}
                                                        <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-green-100 whitespace-nowrap">
                                                            {kajian.city}
                                                        </div>
                                                        {!kajian.city.toLowerCase().includes('online') &&
                                                            !kajian.masjid.toLowerCase().includes('live streaming') &&
                                                            kajian.distance !== undefined && (
                                                                <div className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-amber-100 flex items-center gap-1 whitespace-nowrap">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {kajian.distance.toFixed(1)} km
                                                                </div>
                                                            )}
                                                        {kajian.khususAkhwat && (
                                                            <div className="px-3 py-1 bg-pink-50 text-pink-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-pink-100 whitespace-nowrap">
                                                                🌸 Akhwat
                                                            </div>
                                                        )}
                                                        {status === 'PAST' && (
                                                            <div className="px-3 py-1 bg-slate-600 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm whitespace-nowrap">
                                                                Selesai
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-[11px] font-bold">
                                                        <div className="flex flex-col sm:flex-row sm:items-center">
                                                            <div className="flex items-center whitespace-nowrap">
                                                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> {kajian.date}
                                                            </div>
                                                            <span className="hidden sm:inline mx-2 text-slate-300">•</span>
                                                            <span className="text-[10px] text-teal-600 font-medium">
                                                                {(() => {
                                                                    const d = parseIndoDate(kajian.date);
                                                                    return d ? getHijriDate(d) : '';
                                                                })()}
                                                            </span>
                                                        </div>
                                                        <div className="w-px h-3 bg-slate-300 hidden sm:block"></div>
                                                        <div className="flex items-center text-slate-400 font-medium whitespace-normal leading-tight">
                                                            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> <span className="max-w-[280px] sm:max-w-none">{kajian.waktu}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-6 mb-6">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                                            {kajian.masjid}
                                                        </h3>
                                                        <div className="flex items-start text-slate-500 group/loc">
                                                            <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0 group-hover/loc:text-blue-500 transition-colors" />
                                                            <p className="text-xs leading-relaxed font-medium">{kajian.address}</p>
                                                        </div>
                                                    </div>
                                                    {kajian.imageUrl ? (
                                                        <div className="shrink-0 group/img relative cursor-pointer" onClick={() => setSelectedImage(kajian.imageUrl || null)}>
                                                            <img
                                                                src={kajian.imageUrl}
                                                                alt={kajian.tema}
                                                                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl border border-slate-100 shadow-sm group-hover/img:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 rounded-2xl transition-colors" />
                                                        </div>
                                                    ) : (
                                                        <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-300 shadow-sm">
                                                            <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">No Flyer</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto pt-6 border-t border-slate-50 space-y-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                                                            <User className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Pemateri</p>
                                                            <p className="text-slate-900 font-extrabold text-lg leading-tight">{kajian.pemateri}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Tema Kajian</p>
                                                        <p className="text-slate-800 text-sm leading-relaxed font-bold">
                                                            {kajian.tema}
                                                        </p>
                                                    </div>

                                                    {kajian.cp && (
                                                        <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100/50 group-hover:border-green-200 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                                                                    <MessageCircle className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] uppercase font-black text-green-500/70 tracking-widest">Kontak Admin</p>
                                                                    <p className="text-slate-700 text-xs font-bold truncate max-w-[200px]">{kajian.cp}</p>
                                                                </div>
                                                            </div>
                                                            {(() => {
                                                                const numbers = kajian.cp.match(/\d+/g);
                                                                if (numbers && numbers[0]) {
                                                                    let num = numbers[0];
                                                                    if (num.startsWith('0')) num = '62' + num.substring(1);
                                                                    return (
                                                                        <a
                                                                            href={`https://wa.me/${num}?text=Assalamu'alaikum, mau tanya terkait kajian di ${kajian.masjid} ustadz ${kajian.pemateri}...`}
                                                                            target="_blank"
                                                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md shadow-green-200 transition-all active:scale-95"
                                                                        >
                                                                            Chat WA
                                                                        </a>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-6">
                                                    {kajian.gmapsUrl && (
                                                        <a
                                                            href={kajian.gmapsUrl}
                                                            target="_blank"
                                                            className="flex items-center justify-center py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-[10px] uppercase tracking-tighter hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm hover:shadow-lg group/btn"
                                                            title="Lihat Lokasi"
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 mr-1" />
                                                            Lokasi
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const text = `*INFO KAJIAN SUNNAH*\n\n🕌 *Masjid:* ${kajian.masjid}\n👤 *Pemateri:* ${kajian.pemateri}\n📚 *Tema:* ${kajian.tema}\n🗓 *Hari/Tgl:* ${kajian.date}\n⏰ *Waktu:* ${kajian.waktu}\n📍 *Lokasi:* ${kajian.gmapsUrl || kajian.address}\n\n_Disebarkan melalui Aplikasi Jadwal Kajian_`;
                                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                        }}
                                                        className="flex items-center justify-center py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-[10px] uppercase tracking-tighter hover:bg-green-600 hover:border-green-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Share2 className="w-3.5 h-3.5 mr-1" />
                                                        Share
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const [day, month, year] = kajian.date.split(' ').slice(-3);
                                                            const title = encodeURIComponent(`Kajian: ${kajian.pemateri} @ ${kajian.masjid}`);
                                                            const details = encodeURIComponent(`Tema: ${kajian.tema}\nLokasi: ${kajian.address}`);
                                                            const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${encodeURIComponent(kajian.address)}&sf=true&output=xml`;
                                                            window.open(gCalUrl, '_blank');
                                                        }}
                                                        className="flex items-center justify-center py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-[10px] uppercase tracking-tighter hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                                        Ingatkan
                                                    </button>
                                                    {kajian.linkInfo && (
                                                        <a
                                                            href={kajian.linkInfo}
                                                            target="_blank"
                                                            className="col-span-3 flex items-center justify-center py-4 bg-purple-600 border-2 border-purple-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md shadow-purple-100"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                            Daftar / Streaming
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Insyaallah Hadir Section */}
                                                <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-100 gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center shrink-0">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insyaallah Hadir</p>
                                                            <p className="font-bold text-slate-900 text-lg">{kajian.attendanceCount || 0} <span className="text-xs font-normal text-slate-500">Jamaah</span></p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async (e) => {
                                                            const btn = e.currentTarget;
                                                            if (btn.disabled) return;

                                                            // Optimistic Update can be tricky here without state management for list
                                                            // Let's just animate and call API, relying on list refresh or just button state
                                                            btn.disabled = true;
                                                            btn.textContent = 'Jazakumullah Khairan';
                                                            btn.classList.add('bg-slate-200', 'text-slate-500', 'border-slate-200');
                                                            btn.classList.remove('bg-white', 'text-teal-600', 'hover:bg-teal-50');

                                                            try {
                                                                await fetch(`/api/kajian/${kajian.id}/attend`, { method: 'POST' });
                                                                // Ideally update state here, but for now simple confirmation is enough for List View
                                                                // or trigger a soft refresh
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="w-full md:w-auto px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Insyaallah Saya Hadir
                                                    </button>
                                                </div>

                                                <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-100 grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => openEditModal(kajian)}
                                                        className="flex items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Jadwal
                                                    </button>
                                                    <button
                                                        onClick={() => deleteIndividual(kajian.id)}
                                                        className="flex items-center justify-center py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Hapus
                                                    </button>
                                                </div>

                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }
                    </main>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="md:col-span-4 space-y-6 hidden md:block sticky top-24 h-fit">
                    {/* Prayer Time Widget */}
                    <PrayerTimeWidget />

                    {/* LIVE / TODAY KAJIAN WIDGET */}
                    {/* LIVE / TODAY KAJIAN WIDGET */}
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <div>
                                <h3 className="font-bold text-xl text-white">Kajian Hari Ini</h3>
                                <p className="text-teal-100 text-xs opacity-80">Jadwal kajian sunnah pilihan</p>
                            </div>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-700"></span>
                            </span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {kajianList
                                .filter(k => getKajianStatus(k.date, k.waktu) === 'TODAY' || getKajianStatus(k.date, k.waktu) === 'TOMORROW')
                                .slice(0, 5) // Show top 5
                                .map(k => (
                                    <Link href={`/kajian/${k.id}`} key={k.id} className="block group">
                                        <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/10 transition-colors">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shrink-0 overflow-hidden relative border border-white/10">
                                                {k.imageUrl ? (
                                                    <img src={k.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-teal-100">
                                                        <User className="w-6 h-6" />
                                                    </div>
                                                )}
                                                {getKajianStatus(k.date, k.waktu) === 'TODAY' && (
                                                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-teal-800 translate-x-0.5 -translate-y-0.5 shadow-sm"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-0.5 truncate flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {k.waktu.split(' ')[0]} • {k.city === 'Online' ? 'ONLINE' : k.city}
                                                </p>
                                                <p className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-teal-200 transition-colors">{k.tema}</p>
                                                <p className="text-[10px] text-teal-100/70 mt-0.5 truncate">{k.pemateri}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            }
                            {kajianList.filter(k => getKajianStatus(k.date, k.waktu) === 'TODAY').length === 0 && (
                                <div className="text-center py-6 text-teal-100/60 text-xs italic bg-white/5 rounded-xl border border-white/5">
                                    Belum ada info kajian untuk hari ini.
                                </div>
                            )}
                            <Link href="/kajian?mode=today" className="block text-center text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-all mt-2">
                                Lihat Semua Jadwal Hari Ini →
                            </Link>
                        </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Menu Utama</h3>
                        <MenuGrid />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {
                isEditModalOpen && editingKajian && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h2 className="text-2xl font-black text-slate-900">Edit Jadwal Kajian</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Masjid / Lokasi</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.masjid}
                                            onChange={e => setEditingKajian({ ...editingKajian, masjid: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kota / Wilayah</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.city}
                                            onChange={e => setEditingKajian({ ...editingKajian, city: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Lengkap</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-sm"
                                        rows={2}
                                        value={editingKajian.address}
                                        onChange={e => setEditingKajian({ ...editingKajian, address: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Pemateri</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.pemateri}
                                            onChange={e => setEditingKajian({ ...editingKajian, pemateri: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Waktu</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.waktu}
                                            onChange={e => setEditingKajian({ ...editingKajian, waktu: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tanggal</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.date}
                                            onChange={e => setEditingKajian({ ...editingKajian, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kontak (CP)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.cp}
                                            onChange={e => setEditingKajian({ ...editingKajian, cp: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tema Kajian</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                        rows={3}
                                        value={editingKajian.tema}
                                        onChange={e => setEditingKajian({ ...editingKajian, tema: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Google Maps</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-xs text-blue-600"
                                            value={editingKajian.gmapsUrl}
                                            onChange={e => setEditingKajian({ ...editingKajian, gmapsUrl: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Pendaftaran / Streaming / Info</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-medium text-xs text-purple-600"
                                            placeholder="https://..."
                                            value={editingKajian.linkInfo || ''}
                                            onChange={e => setEditingKajian({ ...editingKajian, linkInfo: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Poster / Gambar Kajian (URL)</label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-xs truncate"
                                                        placeholder="https://..."
                                                        value={editingKajian.imageUrl || ''}
                                                        onChange={e => setEditingKajian({ ...editingKajian, imageUrl: e.target.value })}
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {editingKajian.imageUrl && (
                                                <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                                                    <img
                                                        src={editingKajian.imageUrl}
                                                        className="w-full h-full object-cover"
                                                        alt="Preview"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <p className="text-white text-xs font-bold">Preview Gambar</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 p-4 bg-pink-50/50 border border-pink-100 rounded-2xl cursor-pointer group hover:bg-pink-50 transition-all">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-pink-200 text-pink-600 focus:ring-pink-500"
                                            checked={editingKajian.khususAkhwat || false}
                                            onChange={e => setEditingKajian({ ...editingKajian, khususAkhwat: e.target.checked })}
                                        />
                                        <span className="text-sm font-black text-pink-700 uppercase tracking-widest">🌸 Khusus Akhwat</span>
                                    </label>
                                </div>

                                <div className="pt-6 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="flex-1 px-6 py-4 border-2 border-slate-100 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Image Modal (Lightbox) */}
            {
                selectedImage && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={selectedImage}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </div >
    );
}

export default function KajianPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Memuat jadwal...</p>
                </div>
            </div>
        }>
            <KajianListContent />
        </Suspense>
    );
}
