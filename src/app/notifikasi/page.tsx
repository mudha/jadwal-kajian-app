'use client';
import { BellRing } from 'lucide-react';
import Link from 'next/link';

export default function NotifikasiPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-teal-600 text-white px-6 py-4">
                <h1 className="text-xl font-bold">Notifikasi</h1>
            </header>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center px-6 py-20">
                <div className="bg-slate-200 p-8 rounded-3xl mb-6">
                    <BellRing className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-slate-400 text-center mb-2 max-w-xs">
                    Menampilkan daftar notifikasi.
                </p>
                <p className="text-slate-500 font-bold text-lg mb-6">
                    Silakan Login Terlebih Dahulu
                </p>
                <Link
                    href="/login"
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold transition-colors"
                >
                    Login
                </Link>
            </div>
        </div>
    );
}
