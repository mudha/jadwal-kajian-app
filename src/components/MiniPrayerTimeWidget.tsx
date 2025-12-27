'use client';

import { Clock, MapPin, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useState, useEffect } from 'react';

export default function MiniPrayerTimeWidget() {
    const { nextPrayer, timeLeft, locationName, loading, error } = usePrayerTimes();
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-center h-24">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            </div>
        );
    }

    const prayerList = [
        { key: 'Fajr', label: 'Subuh' },
        { key: 'Dhuhr', label: 'Dzuhur' },
        { key: 'Asr', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isha', label: 'Isya' },
    ];

    // Don't return null on error, we want to show the container at least
    // or use the fallback data from the hook

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 overflow-hidden relative group hover:border-teal-200 transition-all">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 truncate block leading-none">{locationName || 'Lokasi'}</span>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Waktu Sholat</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-teal-600 tabular-nums">{currentTime}</span>
                    </div>
                </div>

                {error && !timings && (
                    <div className="mb-3 p-2 bg-amber-50 rounded-xl border border-amber-100 text-[8px] text-amber-700 font-bold text-center leading-tight">
                        Geolocation tidak aktif. Menampilkan waktu default Jakarta.
                    </div>
                )}

                <div className="bg-teal-600 rounded-xl p-3 text-white mb-3 shadow-md shadow-teal-100 flex items-center justify-between">
                    <div>
                        <p className="text-teal-100/70 text-[7px] font-black uppercase tracking-widest mb-0.5">Berikutnya</p>
                        <h4 className="font-black text-sm tracking-tight leading-none">{nextPrayer?.name || '--'}</h4>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <p className="text-teal-100/70 text-[7px] font-black uppercase tracking-tighter mb-0.5">Adzan Dalam</p>
                        <p className="font-mono font-black text-sm tabular-nums tracking-tighter">{timeLeft || '--:--'}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-1">
                    {prayerList.map((p) => {
                        const isNext = nextPrayer?.name === p.label;
                        const time = timings ? timings[p.key] : '--:--';
                        return (
                            <div key={p.key} className={`flex flex-col items-center flex-1 min-w-0 py-1.5 rounded-lg transition-colors ${isNext ? 'bg-teal-50 border border-teal-100' : ''}`}>
                                <span className={`text-[7px] font-black uppercase tracking-tighter mb-0.5 ${isNext ? 'text-teal-700' : 'text-slate-400'}`}>{p.label}</span>
                                <span className={`text-[9px] font-mono font-bold ${isNext ? 'text-teal-600' : 'text-slate-600'}`}>{time}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
