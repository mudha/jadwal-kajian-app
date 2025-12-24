'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Star, Bell, User } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Beranda' },
        { href: '/agenda', icon: Clock, label: 'Agenda' },
        { href: '/favorit', icon: Star, label: 'Favorit' },
        { href: '/notifikasi', icon: Bell, label: 'Notifikasi' },
        { href: '/akun', icon: User, label: 'Akun' },
    ];

    // Hide bottom nav on admin pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors ${isActive
                                        ? 'text-teal-600'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'fill-teal-600' : ''}`} />
                                <span className="text-[10px] font-bold">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
