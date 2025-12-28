'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { dzikirPagi, dzikirPetang } from '@/lib/dzikir-data';
import DzikirCard from '@/components/DzikirCard';
import { ArrowLeft, Sunrise, Sunset, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function DzikirContent() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'petang' ? 'petang' : 'pagi';
    const [mode, setMode] = useState<'pagi' | 'petang'>(initialMode);
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

    // Sync mode with search params if they change
    useEffect(() => {
        const m = searchParams.get('mode');
        if (m === 'pagi' || m === 'petang') {
            setMode(m);
        }
    }, [searchParams]);

    const currentList = mode === 'pagi' ? dzikirPagi : dzikirPetang;

    // Progress calculation
    const progressPercent = useMemo(() => {
        if (currentList.length === 0) return 0;
        const completedCount = currentList.filter(item => completedItems.has(item.id)).length;
        return Math.round((completedCount / currentList.length) * 100);
    }, [currentList, completedItems]);

    const handleComplete = (id: string) => {
        setCompletedItems(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const toggleMode = (newMode: 'pagi' | 'petang') => {
        setMode(newMode);
        setCompletedItems(new Set()); // Reset progress when switching
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header Section */}
            <div className={`relative pt-12 pb-24 px-6 overflow-hidden transition-colors duration-700
        ${mode === 'pagi' ? 'bg-blue-600' : 'bg-indigo-900'}
      `}>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        {mode === 'pagi' ? 'Dzikir Pagi' : 'Dzikir Petang'}
                    </h1>
                    <p className="text-white/70 font-medium mb-10 max-w-md leading-relaxed">
                        {mode === 'pagi'
                            ? 'Dibaca mulai dari masuknya waktu Subuh hingga terbitnya fajar atau matahari meninggi.'
                            : 'Dibaca mulai dari masuknya waktu Ashar hingga terbenamnya matahari atau pertengahan malam.'}
                    </p>

                    {/* Mode Toggle Tabs */}
                    <div className="flex p-1.5 bg-black/20 backdrop-blur-md rounded-2xl w-fit border border-white/10">
                        <button
                            onClick={() => toggleMode('pagi')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
                ${mode === 'pagi' ? 'bg-white text-blue-600 shadow-xl' : 'text-white/60 hover:text-white'}
              `}
                        >
                            <Sunrise className="w-4 h-4" />
                            Pagi
                        </button>
                        <button
                            onClick={() => toggleMode('petang')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all
                ${mode === 'petang' ? 'bg-white text-indigo-900 shadow-xl' : 'text-white/60 hover:text-white'}
              `}
                        >
                            <Sunset className="w-4 h-4" />
                            Petang
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
                {/* Progress Bar Floating */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 mb-10 border border-slate-100/50 flex items-center gap-6">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Bacaan</span>
                            <span className="text-sm font-black text-slate-800">{progressPercent}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ease-out rounded-full 
                    ${mode === 'pagi' ? 'bg-blue-600' : 'bg-indigo-600'}
                  `}
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="shrink-0 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group cursor-help relative">
                        <Info className="w-5 h-5" />
                        {/* Tooltip purely CSS based or just for visual */}
                    </div>
                </div>

                {/* Dzikir Cards List */}
                <div className="space-y-6">
                    {currentList.map((item) => (
                        <DzikirCard
                            key={item.id}
                            item={item}
                            onComplete={() => handleComplete(item.id)}
                        />
                    ))}
                </div>

                {/* Footer info */}
                <div className="mt-16 text-center space-y-4 pb-12">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <div className="w-8 h-px bg-slate-200"></div>
                        Referensi Konten
                        <div className="w-8 h-px bg-slate-200"></div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        Disusun berdasarkan tuntunan Al-Qur'an & Sunnah Shahih.<br />
                        Sumber artikel: <a href="https://rumaysho.com" target="_blank" className="text-blue-500 hover:underline">Rumaysho.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function DzikirPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <DzikirContent />
        </Suspense>
    );
}
