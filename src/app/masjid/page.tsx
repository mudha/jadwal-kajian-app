'use client';

import { ArrowLeft, Home, MapPin, Navigation } from 'lucide-react';
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
}

export default function CariMasjidPage() {
    const [masjids, setMasjids] = useState<Masjid[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
                    setMasjids(Array.from(masjidMap.values()));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching mosques:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4  mb-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Cari Masjid</h1>
                            <p className="text-red-100 text-sm font-medium mt-1">Temukan masjid dengan jadwal kajian</p>
                        </div>
                    </div>
                    {masjids.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                            <p className="text-sm font-bold">
                                <Home className="w-4 h-4 inline mr-1.5" />
                                {masjids.length} Masjid Ditemukan
                            </p>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
                {/* Map */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                    <KajianMap items={[]} />
                </div>

                {/* Masjid List */}
                <div>
                    <h2 className="font-bold text-xl text-slate-900 mb-4">Daftar Masjid</h2>
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-slate-500 mt-3">Memuat data masjid...</p>
                        </div>
                    ) : masjids.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-100 text-center">
                            <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Tidak ada data masjid dengan koordinat.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {masjids.map((masjid, index) => (
                                <Link
                                    key={index}
                                    href={`/kajian?search=${encodeURIComponent(masjid.name)}`}
                                    className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-red-200 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                                            <Home className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">
                                                {masjid.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mb-2 line-clamp-2">
                                                <MapPin className="w-3 h-3 inline mr-1" />
                                                {masjid.address}
                                            </p>
                                            <div className="inline-block bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded-lg">
                                                {masjid.kajianCount} Kajian
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
