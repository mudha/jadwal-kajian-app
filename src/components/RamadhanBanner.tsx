'use client';

import { useEffect, useState } from 'react';
import { isRamadhan } from '@/lib/date-utils';

export default function RamadhanBanner() {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!isRamadhan()) return;
        const wasDismissed = sessionStorage.getItem('ramadhan-banner-dismissed');
        if (!wasDismissed) setShow(true);
    }, []);

    if (!show || dismissed) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl mb-6 shadow-lg">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950" />

            {/* Decorative stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-yellow-200 opacity-60 animate-pulse"
                        style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animationDelay: Math.random() * 3 + 's',
                            animationDuration: Math.random() * 2 + 2 + 's',
                        }}
                    />
                ))}
            </div>

            {/* Crescent moon decoration */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-yellow-300 select-none pointer-events-none text-8xl">
                🌙
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">🌙</div>
                    <div>
                        <h2 className="text-white font-black text-lg leading-tight">
                            Ramadhan Mubarak 1447 H
                        </h2>
                        <p className="text-emerald-200 text-xs font-medium mt-0.5">
                            Selamat menunaikan ibadah puasa. Semoga amal ibadah kita diterima Allah ﷻ
                        </p>
                        <p className="text-yellow-300 text-[10px] font-bold mt-1 tracking-wide">
                            ✨ Kajian rutin libur selama Ramadhan — cek kajian tematik di bawah
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setDismissed(true);
                        sessionStorage.setItem('ramadhan-banner-dismissed', '1');
                    }}
                    className="shrink-0 text-emerald-300 hover:text-white transition-colors p-1"
                    aria-label="Tutup banner"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
