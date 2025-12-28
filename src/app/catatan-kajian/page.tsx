'use client';

import { ArrowLeft, FileText, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CatatanKajianPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Catatan Kajian</h1>
                            <p className="text-indigo-100 text-sm font-medium mt-1">Kumpulan ringkasan kajian ilmiah</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Empty State */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="font-bold text-2xl text-slate-900 mb-3">Segera Hadir</h2>
                    <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
                        Fitur catatan kajian sedang dalam pengembangan. Nantikan koleksi ringkasan kajian ilmiah yang bermanfaat.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
