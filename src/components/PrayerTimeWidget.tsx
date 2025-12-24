'use client';
import { Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PrayerTime {
    name: string;
    time: string;
}

export default function PrayerTimeWidget() {
    const [nextPrayer, setNextPrayer] = useState<PrayerTime>({ name: 'Maghrib', time: '18:15' });
    const [timeLeft, setTimeLeft] = useState('2:45:30');
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        // Update current time every second
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-6 text-white overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute top-0 right-0 opacity-10">
                <svg width="120" height="120" viewBox="0 0 120 120" className="fill-white">
                    <path d="M60 0 L60 30 M60 90 L60 120 M0 60 L30 60 M90 60 L120 60 M25 25 L35 35 M85 25 L75 35 M25 95 L35 85 M85 95 L75 85" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-white/80 text-xs font-medium mb-1">{currentTime}</p>
                        <p className="text-2xl font-bold">Tengah Malam</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/80 text-xs font-medium mb-1">Kota Tangerang Selatan</p>
                        <p className="text-xs font-bold">-6.29°N, 106.71°E</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl p-4 mt-4">
                    <div className="bg-white/30 p-3 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white/80 text-xs font-medium">Waktu Sholat Selanjutnya</p>
                        <p className="text-xl font-bold">{nextPrayer.name} - {nextPrayer.time}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{timeLeft}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
