'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Info, Sparkles, BookOpen } from 'lucide-react';
import { DzikirItem } from '@/data/dzikir-pagi';

interface DzikirViewerProps {
    data: DzikirItem[];
    title: string;
    description: string;
    colorTheme: 'teal' | 'orange' | 'blue' | 'indigo';
}

export default function DzikirViewer({ data, title, description, colorTheme }: DzikirViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [counter, setCounter] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const currentItem = data[currentIndex];

    // Theme colors
    const theme = {
        teal: 'from-teal-600 to-teal-800',
        orange: 'from-orange-500 to-red-500',
        blue: 'from-blue-600 to-indigo-700',
        indigo: 'from-indigo-600 to-purple-700'
    }[colorTheme];

    const bgLight = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    }[colorTheme];

    const nextDzikir = () => {
        if (currentIndex < data.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setCounter(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsFinished(true);
        }
    };

    const prevDzikir = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setCounter(0);
            setIsFinished(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleTap = () => {
        const target = currentItem.repeat;
        if (counter < target) {
            setCounter(prev => prev + 1);
        }
    };

    // Auto next if repeated enough? Optional. 
    // Let's keep manual next for control.

    const percentage = ((currentIndex + 1) / data.length) * 100;

    if (isFinished) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className={`h-1/2 w-full absolute top-0 bg-gradient-to-br ${theme} rounded-b-[3rem] z-0`} />

                <header className="relative z-10 px-4 py-4 text-white">
                    <Link href="/akun" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-bold text-sm">Kembali</span>
                    </Link>
                </header>

                <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-20">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10 text-center animate-in zoom-in-95 duration-500">
                        <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${theme} rounded-full flex items-center justify-center text-white shadow-lg mb-6`}>
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Alhamdulillah</h2>
                        <p className="text-slate-500 mb-8 font-medium">Anda telah menyelesaikan<br />{title}</p>

                        <div className="space-y-3">
                            <button onClick={() => { setIsFinished(false); setCurrentIndex(0); setCounter(0); }} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                                Ulangi dari Awal
                            </button>
                            <Link href="/" className={`block w-full py-4 bg-gradient-to-r ${theme} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1`}>
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Background */}
            <div className={`absolute top-0 w-full h-64 bg-gradient-to-br ${theme} rounded-b-[40px] z-0 shadow-lg`} />

            {/* Navbar */}
            <header className="relative z-10 px-4 py-4 text-white flex items-center justify-between">
                <Link href="/akun" className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{title}</h1>
                    <p className="text-xs opacity-80 font-medium tracking-wide">{description}</p>
                </div>
                <div className="w-9"></div> {/* Spacer */}
            </header>

            {/* Main Card */}
            <main className="relative z-10 flex-1 px-4 pt-4 pb-32 max-w-2xl mx-auto w-full">
                {/* Progress Bar */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-white transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-white/90 tabular-nums">{currentIndex + 1}/{data.length}</span>
                </div>

                <div
                    onClick={handleTap}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[400px] flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer active:scale-[0.99] transition-transform"
                >
                    {/* Header Card */}
                    <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky top-0">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                            Dzikir #{currentIndex + 1}
                        </span>
                        {currentItem.repeat > 1 && (
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${counter >= currentItem.repeat ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                <span className={counter >= currentItem.repeat ? 'text-green-600' : 'text-slate-400'}>
                                    {counter >= currentItem.repeat ? 'Selesai' : 'Dibaca'}
                                </span>
                                <span className="bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-slate-100 min-w-[20px] text-center">
                                    {counter}/{currentItem.repeat}x
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                        {/* Arabic */}
                        <div className="text-right mb-8">
                            <p className="font-arabic text-3xl md:text-4xl leading-[1.8] md:leading-[2] text-slate-800 font-medium" dir="rtl">
                                {currentItem.arabic}
                            </p>
                        </div>

                        {/* Latin */}
                        {currentItem.latin && (
                            <div className="mb-6">
                                <p className="text-teal-600/80 font-bold text-xs uppercase tracking-widest mb-1">Latin / Bacaan</p>
                                <p className="text-slate-600 font-medium leading-relaxed italic text-sm md:text-base">
                                    "{currentItem.latin}"
                                </p>
                            </div>
                        )}

                        {/* Translation */}
                        <div className="mb-8">
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Arti</p>
                            <p className="text-slate-700 leading-relaxed text-sm md:text-base">
                                {currentItem.translation}
                            </p>
                        </div>

                        {/* Faedah */}
                        {currentItem.faedah && (
                            <div className={`mt-auto p-4 rounded-2xl ${bgLight} text-xs md:text-sm leading-relaxed flex gap-3 items-start`}>
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block mb-0.5">Keutamaan:</span>
                                    {currentItem.faedah}
                                </div>
                            </div>
                        )}

                        {/* Source */}
                        <div className="mt-6 text-center">
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-3 py-1 rounded-full font-medium">
                                {currentItem.source}
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 flex items-center justify-between gap-4 md:px-8 max-w-2xl mx-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] safe-area-bottom">
                <button
                    onClick={prevDzikir}
                    disabled={currentIndex === 0}
                    className="p-4 rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex-1 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <p className="text-sm font-black text-slate-800 truncate px-2">{currentItem.title}</p>
                </div>

                <button
                    onClick={nextDzikir}
                    className={`p-4 rounded-2xl text-white shadow-lg shadow-teal-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 bg-gradient-to-r ${theme}`}
                >
                    <span className="font-bold text-sm hidden sm:inline">Lanjut</span>
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Tap Hint for Mobile */}
            {currentItem.repeat > 1 && counter < currentItem.repeat && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-xs px-4 py-2 rounded-full backdrop-blur-md pointer-events-none animate-bounce">
                    Ketuk kartu untuk hitung dzikir
                </div>
            )}
        </div>
    );
}
