'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const KajianMap = dynamic(() => import('@/components/KajianMap'), {
    ssr: false,
    loading: () => <div className="h-[calc(100vh-200px)] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center text-slate-400 font-bold">Harap tunggu, peta sedang dimuat...</div>
});

interface KajianWithId {
    id: number;
    masjid: string;
    city: string;
    date: string;
    waktu?: string;
    tema: string;
    pemateri: string;
    imageUrl?: string;
    lat?: number;
    lng?: number;
    gmapsUrl?: string;
}

export default function AdminMapPage() {
    const [kajianList, setKajianList] = useState<KajianWithId[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kajian')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setKajianList(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching kajian:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Peta Sebaran Kajian</h1>
                        <p className="text-slate-500 text-sm">Lihat lokasi semua kajian di peta</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{kajianList.length}</p>
                                <p className="text-xs text-slate-500 font-medium">Total Kajian</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {kajianList.filter(k => k.lat && k.lng).length}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">Dengan Koordinat</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">
                                    {new Set(kajianList.map(k => k.city)).size}
                                </p>
                                <p className="text-xs text-slate-500 font-medium">Kota</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    {loading ? (
                        <div className="h-[calc(100vh-300px)] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
                            <p className="text-slate-400 font-bold">Memuat data...</p>
                        </div>
                    ) : (
                        <KajianMap items={kajianList} />
                    )}
                </div>
            </div>
        </div>
    );
}
