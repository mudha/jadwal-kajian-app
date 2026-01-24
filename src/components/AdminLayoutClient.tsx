'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileInput,
    ShieldCheck,
    ListMusic,
    Calendar,
    Users,
    Menu,
    X,
    ExternalLink,
    Home,
    List,
    Merge,
    School,
    Bell,
    BarChart2,
    User,
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { useEffect } from 'react';

interface SessionData {
    isAdmin: boolean;
    role: string | null;
    username: string | null;
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<SessionData | null>(null);
    const [pendingCounts, setPendingCounts] = useState<{ contributors: number }>({ contributors: 0 });
    const pathname = usePathname();

    useEffect(() => {
        // Fetch session
        fetch('/api/admin/check-session')
            .then(res => res.json())
            .then(data => setSession(data))
            .catch(() => setSession({ isAdmin: false, role: null, username: null }));

        // Fetch pending counts
        fetch('/api/admin/pending-counts')
            .then(res => res.json())
            .then(data => setPendingCounts(data))
            .catch(err => console.error('Failed to fetch pending counts', err));

    }, []);

    const menuItems = [
        { href: '/admin', icon: Home, label: 'Dashboard' },
        { href: '/admin/stats', icon: BarChart2, label: 'Stats' },
        { href: '/admin/manage', icon: List, label: 'Kelola Jadwal' },
        { href: '/admin/input', icon: FileInput, label: 'Input Kajian' },
        { href: '/admin/ustadz', icon: ListMusic, label: 'Kelola Ustadz' },
        { href: '/admin/masjid', icon: Calendar, label: 'Kelola Masjid' },
        { href: '/admin/sekolah', icon: School, label: 'Kelola Sekolah' },
        { href: '/admin/ambulances', icon: Users, label: 'Kelola Ambulance' },
        { href: '/admin/notifications', icon: Bell, label: 'Broadcast Notifikasi' },
        { href: '/admin/profile', icon: User, label: 'Profile & Keamanan' },
    ];

    // Show Kelola Tampilan for non-contributors
    if (session?.role !== 'CONTRIBUTOR') {
        const insertIndex = 6; // After Sekolah
        menuItems.splice(insertIndex, 0, { href: '/admin/tampilan', icon: LayoutDashboard, label: 'Kelola Tampilan' });
    }

    // Add admin management for Super Admin and standard Admin
    if (session?.role === 'SUPER_ADMIN' || session?.role === 'ADMIN') {
        menuItems.push({ href: '/admin/admins', icon: Users, label: 'Kelola Admin' });
        menuItems.push({
            href: '/admin/contributors',
            icon: Users,
            label: 'Kelola Kontributor',
            badge: pendingCounts.contributors > 0 ? pendingCounts.contributors : undefined
        });
    }

    // Direct link to manual input for contributors
    if (session?.role === 'CONTRIBUTOR') {
        const inputItem = menuItems.find(item => item.label === 'Input Kajian');
        if (inputItem) {
            inputItem.href = '/admin/batch-input?mode=manual';
        }
    }

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
                            <p className="text-slate-400 text-xs">PortalKajian.online</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {/* @ts-ignore - dynamic property check */}
                            {item.badge && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                    {/* @ts-ignore */}
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 pb-2 pt-2 border-t border-slate-800 mt-auto">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-medium">Lihat Aplikasi</span>
                    </Link>
                </div>

                <div className="p-4">
                    <LogoutButton />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
                            <p className="text-slate-400 text-xs">PortalKajian.online</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {/* @ts-ignore */}
                            {item.badge && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                    {/* @ts-ignore */}
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 pb-2 border-t border-slate-800">
                    <Link
                        href="/"
                        target="_blank"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-medium">Lihat Aplikasi</span>
                    </Link>
                </div>

                <div className="p-4">
                    <LogoutButton />
                </div>
            </aside>

            {/* Mobile Nav & Content Wrapper */}
            <div className="flex-1 md:ml-64 w-full">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-slate-900" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900">Admin Panel</span>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                <main className="p-4 md:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
