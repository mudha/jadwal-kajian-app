'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CityData {
    city: string;
    count: number;
}

export default function CityListPage() {
    const router = useRouter();
    const [cities, setCities] = useState<CityData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/cities')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCities(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredCities = cities.filter(c =>
        c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-40 bg-opacity-95 backdrop-blur-sm shadow-md">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">Pilih Kota</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6">
                {/* Search Box */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama kota..."
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {filteredCities.length > 0 ? (
                            filteredCities.map((item) => (
                                <Link
                                    key={item.city}
                                    href={`/kajian?city=${encodeURIComponent(item.city)}`}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <span className="font-bold text-slate-700 capitalize">{item.city}</span>
                                    </div>
                                    <div className="bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm min-w-[24px] text-center">
                                        {item.count}
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10 opacity-60">
                                <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                                <p className="text-slate-500">Kota tidak ditemukan</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
