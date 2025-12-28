
// Client component imports are top-level
import { useState, useEffect } from 'react';
import { HandHeart, Users, Heart, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { parseIndoDate, getHijriDate, getKajianStatus } from '@/lib/date-utils';

interface KajianCardProps {
    id: number;
    date: string;
    location: string;
    title: string;
    ustadz: string;
    imageUrl?: string;
    attendanceCount?: number;
    khususAkhwat?: boolean;
    isOnline?: boolean;
    waktu?: string;
    className?: string;
}

export default function KajianCard({ id, date, location, title, ustadz, imageUrl, attendanceCount = 0, khususAkhwat, isOnline, waktu, className = 'w-60' }: KajianCardProps) {
    const [count, setCount] = useState(attendanceCount);
    const [hasAttended, setHasAttended] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const storedAttend = localStorage.getItem(`attended_${id}`);
        if (storedAttend) setHasAttended(true);

        const storedLike = localStorage.getItem(`liked_${id}`);
        if (storedLike) setIsLiked(true);
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

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isLiked;
        setIsLiked(newState);

        if (newState) {
            localStorage.setItem(`liked_${id}`, 'true');
        } else {
            localStorage.removeItem(`liked_${id}`);
        }
    };

    return (
        <Link href={`/kajian/${id}`} className={`group flex-shrink-0 ${className} bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 block hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative`}>
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img
                    src={imageUrl || '/images/default-kajian.png'}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Like Button */}
                <button
                    onClick={handleLike}
                    className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/20 text-white/70 hover:bg-black/40'}`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
                    {getKajianStatus(date, waktu) === 'PAST' && (
                        <div className="px-2 py-1 bg-slate-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-slate-200/50">
                            ✓ Selesai
                        </div>
                    )}
                    {(khususAkhwat || ustadz.toLowerCase().includes('ustadzah')) && (
                        <div className="px-2 py-1 bg-pink-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-pink-200/50 animate-pulse">
                            🌸 Akhwat
                        </div>
                    )}
                    {isOnline && (
                        <div className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-200/50">
                            🎥 Online
                        </div>
                    )}
                </div>
            </div>
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

                <div className="flex items-start gap-3 pt-4 border-t border-slate-50">
                    <p className="flex-1 min-w-0 text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-1"></span>
                        <span className="leading-tight">{location}</span>
                    </p>

                    <div
                        role="button"
                        onClick={handleAttend}
                        className={`shrink-0 py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-center cursor-pointer select-none flex flex-col items-center justify-center leading-none gap-0.5 ${hasAttended
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                            }`}
                    >
                        {hasAttended ? 'Tercatat' : (
                            <>
                                <span>Insyaallah</span>
                                <span>Hadir</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link >
    );
}
