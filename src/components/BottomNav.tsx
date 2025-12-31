'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, BookOpen, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Safely check for client-side rendering if needed, but useSearchParams is better
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

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
                        const baseUrl = href.split('?')[0];
                        const isBasePathMatch = pathname === baseUrl || (baseUrl === '/' && pathname === '/');

                        // Check query param if it exists in the nav item
                        let isActive = isBasePathMatch;
                        if (href.includes('?')) {
                            const neededMode = new URLSearchParams(href.split('?')[1]).get('mode');
                            const currentMode = searchParams?.get('mode');
                            isActive = isBasePathMatch && currentMode === neededMode;
                        }

                        // Just highlighting if path starts with it is usually enough for simple navs, 
                        // but let's stick to the styling logic we had:
                        // Highlighting logic:
                        // 1. If exact match (including query if present)
                        // 2. Or if it's the active section

                        const isSectionActive = pathname.startsWith(baseUrl) && baseUrl !== '/';

                        const isMultiLine = label.includes(' ');

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-colors ${isSectionActive || (pathname === '/' && baseUrl === '/')
                                    ? 'text-teal-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isSectionActive || (pathname === '/' && baseUrl === '/') ? 'fill-teal-600' : ''}`} />
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
