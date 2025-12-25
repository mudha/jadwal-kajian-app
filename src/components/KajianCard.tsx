
// Client component imports are top-level
import { useState, useEffect } from 'react';
import { HandHeart, Users } from 'lucide-react';
import Link from 'next/link';
import { parseIndoDate, getHijriDate } from '@/lib/date-utils';

interface KajianCardProps {
    id: number;
    date: string;
    location: string;
    title: string;
    ustadz: string;
    imageUrl?: string;
    attendanceCount?: number;
}

export default function KajianCard({ id, date, location, title, ustadz, imageUrl, attendanceCount = 0 }: KajianCardProps) {
    const [count, setCount] = useState(attendanceCount);
    const [hasAttended, setHasAttended] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const stored = localStorage.getItem(`attended_${id}`);
        if (stored) setHasAttended(true);
    }, [id]);

    const handleAttend = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        if (hasAttended) return;

        // Optimistic update
        setCount(prev => prev + 1);
        setHasAttended(true);
        setIsAnimating(true);
        localStorage.setItem(`attended_${id}`, 'true');

        try {
            await fetch(`/api/kajian/${id}/attend`, { method: 'POST' });
        } catch (error) {
            console.error('Failed to update attendance', error);
            // Revert on error? Nah, keep optimistic for better UX unless critical.
        }

        setTimeout(() => setIsAnimating(false), 1000);
    };

    return (
        <Link href={`/kajian/${id}`} className="group flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 block hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {imageUrl ? (
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            ) : (
                <div className="w-full h-40 bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <span className="text-white/80 font-black text-xs uppercase tracking-widest z-10">Jadwal Kajian</span>
                </div>
            )}
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-teal-600 uppercase bg-teal-50 px-2 py-1 rounded-lg inline-block">{date}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 px-1">
                            {(() => {
                                const parsed = parseIndoDate(date);
                                return parsed ? getHijriDate(parsed) : '';
                            })()}
                        </p>
                    </div>
                </div>

                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 mb-4 font-medium">{ustadz}</p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-[120px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {location}
                    </p>

                    <div
                        role="button"
                        onClick={handleAttend}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer select-none ${hasAttended
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                            }`}
                    >
                        {hasAttended ? 'Tercatat' : 'Insyaallah Saya Hadir'}
                    </div>
                </div>
            </div>
        </Link>
    );
}
