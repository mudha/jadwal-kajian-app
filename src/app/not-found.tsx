import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
            <h1 className="text-9xl font-black text-slate-100 select-none">404</h1>

            <div className="relative -mt-16 mb-8">
                <div className="text-2xl font-bold text-slate-900">
                    Halaman Tidak Ditemukan
                </div>
                <div className="w-16 h-1 bg-teal-500 mx-auto mt-2 rounded-full"></div>
            </div>

            <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                Halaman yang Anda cari mungkin sudah dihapus, dipindahkan, atau memang belum pernah ada.
            </p>

            <div className="grid gap-3 w-full max-w-xs">
                <Link
                    href="/kajian"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold shadow-lg shadow-teal-200"
                >
                    <Search className="w-4 h-4" />
                    Cari Kajian
                </Link>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                    <Home className="w-4 h-4" />
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
