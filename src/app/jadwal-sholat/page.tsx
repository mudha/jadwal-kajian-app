'use client';

import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { ArrowLeft, Calendar, MapPin, Loader2, Sunrise, Sun, Sunset, Moon, CloudSun, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MiniPrayerTimeWidget from '@/components/MiniPrayerTimeWidget';
import LeftSidebar from '@/components/LeftSidebar';

export default function JadwalSholatPage() {
    const { timings, locationName, loading, error, nextPrayer } = usePrayerTimes();
    const [dateString, setDateString] = useState('');

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }, []);

    const schedule = timings ? [
        { name: 'Subuh', time: timings.Fajr, icon: Sunrise, desc: 'Fajar Shadiq' },
        { name: 'Terbit', time: timings.Sunrise, icon: Sun, desc: 'Awal Dhuha' },
        { name: 'Dhuha', time: timings.Dhuha || '06:30', icon: CloudSun, desc: 'Dua Tombak' },
        { name: 'Dzuhur', time: timings.Dhuhr, icon: Sun, desc: 'Tengah Hari' },
        { name: 'Ashar', time: timings.Asr, icon: CloudSun, desc: 'Bayangan' },
        { name: 'Maghrib', time: timings.Maghrib, icon: Sunset, desc: 'Terbenam' },
        { name: 'Isya', time: timings.Isha, icon: Moon, desc: 'Malam' },
    ] : [];

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-lg font-bold tracking-tight">Jadwal Sholat</h1>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:grid md:grid-cols-12 md:gap-8">
                    {/* Left Column (Desktop Sidebar) */}
                    <aside className="md:col-span-4 space-y-6 hidden md:block order-1">
                        <LeftSidebar />
                    </aside>

                    {/* Main Content (Right on Desktop) */}
                    <main className="md:col-span-8 space-y-6 order-2">

                        {/* Location & Info Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500" />

                            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-teal-100">
                                {loading ? <Loader2 className="w-8 h-8 text-teal-600 animate-spin" /> : <MapPin className="w-8 h-8 text-teal-600" />}
                            </div>

                            <h2 className="font-black text-slate-800 text-2xl mb-2 tracking-tight">{locationName}</h2>

                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-600">{dateString}</span>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <span>⚠️ {error}</span>
                                </div>
                            )}
                        </div>

                        {/* List Jadwal */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-teal-600" />
                                    Waktu Sholat
                                </h3>
                                <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg font-semibold border border-teal-100">
                                    Hari Ini
                                </span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-teal-500" />
                                    <p className="font-medium">Sedang memuat data...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {schedule.map((item) => {
                                        const isNext = nextPrayer?.name === item.name;
                                        const Icon = item.icon;

                                        return (
                                            <div
                                                key={item.name}
                                                className={`group flex items-center justify-between px-6 py-5 transition-all duration-200
                                                    ${isNext ? 'bg-teal-50/80 border-l-4 border-teal-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                                                        ${isNext ? 'bg-teal-200 text-teal-800 shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600'}
                                                    `}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-base ${isNext ? 'text-teal-900' : 'text-slate-700'}`}>{item.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-mono text-xl font-bold tracking-wide ${isNext ? 'text-teal-700' : 'text-slate-600 group-hover:text-teal-600'}`}>
                                                        {item.time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-8">
                            Sumber: Kemenag RI (via Aladhan API) • Metode Wujudul Hilal
                        </p>
                    </main>

                </div>
            </div>
        </div>
    );
}
