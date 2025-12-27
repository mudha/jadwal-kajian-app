'use client';

import { useState, useEffect } from 'react';
import { DzikirItem } from '@/lib/dzikir-data';
import { Check, RotateCcw, Quote } from 'lucide-react';

interface DzikirCardProps {
    item: DzikirItem;
    onComplete?: () => void;
}

export default function DzikirCard({ item, onComplete }: DzikirCardProps) {
    const [currentCount, setCurrentCount] = useState(0);
    const isCompleted = currentCount >= item.count;

    // Progress percentage
    const progress = (currentCount / item.count) * 100;
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const handleIncrement = () => {
        if (currentCount < item.count) {
            const newCount = currentCount + 1;
            setCurrentCount(newCount);
            if (newCount === item.count && onComplete) {
                // Haptic feedback could go here
                onComplete();
            }
        }
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentCount(0);
    };

    return (
        <div
            onClick={handleIncrement}
            className={`relative group bg-white rounded-[2.5rem] p-8 shadow-sm border-2 transition-all duration-500 cursor-pointer overflow-hidden
        ${isCompleted
                    ? 'border-teal-500 shadow-teal-100/50 bg-teal-50/10'
                    : 'border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5'
                }
      `}
        >
            {/* Decorative background blobs */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl transition-colors duration-700 pointer-events-none 
        ${isCompleted ? 'bg-teal-400/10' : 'bg-blue-400/5'}
      `}></div>

            <div className="relative z-10">
                {/* Header: Title & Counter */}
                <div className="flex justify-between items-start mb-10">
                    <div className="flex-1 mr-4">
                        <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg mb-2 uppercase tracking-widest border border-slate-100">
                            {item.source}
                        </span>
                        <h3 className="text-xl font-black text-slate-800 leading-tight">{item.title}</h3>
                    </div>

                    {/* Circular Counter */}
                    <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                className="fill-none stroke-slate-100"
                                strokeWidth="6"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="40"
                                cy="40"
                                r={radius}
                                className={`fill-none transition-all duration-300 stroke-linecap-round ${isCompleted ? 'stroke-teal-500' : 'stroke-blue-600'}`}
                                strokeWidth="6"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {isCompleted ? (
                                <Check className="w-8 h-8 text-teal-500 animate-in zoom-in duration-300" />
                            ) : (
                                <>
                                    <span className="text-lg font-black text-slate-800 leading-none">{currentCount}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">/ {item.count}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Arabic Text */}
                <div className="mb-8 text-right">
                    <p className="text-3xl md:text-4xl font-arabic leading-[1.8] text-slate-900 dir-rtl" style={{ fontFamily: "'Traditional Arabic', 'Amiri', serif" }}>
                        {item.arabic}
                    </p>
                </div>

                {/* Transliteration & Translation */}
                <div className="space-y-6">
                    {item.transliteration && (
                        <div className="relative pl-6">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
                            <p className="text-sm text-slate-500 italic leading-relaxed font-medium">
                                {item.transliteration}
                            </p>
                        </div>
                    )}

                    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50">
                        <div className="flex gap-3">
                            <Quote className="w-5 h-5 text-slate-300 shrink-0" />
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {item.translation}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Bar (Only shows when started or completed) */}
                <div className={`mt-8 pt-6 border-t border-slate-50 flex justify-between items-center transition-all duration-300
          ${currentCount > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
        `}>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        RESET
                    </button>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest
            ${isCompleted ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}
          `}>
                        {isCompleted ? 'Selesai' : 'Sedang Dibaca'}
                    </div>
                </div>
            </div>

            {/* Tap Feedback Animation Area */}
            {!isCompleted && (
                <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Ketuk kartu untuk menghitung
                </div>
            )}
        </div>
    );
}
