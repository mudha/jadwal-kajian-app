'use client';

import { RecurringPattern } from '@/lib/recurring-generator';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface RecurringPatternSelectorProps {
    pattern: RecurringPattern;
    dayOfWeek: number;
    weekOfMonth?: number;
    onChange: (pattern: RecurringPattern, dayOfWeek: number, weekOfMonth?: number) => void;
}

const DAY_NAMES = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const PATTERNS: { value: RecurringPattern; label: string }[] = [
    { value: 'weekly', label: 'Pekanan (Setiap pekan)' },
    { value: 'biweekly', label: 'Dua Pekanan (Setiap 2 pekan)' },
    { value: 'monthly', label: 'Bulanan (Bulan tertentu)' },
    { value: 'monthly_odd', label: '2x Sebulan (Pekan 1 & 3)' },
    { value: 'monthly_even', label: '2x Sebulan (Pekan 2 & 4)' },
];

export default function RecurringPatternSelector({
    pattern,
    dayOfWeek,
    weekOfMonth,
    onChange
}: RecurringPatternSelectorProps) {
    const [showPatternDropdown, setShowPatternDropdown] = useState(false);
    const [showDayDropdown, setShowDayDropdown] = useState(false);
    const [showWeekDropdown, setShowWeekDropdown] = useState(false);

    const selectedPattern = PATTERNS.find(p => p.value === pattern);
    const needsWeekOfMonth = pattern === 'monthly';

    return (
        <div className="space-y-4">
            {/* Pattern Selector */}
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">
                    Pola Rekurensi
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowPatternDropdown(!showPatternDropdown)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all flex items-center justify-between"
                    >
                        <span>{selectedPattern?.label || 'Pilih pola'}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showPatternDropdown && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                            {PATTERNS.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(p.value, dayOfWeek, weekOfMonth);
                                        setShowPatternDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Day of Week Selector */}
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">
                    Hari
                </label>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowDayDropdown(!showDayDropdown)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all flex items-center justify-between"
                    >
                        <span>{DAY_NAMES[dayOfWeek]}</span>
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {showDayDropdown && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                            {DAY_NAMES.map((day, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        onChange(pattern, idx, weekOfMonth);
                                        setShowDayDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Week of Month Selector (only for monthly pattern) */}
            {needsWeekOfMonth && (
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">
                        Pekan Ke-
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowWeekDropdown(!showWeekDropdown)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all flex items-center justify-between"
                        >
                            <span>Pekan {weekOfMonth || 1}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {showWeekDropdown && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                                {[1, 2, 3, 4].map(week => (
                                    <button
                                        key={week}
                                        type="button"
                                        onClick={() => {
                                            onChange(pattern, dayOfWeek, week);
                                            setShowWeekDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                    >
                                        Pekan {week}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
