'use client';

import Link from 'next/link';
import { User, Clock } from 'lucide-react';

interface WidgetProps {
    data?: any;
}

export default function LatestKajianWidget({ data }: WidgetProps) {
    const latestKajian = data?.latestKajian || [];

    return (
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                    <h3 className="font-bold text-xl text-white">Info Kajian Terbaru</h3>
                    <p className="text-teal-100 text-xs opacity-80">Baru saja diupdate admin</p>
                </div>
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-700"></span>
                </span>
            </div>

            <div className="space-y-4 relative z-10">
                {latestKajian.map((k: any) => (
                    <Link href={`/kajian/${k.id}`} key={k.id} className="block group">
                        <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="w-12 h-16 bg-white/20 backdrop-blur-sm rounded-lg shrink-0 overflow-hidden relative border border-white/10">
                                {k.imageUrl ? (
                                    <img src={k.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-teal-100">
                                        <User className="w-6 h-6" />
                                    </div>
                                )}
                                <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-br-lg">NEW</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-0.5 flex flex-wrap items-center gap-1 leading-tight">
                                    {k.city === 'Online' ? 'ONLINE' : k.city}
                                </p>
                                <p className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-teal-200 transition-colors mb-0.5">{k.tema}</p>
                                <p className="text-[9px] text-teal-100/70 truncate mb-1">Oleh: {k.pemateri}</p>
                                <p className="text-[9px] text-white/50 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> {k.date.replace(/Minggu/i, 'Ahad')}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))
                }
                {latestKajian.length === 0 && (
                    <div className="text-center py-6 text-teal-100/60 text-xs italic bg-white/5 rounded-xl border border-white/5">
                        Belum ada data terbaru.
                    </div>
                )}
            </div>
        </div>
    );
}
