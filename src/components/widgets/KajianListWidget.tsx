import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import KajianCard from '@/components/KajianCard';
import { formatMasjidName } from '@/lib/date-utils';
import { useSettings } from '@/hooks/useSettings';

interface WidgetProps {
    data?: any;
}

export default function KajianListWidget({ data }: WidgetProps) {
    const rawKajian = data?.featuredKajian || [];
    const sortMode = data?.sortMode || 'date';
    const { settings, updateRadius } = useSettings();

    // Local state for the input to allow "empty" state while typing
    const [internalRadius, setInternalRadius] = useState<string>(String(settings.radius || 10));

    useEffect(() => {
        setInternalRadius(String(settings.radius));
    }, [settings.radius]);

    // Default radius logic: 
    // If we have distance data, we can filter. 
    // If not, we just show everything (or hide slider).
    const hasDistanceData = rawKajian.some((k: any) => typeof k.distance === 'number');

    if (rawKajian.length === 0) return null;

    return (
        <section>
            <div className="flex flex-col gap-3 mb-4 md:mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-lg text-slate-800">
                            {sortMode === 'distance' ? 'Kajian Pilihan Terdekat' : 'Kajian Pilihan'}
                        </h2>
                        <Link href="/kajian" className="p-1.5 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 hover:text-teal-700 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Radius Slider (Only show if we have distance data) */}
                {hasDistanceData && sortMode === 'distance' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm w-fit">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Radius</span>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={settings.radius}
                            onChange={(e) => updateRadius(parseInt(e.target.value))}
                            className="w-24 md:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 hover:accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <div className="flex items-center gap-1 min-w-[3.5rem] justify-end">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={internalRadius}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setInternalRadius(val);

                                    // Update global radius immediately if valid number
                                    const numVal = parseInt(val);
                                    if (!isNaN(numVal) && numVal > 0) {
                                        updateRadius(numVal);
                                    }
                                }}
                                onBlur={() => {
                                    // Reset to actual setting if empty or invalid on blur
                                    const numVal = parseInt(internalRadius);
                                    if (isNaN(numVal) || numVal <= 0) {
                                        setInternalRadius(String(settings.radius));
                                    }
                                }}
                                className="w-10 text-right text-xs font-bold text-teal-600 bg-transparent border-b border-dotted border-teal-300 focus:border-teal-600 focus:outline-none p-0"
                            />
                            <span className="text-xs font-bold text-teal-600">km</span>
                        </div>
                    </div>
                )}
            </div>


            {/* Mobile: Horizontal Scroll */}
            <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4">
                {rawKajian.map((kajian: any) => (
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
                        isCanceled={!!kajian.is_canceled}
                        cancellationReason={kajian.cancellation_reason}
                    />
                ))}
            </div>

            {/* Empty State if filter removes all - though mapped outside, 
                but here the radius is applied AT PARENT level (HomeContent), 
                so rawKajian itself is already filtered by radius! 
            */}

            {/* Desktop: Grid View */}
            <div className="hidden md:grid grid-cols-2 gap-6">
                {rawKajian.map((kajian: any) => (
                    <Link href={`/kajian/${kajian.id}`} key={kajian.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-4 block">
                        <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0 overflow-hidden relative">
                            <img src={kajian.imageUrl || '/images/default-kajian.png'} alt={kajian.tema} className="w-full h-full object-cover" />
                            {/* Canceled Overlay (Desktop) */}
                            {kajian.is_canceled && (
                                <div className="absolute inset-0 bg-red-600/80 backdrop-blur-sm flex items-center justify-center z-10">
                                    <div className="text-center px-1">
                                        <p className="text-white font-black text-xs mb-0.5 drop-shadow-md">LIBUR</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">{kajian.date.replace(/Minggu/i, 'Ahad')}</p>
                                {kajian.waktu && (
                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {kajian.waktu}
                                    </span>
                                )}
                            </div>
                            <h3 className={`font-bold text-slate-900 line-clamp-2 mb-1 ${kajian.is_canceled ? 'line-through decoration-red-500 decoration-2 text-slate-400' : ''}`}>
                                {kajian.tema}
                            </h3>
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
        </section >
    );
}
