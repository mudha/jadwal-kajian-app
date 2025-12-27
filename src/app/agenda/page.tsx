'use client';
import { useState, useEffect } from 'react';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import KajianCard from '@/components/KajianCard';
import BottomNav from '@/components/BottomNav';
import { getKajianStatus, parseIndoDate, formatMasjidName } from '@/lib/date-utils';

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

export default function AgendaPage() {
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAgenda = async () => {
            try {
                // 1. Get IDs from localStorage
                const attendedIds = Object.keys(localStorage)
                    .filter(key => key.startsWith('attended_'))
                    .map(key => parseInt(key.replace('attended_', '')))
                    .filter(id => !isNaN(id));

                if (attendedIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Fetch data
                const response = await fetch('/api/kajian/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: attendedIds }),
                });

                if (response.ok) {
                    const data = await response.json();

                    // 3. Sort by Date
                    // Sort logic: Upcoming first (nearest date), then Past events descending
                    const now = new Date();
                    const sorted = data.sort((a: any, b: any) => {
                        const dateA = parseIndoDate(a.date) || new Date(0);
                        const dateB = parseIndoDate(b.date) || new Date(0);
                        return dateA.getTime() - dateB.getTime();
                    });

                    setKajianList(sorted);
                }
            } catch (error) {
                console.error('Failed to load agenda', error);
            } finally {
                setLoading(false);
            }
        };

        loadAgenda();
    }, []);

    const upcoming = kajianList.filter(k => {
        const status = getKajianStatus(k.date, k.waktu);
        return status !== 'PAST';
    });

    const past = kajianList.filter(k => {
        const status = getKajianStatus(k.date, k.waktu);
        return status === 'PAST';
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <h1 className="font-bold text-lg text-slate-800">Jadwal Saya</h1>
            </div>

            <div className="p-4 md:p-6 max-w-5xl mx-auto">

                {loading ? (
                    <div className="text-center py-12 text-slate-400">
                        Memuat jadwal...
                    </div>
                ) : kajianList.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Belum Ada Jadwal</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-6">
                            Anda belum menandai kehadiran di kajian manapun. Yuk cari kajian menarik!
                        </p>
                        <Link href="/kajian" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors">
                            Cari Kajian
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* Upcoming Section */}
                        {upcoming.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                                    <h2 className="font-bold text-slate-800">Akan Datang ({upcoming.length})</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {upcoming.map(item => (
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
                            </section>
                        )}

                        {/* Past Section */}
                        {past.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4 mt-8 opacity-70">
                                    <div className="w-1 h-6 bg-slate-300 rounded-full"></div>
                                    <h2 className="font-bold text-slate-500">Riwayat ({past.length})</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                                    {past.map(item => (
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
                            </section>
                        )}

                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
