import { Clock, MapPin, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useState, useEffect } from 'react';
import { getHijriDate, formatIndoDate } from '@/lib/date-utils';

export default function PrayerTimeWidget() {
    const { nextPrayer, timeLeft, locationName, loading, error } = usePrayerTimes();
    const [currentTime, setCurrentTime] = useState('');
    const [hijriDate, setHijriDate] = useState('');

    useEffect(() => {
        setHijriDate(getHijriDate(new Date()));
        // Update current time every second for the clock
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Safe default values
    const displayName = nextPrayer ? nextPrayer.name : 'Memuat...';
    const displayTime = nextPrayer ? nextPrayer.time : '--:--';

    return (
        <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 text-white overflow-hidden shadow-lg shadow-teal-100">
            {/* Decorative Pattern */}
            <div className="absolute top-0 right-0 opacity-10">
                <svg width="120" height="120" viewBox="0 0 120 120" className="fill-white">
                    <path d="M60 0 L60 30 M60 90 L60 120 M0 60 L30 60 M90 60 L120 60 M25 25 L35 35 M85 25 L75 35 M25 95 L35 85 L85 95 L75 85" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-white/80 text-xs font-medium mb-1 font-mono tracking-wider">{currentTime || '--:--'}</p>
                        <h2 className="text-2xl font-bold tracking-tight">Waktu Sholat</h2>
                        <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">{hijriDate}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-white/80 text-[10px] font-medium mb-1">
                            <MapPin className="w-3 h-3" />
                            <span>Lokasi Anda</span>
                        </div>
                        <p className="text-xs font-bold truncate max-w-[120px]">{locationName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="bg-white/30 p-3 rounded-xl shrink-0">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-[10px] font-medium uppercase tracking-widest mb-0.5 truncate">Selanjutnya</p>
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-1 overflow-hidden">
                            <p className="text-sm sm:text-lg font-bold leading-none truncate">{displayName}</p>
                            <p className="text-xs sm:text-lg font-light opacity-80 leading-tight sm:leading-none">{displayTime}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0 border-l border-white/10 pl-2 sm:pl-4">
                        <p className="text-white/60 text-[8px] font-medium mb-0.5 uppercase tracking-tighter">Adzan</p>
                        <p className="text-base sm:text-xl font-black font-mono tracking-tight whitespace-nowrap">{timeLeft}</p>
                    </div>
                </div>

                {error && (
                    <p className="text-[10px] text-red-200 mt-2 text-center bg-red-900/20 py-1 rounded-lg">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
