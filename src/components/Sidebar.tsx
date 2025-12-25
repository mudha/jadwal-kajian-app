'use client';

import Link from 'next/link';
import PrayerTimeWidget from './PrayerTimeWidget';
import MenuGrid from './MenuGrid';

export default function Sidebar() {
    return (
        <div className="space-y-6">
            {/* Prayer Time Widget */}
            <PrayerTimeWidget />

            {/* Kitab Referensi Banner */}
            <Link
                href="#"
                className="block bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-4 text-white hover:opacity-95 transition-opacity"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-lg">Kitab Referensi</p>
                        <p className="text-sm text-white/90">Pelajari lebih lanjut</p>
                    </div>
                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                        Baca
                    </button>
                </div>
            </Link>

            {/* Menu Grid */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Menu Utama</h3>
                <MenuGrid />
            </div>
        </div>
    );
}
