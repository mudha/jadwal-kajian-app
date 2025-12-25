'use client';

import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ArrowLeft, Calendar, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import Sidebar from '@/components/Sidebar';

export default function JadwalSholatPage() {
    const { timings, locationName, loading, error } = usePrayerTimes();
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

    const schedule = timings ? [
        { name: 'Imsak', time: timings.Imsak },
        { name: 'Subuh', time: timings.Fajr },
        { name: 'Terbit', time: timings.Sunrise },
        { name: 'Dhuha', time: timings.Dhuha || '06:30' },
        { name: 'Dzuhur', time: timings.Dhuhr },
        { name: 'Ashar', time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: 'Isya', time: timings.Isha },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-teal-600 text-white px-4 py-4 sticky top-0 z-40">
                <div className="flex items-center gap-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold">Jadwal Sholat</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="md:grid md:grid-cols-12 md:gap-8">
                    {/* Main Content */}
                    <main className="md:col-span-8">
                        {/* Location Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 text-center">
                            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                {loading ? <Loader2 className="w-6 h-6 text-teal-600 animate-spin" /> : <MapPin className="w-6 h-6 text-teal-600" />}
                            </div>
                            <h2 className="font-bold text-slate-800 text-lg mb-1">{locationName}</h2>
                            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{dateString}</span>
                            </div>
                            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                        </div>

                        {/* Schedule List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                    <p>Memuat jadwal...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {schedule.map((item, idx) => (
                                        <div
                                            key={item.name}
                                            className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${item.name === 'Maghrib' || item.name === 'Subuh' ? 'bg-teal-50/50' : ''}`}
                                        >
                                            <span className="font-medium text-slate-700">{item.name}</span>
                                            <span className="font-bold text-teal-600 font-mono text-lg">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-6">
                            * Waktu sholat berdasarkan lokasi perangkat Anda (Kemenag RI).
                        </p>
                    </main>

                    {/* Sidebar (Desktop) */}
                    <div className="hidden md:block md:col-span-4 mt-6 md:mt-0">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
        </div >
    );
}
