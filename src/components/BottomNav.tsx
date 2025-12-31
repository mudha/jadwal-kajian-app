'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Star } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Beranda' },
        { href: '/kajian?mode=nearby', icon: BookOpen, label: 'Kajian Terdekat' },
        { href: '/favorit', icon: Star, label: 'Favorit' },
    ];

    // Hide bottom nav on admin, login, and dzikir pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.includes('/dzikir-')) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-bottom md:hidden">
            <div className="max-w-md mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        // Check if active (handle query params for nearby)
                        const isActive = pathname === href.split('?')[0] && (href.includes('?') ? window.location.search.includes('mode=nearby') : true);

                        // For basic matching if query param check is too complex for SSR/hydration safety, 
                        // we can mostly rely on pathname match for simplicity or accept rough matching.
                        // Better approach for formatting 'Kajian Terdekat' to stack:
                        const isMultiLine = label.includes(' ');

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-colors ${pathname.startsWith(href.split('?')[0])
                                    ? 'text-teal-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${pathname.startsWith(href.split('?')[0]) ? 'fill-teal-600' : ''}`} />
                                <span className={`text-[10px] font-bold text-center leading-none ${isMultiLine ? 'w-16' : ''}`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
