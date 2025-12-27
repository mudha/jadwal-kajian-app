'use client';
import { useState } from 'react';
import { Bell, ArrowLeft, CheckCheck, Info, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function NotifikasiPage() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Pengingat Kajian',
            message: 'Kajian "Tafsir Al-Muyassar" di Masjid Raya Bintaro dimulai dalam 1 jam lagi. Siapkan catatan Anda!',
            time: '1 jam yang lalu',
            type: 'reminder',
            isRead: false
        },
        {
            id: 2,
            title: 'Update Aplikasi',
            message: 'Tampilan baru Jadwal Kajian App telah hadir! Nikmati kemudahan mencari kajian dengan fitur filter dan peta yang lebih baik.',
            time: 'Hari ini, 09:00',
            type: 'info',
            isRead: true
        },
        {
            id: 3,
            title: 'Kajian di Sekitar Anda',
            message: 'Ada 3 kajian baru yang ditambahkan di area Tangerang Selatan untuk akhir pekan ini. Cek sekarang!',
            time: 'Kemarin',
            type: 'recommendation',
            isRead: true
        },
        {
            id: 4,
            title: 'Pesan dari Developer',
            message: 'Terima kasih telah menggunakan aplikasi ini. Mohon doanya agar kami bisa terus istiqomah mengembangkan aplikasi dakwah ini.',
            time: '2 hari yang lalu',
            type: 'info',
            isRead: true
        }
    ]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <Clock className="w-5 h-5 text-orange-500" />;
            case 'recommendation': return <MapPin className="w-5 h-5 text-teal-500" />;
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
                <button
                    onClick={markAllRead}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                    <CheckCheck className="w-3 h-3" />
                    Tandai Dibaca
                </button>
            </div>

            <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
                {notifications.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md flex gap-4 ${!item.isRead ? 'bg-teal-50/30 border-l-4 border-l-teal-500' : ''}`}
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
                            {item.type === 'recommendation' && (
                                <Link href="/kajian" className="text-[10px] font-bold text-teal-600 hover:underline">
                                    Lihat Jadwal →
                                </Link>
                            )}
                        </div>
                        {!item.isRead && (
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5"></div>
                        )}
                    </div>
                ))}

                <div className="text-center py-8">
                    <p className="text-xs text-slate-400">Tidak ada notifikasi lainnya.</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
