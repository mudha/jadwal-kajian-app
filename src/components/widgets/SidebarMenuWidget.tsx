'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Calendar, Star, Bell, ShieldCheck, LogIn } from 'lucide-react';

export default function SidebarMenuWidget() {
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
        <div className="space-y-6">
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

            {/* Admin Login Link */}
            <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200"
            >
                <LogIn className="w-4 h-4" />
                Akses Panel Admin
            </Link>
        </div>
    );
}
