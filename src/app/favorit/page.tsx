'use client';
import { useState, useEffect } from 'react';
import { Heart, ArrowLeft, Ban } from 'lucide-react';
import Link from 'next/link';
import KajianCard from '@/components/KajianCard';
import BottomNav from '@/components/BottomNav';
import { parseIndoDate, formatMasjidName } from '@/lib/date-utils';

interface Kajian {
    id: number;
    masjid: string;
    city: string;
    date: string;
    waktu?: string;
    tema: string;
    pemateri: string;
    imageUrl?: string;
    attendanceCount?: number;
}

export default function FavoritPage() {
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorit = async () => {
            try {
                // 1. Get IDs from localStorage
                const likedIds = Object.keys(localStorage)
                    .filter(key => key.startsWith('liked_'))
                    .map(key => parseInt(key.replace('liked_', '')))
                    .filter(id => !isNaN(id));

                if (likedIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch data
                const response = await fetch('/api/kajian/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: likedIds }),
                });

                if (response.ok) {
                    const data = await response.json();

                    // 3. Sort by Date (Newest first maybe? Or upcoming?)
                    // For favorites, usually recently added or upcoming.
                    // Let's sort by Upcoming first.
                    const sorted = data.sort((a: any, b: any) => {
                        const dateA = parseIndoDate(a.date) || new Date(0);
                        const dateB = parseIndoDate(b.date) || new Date(0);
                        return dateA.getTime() - dateB.getTime();
                    });

                    setKajianList(sorted);
                }
            } catch (error) {
                console.error('Failed to load favorit', error);
            } finally {
                setLoading(false);
            }
        };

        loadFavorit();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <h1 className="font-bold text-lg text-slate-800">Favorit Saya</h1>
            </div>

            <div className="p-4 md:p-6 max-w-5xl mx-auto">

                {loading ? (
                    <div className="text-center py-12 text-slate-400">
                        Memuat favorit...
                    </div>
                ) : kajianList.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 text-pink-300">
                            <Heart className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Belum Ada Favorit</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                            Simpan kajian yang menarik hati Anda dengan menekan tombol hati.
                        </p>
                        <Link href="/kajian" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors">
                            Jelajahi Kajian
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {kajianList.map(item => (
                            <KajianCard
                                key={item.id}
                                id={item.id}
                                date={item.date}
                                location={`${formatMasjidName(item.masjid)} • ${item.city}`}
                                title={item.tema}
                                ustadz={item.pemateri}
                                imageUrl={item.imageUrl}
                                attendanceCount={item.attendanceCount}
                                className="w-full"
                            />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
