'use client';

import { ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Hijri date types
interface HijriDate {
    year: number;
    month: number;
    day: number;
    monthName: string;
}

const HIJRI_MONTHS = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' ath-Thani',
    'Jumada al-Ula', 'Jumada ath-Thaniyah', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhul-Qa\'dah', 'Dhul-Hijjah'
];

const GREGORIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Simplified Hijri conversion (approximation - for production use proper library)
function toHijri(gregorianDate: Date): HijriDate {
    const gYear = gregorianDate.getFullYear();
    const gMonth = gregorianDate.getMonth();
    const gDay = gregorianDate.getDate();

    // Simplified conversion - this is an approximation
    // In production, use a proper Hijri calendar library
    const julianDay = Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
        Math.floor((367 * (gMonth - 2 - 12 * (Math.floor((gMonth - 14) / 12)))) / 12) -
        Math.floor((3 * (Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100))) / 4) +
        gDay - 32075;
    const hijriJD = julianDay - 1948440 + 10632;
    const y = Math.floor((30 * hijriJD + 10646) / 10631);
    const month = Math.min(12, Math.ceil((hijriJD - 29 - Math.floor((y - 1) * 10631 / 30)) / 29.5) + 1);
    const day = hijriJD - Math.floor((y - 1) * 10631 / 30) - Math.floor((month - 1) * 29.5) + 1;

    return {
        year: Math.floor(y),
        month: Math.floor(month),
        day: Math.floor(day),
        monthName: HIJRI_MONTHS[Math.floor(month) - 1] || 'Unknown'
    };
}

function isMondayOrThursday(date: Date): boolean {
    const day = date.getDay();
    return day === 1 || day === 4; // 1 = Monday, 4 = Thursday
}

function isAyyamulBidh(hijriDay: number): boolean {
    return hijriDay >= 13 && hijriDay <= 15;
}

function isArafah(hijriMonth: number, hijriDay: number): boolean {
    return hijriMonth === 12 && hijriDay === 9; // 9 Dhul Hijjah
}

function isAshura(hijriMonth: number, hijriDay: number): boolean {
    return hijriMonth === 1 && hijriDay === 10; // 10 Muharram
}

function isTasua(hijriMonth: number, hijriDay: number): boolean {
    return hijriMonth === 1 && hijriDay === 9; // 9 Muharram
}

function isFirst9DhulHijjah(hijriMonth: number, hijriDay: number): boolean {
    return hijriMonth === 12 && hijriDay >= 1 && hijriDay <= 9;
}

export default function KalenderPuasaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate calendar days
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getDayInfo = (day: number) => {
        const date = new Date(year, month, day);
        const hijri = toHijri(date);

        const mondayThursday = isMondayOrThursday(date);
        const ayyamulBidh = isAyyamulBidh(hijri.day);
        const arafah = isArafah(hijri.month, hijri.day);
        const ashura = isAshura(hijri.month, hijri.day);
        const tasua = isTasua(hijri.month, hijri.day);
        const first9DH = isFirst9DhulHijjah(hijri.month, hijri.day);

        let bgColor = '';
        let borderColor = '';
        let label = '';

        if (arafah) {
            bgColor = 'bg-gradient-to-br from-amber-100 to-amber-200';
            borderColor = 'border-2 border-amber-400';
            label = 'Arafah';
        } else if (ashura) {
            bgColor = 'bg-gradient-to-br from-blue-100 to-blue-200';
            borderColor = 'border-2 border-blue-400';
            label = 'Asyura';
        } else if (tasua) {
            bgColor = 'bg-blue-50';
            borderColor = 'border border-blue-200';
            label = 'Tasua';
        } else if (ayyamulBidh) {
            bgColor = 'bg-gradient-to-br from-teal-100 to-teal-200';
            borderColor = 'border border-teal-300';
            label = 'Bidh';
        } else if (mondayThursday) {
            bgColor = 'bg-green-50';
            borderColor = 'border border-green-200';
            label = date.getDay() === 1 ? 'Senin' : 'Kamis';
        } else if (first9DH) {
            bgColor = 'bg-green-50';
            borderColor = 'border border-green-300';
        }

        return { hijri, bgColor, borderColor, label, mondayThursday, ayyamulBidh, arafah, ashura, tasua, first9DH };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-br from-green-600 to-green-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Kalender Puasa Sunnah</h1>
                            <p className="text-green-100 text-sm font-medium mt-1">Jadwal puasa sunnah berdasarkan Masehi & Hijriyah</p>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="text-center">
                            <h2 className="font-bold text-xl">{GREGORIAN_MONTHS[month]} {year}</h2>
                            <p className="text-green-100 text-sm">{toHijri(currentDate).monthName} {toHijri(currentDate).year} H</p>
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Legend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-green-600" />
                        Keterangan Hari Puasa Sunnah
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-lg"></div>
                            <span className="text-sm text-slate-700">Senin/Kamis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 border border-teal-300 rounded-lg"></div>
                            <span className="text-sm text-slate-700">Ayyamul Bidh (13-15)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 rounded-lg"></div>
                            <span className="text-sm text-slate-700">Arafah (9 Dzulhijjah)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 rounded-lg"></div>
                            <span className="text-sm text-slate-700">Asyura (10 Muharram)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg"></div>
                            <span className="text-sm text-slate-700">Tasua (9 Muharram)</span>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                            <div key={day} className="text-center font-bold text-slate-600 text-sm py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const dayInfo = getDayInfo(day);
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`aspect-square rounded-xl p-2 transition-all hover:scale-105 ${dayInfo.bgColor} ${dayInfo.borderColor} ${isToday ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                                >
                                    <div className="text-sm font-bold text-slate-900">{day}</div>
                                    <div className="text-[8px] text-slate-600 mt-0.5">{dayInfo.hijri.day} {dayInfo.hijri.monthName.slice(0, 3)}</div>
                                    {dayInfo.label && (
                                        <div className="text-[8px] font-bold text-green-700 mt-0.5">{dayInfo.label}</div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl p-8 border border-green-100">
                    <h3 className="font-bold text-xl text-green-900 mb-4">Dalil Puasa Sunnah</h3>
                    <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                        <div>
                            <strong className="text-green-800">Puasa Senin & Kamis:</strong> Rasulullah ﷺ bersabda: "Amalan-amalan dihadapkan (kepada Allah) pada hari Senin dan Kamis, dan aku ingin amalanku dihadapkan sedangkan aku dalam keadaan berpuasa." (HR. Tirmidzi)
                        </div>
                        <div>
                            <strong className="text-green-800">Puasa Ayyamul Bidh:</strong> Puasa 3 hari di tengah bulan Hijriyah (13, 14, 15). Rasulullah ﷺ bersabda: "Jika engkau berpuasa 3 hari dalam sebulan, maka berpuasalah pada tanggal 13, 14, dan 15." (HR. Tirmidzi)
                        </div>
                        <div>
                            <strong className="text-green-800">Puasa Arafah:</strong> Puasa pada 9 Dhul Hijjah bagi yang tidak berhaji. Rasulullah ﷺ bersabda: "Puasa Arafah menghapus dosa 2 tahun." (HR. Muslim)
                        </div>
                        <div>
                            <strong className="text-green-800">Puasa Asyura & Tasua:</strong> Puasa 10 Muharram dan dianjurkan juga 9 Muharram. "Puasa Asyura menghapus dosa 1 tahun." (HR. Muslim)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
