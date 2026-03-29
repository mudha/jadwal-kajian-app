'use client';
import { useState, useEffect } from 'react';
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
    School,
    Bell,
    BarChart2,
    User,
    Database,
    ChevronDown,
    ChevronRight,
    Briefcase,
    MessageSquare
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

interface SessionData {
    isAdmin: boolean;
    role: string | null;
    username: string | null;
}

interface SubMenuItem {
    href: string;
    label: string;
    badge?: number;
    icon?: any; // Optional inner icon
}

interface MenuItem {
    href?: string; // Optional for parent items
    icon: any;
    label: string;
    badge?: number;
    subItems?: SubMenuItem[];
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [session, setSession] = useState<SessionData | null>(null);
    const [pendingCounts, setPendingCounts] = useState<{ contributors: number }>({ contributors: 0 });
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['Manajemen Data']); // Default expand
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

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    // Base menu structure
    const baseManagementItems: SubMenuItem[] = [
        { href: '/admin/manage', icon: List, label: 'Kelola Jadwal' },
        { href: '/admin/ustadz', icon: ListMusic, label: 'Kelola Ustadz' },
        { href: '/admin/masjid', icon: Calendar, label: 'Kelola Masjid' },
        { href: '/admin/sekolah', icon: School, label: 'Kelola Sekolah' },
        { href: '/admin/ambulances', icon: Users, label: 'Kelola Ambulance' },
    ];

    // Dynamic Construction
    const menuItems: MenuItem[] = [
        { href: '/admin', icon: Home, label: 'Dashboard' },
        { href: '/admin/stats', icon: BarChart2, label: 'Stats' },
        { href: '/admin/telegram-inbox', icon: MessageSquare, label: 'Telegram Inbox (AI)' },
        { href: '/admin/input', icon: FileInput, label: 'Input Kajian' },
        {
            icon: Database,
            label: 'Manajemen Data',
            subItems: baseManagementItems
        },
        { href: '/admin/notifications', icon: Bell, label: 'Broadcast Notifikasi' },
        { href: '/admin/profile', icon: User, label: 'Profile & Keamanan' },
    ];

    // Logic to inject specific items based on role
    // 1. Tampilan (Admin/Super Admin)
    if (session?.role !== 'CONTRIBUTOR') {
        const mgmtItem = menuItems.find(i => i.label === 'Manajemen Data');
        if (mgmtItem && mgmtItem.subItems) {
            mgmtItem.subItems.push({ href: '/admin/tampilan', icon: LayoutDashboard, label: 'Kelola Tampilan' });
        }
    }

    // 2. Admin & Contributor Management (Super Admin / Admin)
    if (session?.role === 'SUPER_ADMIN' || session?.role === 'ADMIN') {
        const mgmtItem = menuItems.find(i => i.label === 'Manajemen Data');
        if (mgmtItem && mgmtItem.subItems) {
            mgmtItem.subItems.push({ href: '/admin/admins', icon: Users, label: 'Kelola Admin' });
            mgmtItem.subItems.push({
                href: '/admin/contributors',
                icon: Briefcase,
                label: 'Kelola Kontributor',
                badge: pendingCounts.contributors > 0 ? pendingCounts.contributors : undefined
            });
        }
    }

    // Direct link to manual input for contributors override
    if (session?.role === 'CONTRIBUTOR') {
        const inputItem = menuItems.find(item => item.label === 'Input Kajian');
        if (inputItem) {
            inputItem.href = '/admin/batch-input?mode=manual';
        }
    }

    const isActive = (href: string) => pathname === href;
    const isParentActive = (item: MenuItem) => item.subItems?.some(sub => isActive(sub.href));

    const renderMenuItem = (item: MenuItem) => {
        // If it has subItems, render as an accordion/group
        if (item.subItems) {
            const isExpanded = expandedMenus.includes(item.label);
            const activeChild = isParentActive(item);

            return (
                <div key={item.label} className="space-y-1">
                    <button
                        onClick={() => toggleMenu(item.label)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeChild || isExpanded
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {/* Submenu */}
                    {isExpanded && (
                        <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {item.subItems.map(sub => (
                                <Link
                                    key={sub.href}
                                    href={sub.href}
                                    onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all border-l-2 ml-4 ${isActive(sub.href)
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                                        : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Optional icon support for subs */}
                                        {sub.icon && <sub.icon className="w-4 h-4 opacity-70" />}
                                        <span>{sub.label}</span>
                                    </div>
                                    {sub.badge && (
                                        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                            {sub.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Regular Item
        return (
            <Link
                key={item.href}
                href={item.href!}
                onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive(item.href!)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex-shrink-0">
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

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    {menuItems.map(renderMenuItem)}
                </nav>

                <div className="px-4 pb-2 pt-2 border-t border-slate-800 mt-auto flex-shrink-0">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                        <ExternalLink className="w-5 h-5" />
                        <span className="font-medium">Lihat Aplikasi</span>
                    </Link>
                </div>

                <div className="p-4 flex-shrink-0">
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
                className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
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
                    {menuItems.map(renderMenuItem)}
                </nav>

                <div className="px-4 pb-2 border-t border-slate-800 flex-shrink-0">
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

                <div className="p-4 flex-shrink-0">
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
