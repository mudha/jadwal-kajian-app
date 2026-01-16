'use client';

import { ArrowLeft, Home, MapPin, Navigation, Filter } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const KajianMap = dynamic(() => import('@/components/KajianMap'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Memuat peta...</div>
});

interface Masjid {
    name: string;
    address: string;
    lat: number;
    lng: number;
    kajianCount: number;
    distance?: number; // Distance in km
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function CariMasjidPage() {
    const [allMasjids, setAllMasjids] = useState<Masjid[]>([]);
    const [filteredMasjids, setFilteredMasjids] = useState<Masjid[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5); // Default 5km

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }

        // Fetch mosques from kajian data
        fetch('/api/kajian')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Group by masjid name and count kajian
                    const masjidMap = new Map<string, Masjid>();
                    data.forEach((kajian: any) => {
                        if (kajian.lat && kajian.lng) {
                            const existing = masjidMap.get(kajian.masjid);
                            if (existing) {
                                existing.kajianCount++;
                            } else {
                                masjidMap.set(kajian.masjid, {
                                    name: kajian.masjid,
                                    address: kajian.address || '',
                                    lat: parseFloat(kajian.lat),
                                    lng: parseFloat(kajian.lng),
                                    kajianCount: 1
                                });
                            }
                        }
                    });
                    setAllMasjids(Array.from(masjidMap.values()));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching mosques:', err);
                setLoading(false);
            });
    }, []);

    // Filter and sort when location or radius changes
    useEffect(() => {
        if (!userLocation) {
            setFilteredMasjids(allMasjids);
            return;
        }

        const masjidsWithDistance = allMasjids.map(m => ({
            ...m,
            distance: calculateDistance(userLocation.lat, userLocation.lng, m.lat, m.lng)
        }))
            .filter(m => m.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

        setFilteredMasjids(masjidsWithDistance);
    }, [allMasjids, userLocation, radius]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Cari Masjid</h1>
                            <p className="text-emerald-100 text-sm font-medium mt-1">Temukan masjid terdekat untuk kajian</p>
                        </div>
                    </div>
                    {filteredMasjids.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                            <p className="text-sm font-bold">
                                <Home className="w-4 h-4 inline mr-1.5" />
                                {filteredMasjids.length} Masjid Terdekat
                            </p>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Radius Filter */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="w-4 h-4 text-emerald-600" />
                        <label className="text-sm font-bold text-slate-700">Jarak Maksimal</label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[0.5, 1, 2, 5, 10].map(r => (
                            <button
                                key={r}
                                onClick={() => setRadius(r)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${radius === r
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {r < 1 ? `${r * 1000}m` : `${r}km`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Map */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <KajianMap items={filteredMasjids.map(m => ({
                        id: 0,
                        masjid: m.name,
                        address: m.address,
                        lat: m.lat,
                        lng: m.lng,
                        city: '',
                        region: '',
                        gmapsUrl: '', // Add missing property
                        date: '',
                        tema: '',
                        pemateri: '',
                        waktu: '',
                        cp: ''
                    }))} />
                </div>

                {/* Masjid List */}
                <div>
                    <h2 className="font-bold text-xl text-slate-900 mb-4">Daftar Masjid Terdekat</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-slate-500 mt-3">Memuat data masjid...</p>
                        </div>
                    ) : filteredMasjids.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
                            <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium mb-2">Tidak ada masjid dalam radius {radius}km</p>
                            <p className="text-slate-400 text-sm">Coba perbesar radius pencarian</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredMasjids.map((masjid, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                                            <Home className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1 gap-2">
                                                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                                                    {masjid.name}
                                                </h3>
                                                {masjid.distance !== undefined && (
                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                                                        {masjid.distance < 1
                                                            ? `${Math.round(masjid.distance * 1000)}m`
                                                            : `${masjid.distance.toFixed(1)}km`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                {masjid.address}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/kajian?search=${encodeURIComponent(masjid.name)}`}
                                                    className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                                                >
                                                    {masjid.kajianCount} Kajian
                                                </Link>
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lng}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Navigation className="w-3.5 h-3.5" />
                                                    Petunjuk Arah
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
