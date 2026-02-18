'use client';

import { useEffect, useState } from 'react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { isRamadhan } from '@/lib/date-utils';

export default function ImsakiyahCountdown() {
    const { timings, locationName, loading } = usePrayerTimes();
    const [now, setNow] = useState(new Date());
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(isRamadhan());
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!visible || loading || !timings) return null;

    // Parse time string "HH:MM" into today's Date
    function parseTime(timeStr: string): Date {
        const [h, m] = timeStr.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    }

    // Format countdown
    function formatCountdown(target: Date): string {
        const diff = target.getTime() - now.getTime();
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    const imsak = timings['Imsak'] ? parseTime(timings['Imsak']) : null;
    const fajr = timings['Fajr'] ? parseTime(timings['Fajr']) : null;
    const maghrib = timings['Maghrib'] ? parseTime(timings['Maghrib']) : null;

    // Determine current state: before imsak, before maghrib (fasting), or after maghrib (buka)
    const isPuasa = maghrib && now < maghrib;
    const isSahurTime = imsak && now < imsak;

    const targetTime = isPuasa ? maghrib : null;
    const countdown = targetTime ? formatCountdown(targetTime) : null;

    const imsakStr = timings['Imsak'] || '--:--';
    const subuhStr = timings['Fajr'] || '--:--';
    const maghribStr = timings['Maghrib'] || '--:--';
    const isyaStr = timings['Isha'] || '--:--';

    return (
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-md">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950" />

            {/* Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white opacity-40 animate-pulse"
                        style={{
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 3 + 's',
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                            🌙 Imsakiyah Ramadhan 1447 H
                        </h3>
                        <p className="text-indigo-300 text-[10px] font-medium mt-0.5">
                            📍 {locationName || 'Lokasi Anda'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-indigo-300 text-[9px] font-bold uppercase tracking-widest">
                            {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Countdown */}
                {countdown && (
                    <div className={`rounded-xl p-4 mb-4 text-center ${isPuasa ? 'bg-amber-500/20 border border-amber-400/30' : 'bg-emerald-500/20 border border-emerald-400/30'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPuasa ? 'text-amber-300' : 'text-emerald-300'}`}>
                            {isSahurTime ? '⏰ Sahur Berakhir Dalam' : isPuasa ? '🌅 Buka Puasa Dalam' : '🌙 Imsak Dalam'}
                        </p>
                        <p className={`font-mono font-black text-3xl tabular-nums tracking-tighter ${isPuasa ? 'text-amber-300' : 'text-emerald-300'}`}>
                            {countdown}
                        </p>
                        <p className={`text-[10px] font-bold mt-1 ${isPuasa ? 'text-amber-200/70' : 'text-emerald-200/70'}`}>
                            {isPuasa ? `Maghrib pukul ${maghribStr}` : ''}
                        </p>
                    </div>
                )}

                {/* Schedule grid */}
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Imsak', time: imsakStr, icon: '🌒', highlight: isSahurTime },
                        { label: 'Subuh', time: subuhStr, icon: '🌄', highlight: false },
                        { label: 'Maghrib', time: maghribStr, icon: '🌅', highlight: isPuasa },
                        { label: 'Isya', time: isyaStr, icon: '🌙', highlight: false },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`flex flex-col items-center rounded-xl py-2.5 px-1 transition-all ${item.highlight
                                ? 'bg-yellow-400/20 border border-yellow-400/40'
                                : 'bg-white/5 border border-white/10'
                                }`}
                        >
                            <span className="text-base mb-1">{item.icon}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${item.highlight ? 'text-yellow-300' : 'text-indigo-300'}`}>
                                {item.label}
                            </span>
                            <span className={`font-mono font-black text-xs tabular-nums ${item.highlight ? 'text-yellow-200' : 'text-white'}`}>
                                {item.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
