'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Star, Bell, User, Search } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();

    // Hide navbar on admin or login pages if needed, usually managed in layout
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
        return null;
    }

    const navItems = [
        { href: '/', icon: Home, label: 'Beranda' },
        { href: '/kajian', icon: Search, label: 'Cari Kajian' },
        { href: '/agenda', icon: Calendar, label: 'Agenda' },
        { href: '/favorit', icon: Star, label: 'Favorit' },
        { href: '/notifikasi', icon: Bell, label: 'Notifikasi' },
        { href: '/akun', icon: User, label: 'Akun' },
    ];

    return (
        <nav className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-teal-600 text-xl">Jadwal Kajian Sunnah</span>
                        </div>
                        <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                                            ? 'border-teal-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
