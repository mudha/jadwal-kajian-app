'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

export default function HeroWidget() {
    return (
        <div className="hidden md:block bg-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-4">Selamat Datang di PortalKajian.online</h1>
                <p className="text-teal-100 max-w-lg mb-6">Temukan informasi kajian sunnah terdekat, artikel islami, dan fitur ibadah lainnya.</p>
                <Link href="/kajian" className="inline-block bg-white text-teal-600 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors">
                    Cari Kajian Sekarang
                </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
                <Search className="w-64 h-64 -mb-12 -mr-12" />
            </div>
        </div>
    );
}
