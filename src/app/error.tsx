'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('App Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-slate-500 max-w-xs mb-8">
                Maaf, ada kendala teknis saat memuat halaman ini. Silakan coba muat ulang.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                    onClick={reset}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold"
                >
                    <RefreshCw className="w-4 h-4" />
                    Coba Lagi
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                    <Home className="w-4 h-4" />
                    Ke Beranda
                </Link>
            </div>
        </div>
    );
}
