'use client';
import { useState, useEffect } from 'react';
import { Bell, ArrowLeft, CheckCheck, Info, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    type: 'reminder' | 'info' | 'recommendation';
    isRead: boolean;
    created_at: string;
}

export default function NotifikasiPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();

                // Get read status from local storage
                const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');

                const formattedData = data.map((item: any) => ({
                    ...item,
                    isRead: readIds.includes(item.id),
                    // Simple relative time logic
                    time: getRelativeTime(item.created_at)
                }));

                setNotifications(formattedData);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        return date.toLocaleDateString('id-ID');
    };

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id);
        localStorage.setItem('read_notifications', JSON.stringify(allIds));
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const markAsRead = (id: number) => {
        const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            localStorage.setItem('read_notifications', JSON.stringify(newReadIds));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock className="w-5 h-5 text-orange-500" />;
            case 'recommendation': return <MapPin className="w-5 h-5 text-teal-500" />;
            case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800">Pemberitahuan</h1>
                </div>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                        <CheckCheck className="w-3 h-3" />
                        Tandai Dibaca
                    </button>
                )}
            </div>

            <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => markAsRead(item.id)}
                            className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md flex gap-4 cursor-pointer ${!item.isRead ? 'bg-teal-50/30 border-l-4 border-l-teal-500' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!item.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className={`font-bold text-sm ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {item.title}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{item.time}</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                    {item.message}
                                </p>
                            </div>
                            {!item.isRead && (
                                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5"></div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">Belum ada notifikasi</h3>
                        <p className="text-slate-500 text-xs">Kami akan memberi tahu Anda jika ada info penting.</p>
                    </div>
                )}

                {!isLoading && notifications.length > 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs text-slate-400">Tidak ada notifikasi lainnya.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
