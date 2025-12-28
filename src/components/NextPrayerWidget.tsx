'use client';

import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function NextPrayerWidget() {
    const { nextPrayer, timeLeft, loading } = usePrayerTimes();

    if (loading || !nextPrayer) {
        return null; // Don't show widget while loading
    }

    // Parse timeLeft (format: "HH:MM:SS") to display in Indonesian
    const parts = timeLeft.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    let countdownText = '';
    if (hours > 0) {
        countdownText = `${hours} jam ${minutes} menit lagi`;
    } else if (minutes > 0) {
        countdownText = `${minutes} menit lagi`;
    } else {
        countdownText = 'Kurang dari 1 menit';
    }

    return (
        <div className="md:hidden mb-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Link href="/jadwal-sholat" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                        <Clock className="w-6 h-6 text-white" />
                    </div>

                    {/* Prayer Info */}
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="font-bold text-slate-900 text-base">
                                {nextPrayer.name}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">
                                {nextPrayer.time}
                            </span>
                        </div>
                        <p className="text-xs text-teal-600 font-medium mt-0.5">
                            {countdownText}
                        </p>
                    </div>
                </div>

                {/* Arrow Icon */}
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </Link>
        </div>
    );
}
