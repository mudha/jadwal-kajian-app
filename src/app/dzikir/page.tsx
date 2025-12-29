'use client';

import { ArrowLeft, Sunrise, Sunset, Plane, User, BookMarked, Moon } from 'lucide-react';
import Link from 'next/link';

interface DzikirCategory {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
    soon?: boolean;
}

const DZIKIR_CATEGORIES: DzikirCategory[] = [
    {
        title: 'Dzikir Pagi',
        description: 'Dzikir pembuka hari',
        icon: Sunrise,
        href: '/dzikir/harian?mode=pagi',
        gradient: 'from-blue-500 to-blue-600',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        title: 'Dzikir Petang',
        description: 'Dzikir di sore hari',
        icon: Sunset,
        href: '/dzikir/harian?mode=petang',
        gradient: 'from-indigo-500 to-indigo-600',
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
    },
    {
        title: 'Dzikir Sehabis Sholat',
        description: 'Dzikir dan doa setelah sholat fardhu',
        icon: Moon,
        href: '/dzikir/sehabis-sholat',
        gradient: 'from-teal-500 to-teal-600',
        iconBg: 'bg-teal-50',
        iconColor: 'text-teal-600',
        soon: true,
    },
    {
        title: 'Dzikir Perjalanan',
        description: 'Doa dan dzikir saat bepergian',
        icon: Plane,
        href: '/dzikir/perjalanan',
        gradient: 'from-purple-500 to-purple-600',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        soon: true,
    },
    {
        title: 'Doa Sehari-hari',
        description: 'Kumpulan doa untuk aktivitas harian',
        icon: BookMarked,
        href: '/dzikir/doa-harian',
        gradient: 'from-green-500 to-green-600',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
    },
];

export default function DzikirIndexPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-br from-teal-600 to-teal-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Dzikir & Doa</h1>
                            <p className="text-teal-100 text-sm font-medium mt-1">Pilih kategori dzikir atau doa</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DZIKIR_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const Component = category.soon ? 'div' : Link;
                        const props: any = category.soon ? {
                            onClick: () => alert('Fitur ini sedang dalam pengembangan Insya Allah segera hadir.')
                        } : {
                            href: category.href
                        };

                        return (
                            <Component
                                key={category.title}
                                {...props}
                                className={`group block ${category.soon ? 'cursor-not-allowed opacity-90' : ''}`}
                            >
                                <div className={`relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${!category.soon && 'hover:shadow-xl hover:-translate-y-1'} transition-all duration-300 overflow-hidden`}>
                                    {/* Gradient Background Accent */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />

                                    {/* Content */}
                                    <div className="relative z-10 flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`${category.iconBg} rounded-2xl p-4 ${!category.soon && 'group-hover:scale-110'} transition-transform duration-300 shadow-sm relative`}>
                                            <Icon className={`w-8 h-8 ${category.iconColor}`} />

                                        </div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className={`font-bold text-slate-900 text-lg ${!category.soon && 'group-hover:text-teal-600'} transition-colors`}>
                                                    {category.title}
                                                </h2>
                                                {category.soon && (
                                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wide">
                                                        Soon
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 leading-relaxed grid grid-rows-[0fr] group-hover:grid-rows-[1fr]">
                                                {category.description}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="shrink-0 mt-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${category.soon ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 group-hover:bg-teal-600 group-hover:text-white'}`}>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay for "soon" items to ensure click capture on the whole card */}
                                    {category.soon && (
                                        <div className="absolute inset-0 bg-slate-50/10 z-20" />
                                    )}
                                </div>
                            </Component>
                        );
                    })}
                </div>

                {/* Info Note */}
                <div className="mt-12 text-center">
                    <div className="inline-block bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 max-w-2xl">
                        <p className="text-sm text-amber-800 leading-relaxed">
                            <strong className="font-bold">Catatan:</strong> Bacaan dzikir dan doa disusun berdasarkan dalil dari Al-Qur'an dan Hadits Shahih.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
