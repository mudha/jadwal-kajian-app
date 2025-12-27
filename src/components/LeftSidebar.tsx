'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, Star, Bell, Phone, ShieldCheck, LogIn } from 'lucide-react';
import MiniPrayerTimeWidget from './MiniPrayerTimeWidget';

export default function LeftSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Beranda' },
        { href: '/kajian', icon: Search, label: 'Cari Kajian' },
        { href: '/agenda', icon: Calendar, label: 'Agenda' },
        { href: '/favorit', icon: Star, label: 'Favorit Saya' },
        { href: '/notifikasi', icon: Bell, label: 'Notifikasi' },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <aside className="space-y-6">
            {/* App Branding (Only for Desktop Sidebar) */}
            <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-600 p-2 rounded-xl text-white shadow-lg shadow-teal-100">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg text-slate-900 leading-tight">PortalKajian</h1>
                        <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Online</p>
                    </div>
                </div>
            </div>

            {/* Mini Prayer Time Widget */}
            <div className="hidden md:block">
                <MiniPrayerTimeWidget />
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 space-y-1">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Menu Utama</p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${isActive(item.href)
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Support / Contact */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100 group cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform" />
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-lg">Butuh Bantuan?</h4>
                        <p className="text-blue-100 text-xs font-medium">Hubungi admin via WhatsApp untuk info kajian.</p>
                    </div>
                    <a href="https://wa.me/6281392135904" target="_blank" className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-black text-xs text-center hover:bg-blue-50 transition-colors shadow-sm">
                        Chat Admin
                    </a>
                </div>
            </div>

            {/* Admin Login Link */}
            <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200"
            >
                <LogIn className="w-4 h-4" />
                Akses Panel Admin
            </Link>
        </aside>
    );
}
