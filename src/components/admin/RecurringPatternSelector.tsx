'use client';

import { RecurringPattern, bitmaskToWeeks, weeksToBitmask } from '@/lib/recurring-generator';
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
    { value: 'custom', label: 'Kustom (Pilih pekan spesifik)' },
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
    const isCustom = pattern === 'custom';

    // For custom pattern, get selected weeks from bitmask
    const selectedWeeks = isCustom ? bitmaskToWeeks(weekOfMonth || 0) : [];

    const toggleWeek = (week: number) => {
        const newWeeks = selectedWeeks.includes(week)
            ? selectedWeeks.filter(w => w !== week)
            : [...selectedWeeks, week];

        const newBitmask = weeksToBitmask(newWeeks);
        onChange(pattern, dayOfWeek, newBitmask);
    };

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
                                        // Default to week 1 for monthly, empty strict for custom (0)
                                        const defaultWeek = p.value === 'monthly' ? 1 : (p.value === 'custom' ? 0 : undefined);
                                        onChange(p.value, dayOfWeek, defaultWeek);
                                        setShowPatternDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
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
                                    className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
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
                                        className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                    >
                                        Pekan {week}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Weeks Selector */}
            {isCustom && (
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-widest">
                        Pilih Pekan
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map(week => {
                            const isSelected = selectedWeeks.includes(week);
                            return (
                                <button
                                    key={week}
                                    type="button"
                                    onClick={() => toggleWeek(week)}
                                    className={`
                                        w-10 h-10 rounded-lg text-sm font-bold transition-all border-2
                                        ${isSelected
                                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-white'}
                                    `}
                                >
                                    {week}
                                </button>
                            );
                        })}
                    </div>
                    {selectedWeeks.length === 0 && (
                        <p className="mt-2 text-xs text-red-500 font-medium">
                            * Pilih minimal satu pekan
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

