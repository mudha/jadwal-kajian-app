'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import KajianCard from '@/components/KajianCard';
import { formatMasjidName } from '@/lib/date-utils';

interface WidgetProps {
    data?: any;
}

export default function KajianListWidget({ data }: WidgetProps) {
    const rawKajian = data?.featuredKajian || [];
    const sortMode = data?.sortMode || 'date';

    // Default radius logic: 
    // If we have distance data, we can filter. 
    // If not, we just show everything (or hide slider).
    const hasDistanceData = rawKajian.some((k: any) => typeof k.distance === 'number');

    // Default max distance can be 20km initially
    const [maxDistance, setMaxDistance] = useState(20);
    const [filteredKajian, setFilteredKajian] = useState(rawKajian);

    useEffect(() => {
        if (hasDistanceData) {
            setFilteredKajian(rawKajian.filter((k: any) => {
                if (typeof k.distance !== 'number') return true; // Keep items without distance? Or hide? Let's keep.
                return k.distance <= maxDistance;
            }));
        } else {
            setFilteredKajian(rawKajian);
        }
    }, [maxDistance, rawKajian, hasDistanceData]);

    if (rawKajian.length === 0) return null;

    return (
        <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2 md:gap-0">
                <div className="flex flex-col gap-2 flex-1">
                    <h2 className="font-bold text-lg text-slate-800 whitespace-nowrap">
                        {sortMode === 'distance' ? 'Kajian Pilihan Terdekat' : 'Kajian Pilihan'}
                    </h2>

                    {/* Radius Slider (Only show if we have distance data) */}
                    {hasDistanceData && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Radius</span>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                                className="w-32 md:w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                            <span className="text-xs font-bold text-teal-600 min-w-[3rem] text-right whitespace-nowrap">{maxDistance} km</span>
                        </div>
                    )}
                </div>

                <Link href="/kajian" className="text-sm text-teal-600 font-medium hover:text-teal-700 whitespace-nowrap self-end md:self-auto">Lihat Semua</Link>
            </div>

            {/* Mobile: Horizontal Scroll */}
            <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4">
                {filteredKajian.map((kajian: any) => (
                    <KajianCard
                        key={kajian.id}
                        id={kajian.id}
                        date={`${kajian.date}`}
                        location={kajian.distance && kajian.distance < 1000
                            ? `${formatMasjidName(kajian.masjid)} • ${kajian.distance.toFixed(1)} km`
                            : `${formatMasjidName(kajian.masjid)} • ${kajian.city}`}
                        title={kajian.tema}
                        ustadz={kajian.pemateri}
                        imageUrl={kajian.imageUrl}
                        attendanceCount={kajian.attendanceCount}
                        waktu={kajian.waktu}
                    />
                ))}
            </div>

            {/* Empty State if filter removes all */}
            {filteredKajian.length === 0 && (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">Tidak ada kajian dalam radius {maxDistance} km.</p>
                </div>
            )}

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-2 gap-6">
                {filteredKajian.map((kajian: any) => (
                    <Link href={`/kajian/${kajian.id}`} key={kajian.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-4 block">
                        <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0 overflow-hidden">
                            <img src={kajian.imageUrl || '/images/default-kajian.png'} alt={kajian.tema} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">{kajian.date}</p>
                                {kajian.waktu && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {kajian.waktu}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-2 mb-1">{kajian.tema}</h3>
                            <p className="text-xs text-slate-500 mb-2">{kajian.pemateri}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                {formatMasjidName(kajian.masjid)}, {kajian.city}
                                {kajian.distance && kajian.distance < 1000 && (
                                    <span className="flex items-center gap-0.5 text-teal-600 font-bold ml-1 bg-teal-50 px-1.5 py-0.5 rounded-md">
                                        <MapPin className="w-2.5 h-2.5" /> {kajian.distance.toFixed(1)} km
                                    </span>
                                )}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
