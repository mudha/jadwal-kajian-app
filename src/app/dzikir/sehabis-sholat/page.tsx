'use client';

import { useState } from 'react';
import { dzikirSholat } from '@/lib/dzikir-sholat-data';
import DzikirCard from '@/components/DzikirCard';
import { ArrowLeft, Moon, Star } from 'lucide-react';
import Link from 'next/link';

export default function DzikirSholatPage() {
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

    const handleComplete = (id: string) => {
        setCompletedItems(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const progressPercent = Math.round((completedItems.size / dzikirSholat.length) * 100);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Section */}
            <div className="relative pt-12 pb-24 px-6 overflow-hidden bg-teal-600">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="mb-8">
                        <Link href="/dzikir" className="inline-flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Moon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                            Dzikir Sholat
                        </h1>
                    </div>
                    <p className="text-white/80 font-medium mb-2 max-w-lg leading-relaxed text-lg">
                        Bacaan dzikir shahih setelah sholat fardhu.
                    </p>
                    <p className="text-xs text-white/50 font-medium">
                        Sumber: Muslim.or.id
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                {/* Progress Bar */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-teal-200/50 mb-10 border border-teal-50 flex items-center gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Bacaan</span>
                            <span className="text-sm font-black text-teal-800">{progressPercent}%</span>
                        </div>
                        <div className="h-2.5 bg-teal-50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-teal-600 transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="shrink-0 w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-400">
                        <Star className="w-5 h-5" />
                    </div>
                </div>

                {/* Dzikir Cards List */}
                <div className="space-y-6">
                    {dzikirSholat.map((item) => (
                        <DzikirCard
                            key={item.id}
                            item={item}
                            onComplete={() => handleComplete(item.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
