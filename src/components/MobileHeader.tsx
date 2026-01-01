'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';

interface MobileHeaderProps {
    onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const checkUnread = async () => {
            try {
                // Fetch recent notifications to check status
                const res = await fetch('/api/notifications?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
                        // Check if ANY of the latest notifications are NOT in the read list
                        const unreadExists = data.some((n: any) => !readIds.includes(n.id));
                        setHasUnread(unreadExists);
                    } else {
                        setHasUnread(false);
                    }
                }
            } catch (error) {
                console.error("Error checking notifications", error);
            }
        };

        checkUnread();

        // Optional: Listen for storage events if multiple tabs open (or just rely on mount)
        // For now, mount is sufficient as user navigates back to home
    }, []);

    return (
        <header className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between md:hidden sticky top-0 z-40 shadow-md">
            <div className="flex items-center gap-4">
                <button
                    onClick={onOpenSidebar}
                    className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Open Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="font-bold text-lg leading-tight">PortalKajian.online</h1>
                    <p className="text-[10px] text-teal-100 uppercase tracking-widest font-medium">Jadwal Kajian Sunnah</p>
                </div>
            </div>
            <Link href="/notifikasi" className="p-2 relative hover:bg-white/10 rounded-full transition-colors">
                {hasUnread && (
                    <div className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-teal-600"></div>
                )}
                <Bell className="w-6 h-6" />
            </Link>
        </header>
    );
}
