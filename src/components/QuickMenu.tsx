'use client';

import Link from 'next/link';
import { BookText, Clock, Video, Flower2, MapPin, MessageCircle, FileText, Calendar, Home, GraduationCap, Briefcase, Truck } from 'lucide-react';


export default function QuickMenu({ customItems }: { customItems?: any[] }) {
    const DEFAULT_ITEMS = [
        // ... existing items ...
        {
            id: 'sekolah-sunnah',
            label: 'Sekolah Sunnah',
            iconName: 'GraduationCap',
            href: '/sekolah-sunnah',
            gradient: 'from-purple-500 to-purple-600',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            id: 'loker',
            label: 'Lowongan Kerja',
            iconName: 'Briefcase',
            href: '#',
            gradient: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
            badge: 'SOON'
        },
        {
            id: 'ambulance',
            label: 'Ambulance Gratis',
            iconName: 'Truck',
            href: '/ambulance',
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
        },
        {
            id: 'dzikir',
            label: 'Dzikir',
            iconName: 'BookText',
            href: '/dzikir',
            gradient: 'from-teal-500 to-teal-600',
            iconBg: 'bg-teal-50',
            iconColor: 'text-teal-600',
        },
        {
            id: 'jadwal-sholat',
            label: 'Jadwal Sholat',
            iconName: 'Clock',
            href: '/jadwal-sholat',
            gradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            id: 'kajian-online',
            label: 'Kajian Online',
            iconName: 'Video',
            href: '/kajian?online=true',
            gradient: 'from-violet-500 to-violet-600',
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            id: 'kajian-muslimah',
            label: 'Kajian Muslimah',
            iconName: 'Flower2',
            href: '/kajian?muslimah=true',
            gradient: 'from-pink-500 to-pink-600',
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
        },
        {
            id: 'kajian-anak',
            label: 'Kajian Anak',
            iconName: 'Puzzle',
            href: '/kajian?mode=anak',
            gradient: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-600',
        },
        {
            id: 'kajian-terdekat',
            label: 'Kajian Terdekat',
            iconName: 'MapPin',
            href: '/kajian?nearby=true',
            gradient: 'from-amber-500 to-amber-600',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            id: 'hubungi-kami',
            label: 'Hubungi Kami',
            iconName: 'MessageCircle',
            href: '/hubungi-kami',
            gradient: 'from-slate-500 to-slate-600',
            iconBg: 'bg-slate-50',
            iconColor: 'text-slate-600',
        },
        {
            id: 'catatan-kajian',
            label: 'Catatan Kajian',
            iconName: 'FileText',
            href: '/catatan-kajian',
            gradient: 'from-indigo-500 to-indigo-600',
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
        },
        {
            id: 'kalender-puasa',
            label: 'Kalender Puasa',
            iconName: 'Calendar',
            href: '/kalender-puasa',
            gradient: 'from-green-500 to-green-600',
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            id: 'cari-masjid',
            label: 'Cari Masjid',
            iconName: 'Home',
            href: '/masjid',
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
        },
    ];

    const ICON_MAP: any = {
        BookText, Clock, Video, Flower2, MapPin, MessageCircle, FileText, Calendar, Home, GraduationCap, Briefcase, Truck
    };

    // Simplified logic: If customItems is provided (even if empty), use it as the source of truth.
    // This allows parents to filter out items (like hidden ones) without them being re-added automatically.
    const getMergedItems = () => {
        if (!customItems || !Array.isArray(customItems)) {
            return DEFAULT_ITEMS;
        }
        return customItems;
    };

    const items = getMergedItems();

    return (
        <div className="mb-6">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 min-h-[320px] md:min-h-[280px]">
                {items.map((item) => {
                    const Icon = ICON_MAP[item.iconName] || Home;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`group ${item.badge === 'SOON' ? 'cursor-not-allowed opacity-80' : ''}`}
                            onClick={(e) => item.badge === 'SOON' && e.preventDefault()}
                        >
                            <div className={`relative bg-gradient-to-br ${item.gradient} rounded-xl p-3 w-full aspect-square flex flex-col items-center justify-center shadow-md hover:shadow-xl active:scale-95 transition-all duration-200 border border-white/20`}>
                                {item.badge && (
                                    <span className="absolute top-1 right-1 bg-white/90 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm z-10 border border-red-100 uppercase tracking-wide">
                                        {item.badge}
                                    </span>
                                )}
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
