'use client';

import Link from 'next/link';
import { BookText, Clock, Video, Flower2 } from 'lucide-react';

export default function QuickMenu() {
    const menuItems = [
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
            gradient: 'from-purple-500 to-purple-600',
            iconBg: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Kajian Muslimah',
            icon: Flower2,
            href: '/kajian?muslimah=true',
            gradient: 'from-pink-500 to-pink-600',
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
        },
    ];

    return (
        <div className="md:hidden mb-6 -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="group flex-shrink-0"
                        >
                            <div className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-4 w-24 h-28 flex flex-col items-center justify-center shadow-md hover:shadow-xl active:scale-95 transition-all duration-200 border border-white/20`}>
                                {/* Icon Container */}
                                <div className={`${item.iconBg} rounded-xl p-3 mb-2 group-hover:scale-110 transition-transform duration-200`}>
                                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                                </div>

                                {/* Label */}
                                <p className="text-white text-[10px] font-bold text-center leading-tight">
                                    {item.label}
                                </p>

                                {/* Decorative glow */}
                                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
