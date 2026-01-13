'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

export default function HeroWidget({ data }: { data?: any }) {
    const todayCount = data?.stats?.todayCount || 0;

    return (
        <div className="bg-teal-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-teal-900/10">
            <div className="relative z-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 leading-tight">Selamat Datang di PortalKajian.online</h1>

                {todayCount > 0 && (
                    <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-4 md:py-1.5 mb-4 border border-white/30 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full mr-2 animate-pulse shrink-0"></span>
                        <span className="text-xs md:text-sm font-medium">{todayCount} Kajian Berlangsung Hari Ini</span>
                    </div>
                )}

                <p className="text-teal-100 text-sm md:text-base max-w-lg mb-6 leading-relaxed">Temukan informasi kajian sunnah terdekat, artikel islami, dan fitur ibadah lainnya.</p>
                <Link href="/kajian" className="block text-center md:inline-block bg-white text-teal-600 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors shadow-sm">
                    Cari Kajian Sekarang
                </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Search className="w-48 h-48 md:w-64 md:h-64 -mb-8 -mr-8 md:-mb-12 md:-mr-12" />
            </div>
        </div>
    );
}
