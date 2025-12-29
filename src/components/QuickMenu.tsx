'use client';

import Link from 'next/link';
import { BookText, Clock, Video, Flower2, MapPin, MessageCircle, FileText, Calendar, Home, GraduationCap } from 'lucide-react';

export default function QuickMenu() {
    const menuItems = [
        {
            label: 'Sekolah Sunnah',
            icon: GraduationCap,
            href: '/sekolah-sunnah',
            gradient: 'from-purple-500 to-purple-600',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Dzikir',
            icon: BookText,
            href: '/dzikir',
            gradient: 'from-teal-500 to-teal-600',
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
        },
        {
            label: 'Jadwal Sholat',
            icon: Clock,
            href: '/jadwal-sholat',
            gradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Kajian Online',
            icon: Video,
            href: '/kajian?online=true',
            gradient: 'from-violet-500 to-violet-600',
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            label: 'Kajian Muslimah',
            icon: Flower2,
            href: '/kajian?muslimah=true',
            gradient: 'from-pink-500 to-pink-600',
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
        },
        {
            label: 'Kajian Terdekat',
            icon: MapPin,
            href: '/kajian?nearby=true',
            gradient: 'from-amber-500 to-amber-600',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Hubungi Kami',
            icon: MessageCircle,
            href: '/hubungi-kami',
            gradient: 'from-slate-500 to-slate-600',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-600',
        },
        {
            label: 'Catatan Kajian',
            icon: FileText,
            href: '/catatan-kajian',
            gradient: 'from-indigo-500 to-indigo-600',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            label: 'Kalender Puasa',
            icon: Calendar,
            href: '/kalender-puasa',
            gradient: 'from-green-500 to-green-600',
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            label: 'Cari Masjid',
            icon: Home,
            href: '/masjid',
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
        },
    ];

    return (
        <div className="md:hidden mb-6">
            <div className="grid grid-cols-3 gap-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="group"
                        >
                            <div className={`relative bg-gradient-to-br ${item.gradient} rounded-xl p-3 w-full aspect-square flex flex-col items-center justify-center shadow-md hover:shadow-xl active:scale-95 transition-all duration-200 border border-white/20`}>
                                {/* Icon Container */}
                                <div className={`${item.iconBg} rounded-lg p-2.5 mb-1.5 group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                </div>

                                {/* Label */}
                                <p className="text-white text-[9px] font-bold text-center leading-tight line-clamp-2">
                                    {item.label}
                                </p>

                                {/* Decorative glow */}
                                <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
