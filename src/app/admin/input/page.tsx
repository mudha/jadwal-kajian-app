'use client';
import Link from 'next/link';
import { FileInput, PenTool, Sparkles, ArrowRight, Keyboard } from 'lucide-react';

export default function InputSelectionPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pilih Metode Input</h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Anda dapat memasukkan jadwal kajian secara manual atau menggunakan kecerdasan buatan (AI) untuk mengekstrak data dari poster/teks.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Manual Input Card */}
                <Link
                    href="/admin/batch-input?mode=manual"
                    className="group relative bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-blue-500 transition-all" />

                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-blue-500/30">
                        <Keyboard className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Input Manual</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                        Isi formulir jadwal satu per satu secara detail. Cocok untuk input data satuan yang presisi.
                    </p>

                    <div className="mt-auto flex items-center gap-2 font-bold text-slate-400 group-hover:text-blue-600 transition-colors bg-slate-50 group-hover:bg-blue-50 px-6 py-3 rounded-xl text-sm">
                        Mulai Input Manual
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>

                {/* AI / Mass Input Card */}
                <Link
                    href="/admin/batch-input"
                    className="group relative bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-violet-500 transition-all" />

                    {/* Badge */}
                    <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-[10px] font-black uppercase tracking-wider text-violet-700">
                        <Sparkles className="w-3 h-3" />
                        AI Power
                    </div>

                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-violet-500/30">
                        <FileInput className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-violet-600 transition-colors">Input Massal AI</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 px-4">
                        Upload gambar poster atau paste teks broadcast WhatsApp. AI akan otomatis mengekstrak data untuk Anda.
                    </p>

                    <div className="mt-auto flex items-center gap-2 font-bold text-slate-400 group-hover:text-violet-600 transition-colors bg-slate-50 group-hover:bg-violet-50 px-6 py-3 rounded-xl text-sm">
                        Coba Fitur AI
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
