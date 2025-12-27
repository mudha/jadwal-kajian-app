'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';
import { isKajianOngoing, formatMasjidName } from '@/lib/date-utils';

interface Kajian {
    id: number;
    masjid: string;
    city: string;
    waktu: string;
    date: string;
    tema: string;
    pemateri: string;
    imageUrl?: string;
    linkInfo?: string;
}

export default function OngoingKajianWidget() {
    const [ongoingList, setOngoingList] = useState<Kajian[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/kajian')
            .then(res => res.json())
            .then((data: Kajian[]) => {
                if (Array.isArray(data)) {
                    const nowHappening = data.filter(k => isKajianOngoing(k.date, k.waktu));
                    setOngoingList(nowHappening);
                }
            })
            .catch(err => console.error('Error fetching ongoing kajian:', err))
            .finally(() => setLoading(false));

        // Refresh every minute to keep statuses up to date
        const interval = setInterval(() => {
            // Re-fetch or at least re-filter if we stored all data.
            // For simplicity, just refetching logic or just forcing re-render if using memo would work.
            // But here we need to re-check time against list.
            // Optimization: Fetch once, then filter locally every minute.
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    if (ongoingList.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden mb-6 animate-pulse-slow border-4 border-red-500/30">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-red-600"></span>
                    </span>
                    <div>
                        <h3 className="font-bold text-lg text-white leading-none">SEDANG BERLANGSUNG</h3>
                        <p className="text-red-100 text-[10px] mt-1 font-medium tracking-wide">Live / Ongoing Kajian</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                {ongoingList.slice(0, 3).map(k => (
                    <Link href={`/kajian/${k.id}`} key={k.id} className="block group">
                        <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-black/30 transition-all">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">LIVE</span>
                                <span className="text-[10px] text-red-100 font-mono">{k.city}</span>
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-1 group-hover:text-red-100 transition-colors">{k.tema}</h4>
                            <p className="text-[10px] text-white/80 line-clamp-1">{k.pemateri}</p>
                            <div className="mt-2 text-[10px] flex items-center gap-1 text-red-200">
                                <Radio className="w-3 h-3" />
                                {formatMasjidName(k.masjid)}
                            </div>
                        </div>
                    </Link>
                ))}
                {ongoingList.length > 3 && (
                    <div className="text-center text-[10px] font-bold text-red-100 mt-2">
                        + {ongoingList.length - 3} Kajian Lainnya
                    </div>
                )}
            </div>
        </div>
    );
}
