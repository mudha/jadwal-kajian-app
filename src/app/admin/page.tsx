import Link from 'next/link';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import {
    ShieldCheck,
    ArrowRight,
    ExternalLink,
    Plus,
    Calendar,
    Upload,
    Map as MapIconImport,
    Users,
    AlertTriangle,
    Moon
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    // Get Session Data for Greeting & Permissions
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    let fullName = 'Admin';
    let role = '';

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            fullName = session.fullName || session.username || 'Admin';
            role = session.role || '';
        } catch (e) {
            console.error("Failed to parse session", e);
        }
    }

    const isContributor = role === 'CONTRIBUTOR';
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

    // Fetch pending contributors count (Server Side)
    let pendingContributorsCount = 0;
    if (isAdmin) {
        try {
            const result = await db.execute(`
                SELECT COUNT(*) as count 
                FROM contributor_applications 
                WHERE status = 'pending'
            `);
            pendingContributorsCount = Number(result.rows[0].count ?? 0);
        } catch (error) {
            console.error("Failed to fetch pending contributors", error);
        }
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-500/20 md:block hidden shadow-lg shadow-blue-900/20">
                        <ShieldCheck className="w-10 h-10 text-blue-400 drop-shadow-md" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-3 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            Admin Panel v2.0
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Assalamu'alaikum, <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">{fullName}</span>
                        </h1>
                        <p className="text-slate-400 text-base max-w-lg leading-relaxed">
                            Selamat bertugas. Semoga hari ini penuh keberkahan dan kemudahan dalam mengelola data kajian.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pending Contributors Alert */}
            {isAdmin && pendingContributorsCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {pendingContributorsCount} Pendaftar Kontributor Menunggu Persetujuan
                            </h3>
                            <p className="text-slate-600 text-sm">
                                Ada pendaftar baru yang menunggu verifikasi Anda. Segera tinjau aplikasi mereka.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/admin/contributors"
                        className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 whitespace-nowrap"
                    >
                        Tinjau Sekarang
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Add Schedule (Primary Action) */}
                <Link href="/admin/input" className="group relative overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Input Kajian Baru</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Tambahkan jadwal kajian baru secara manual atau gunakan form wizard.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-blue-600 font-bold text-sm">
                            Mulai Input <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* 2. AI Input (Feature Highlight) */}
                {!isContributor && (
                    <Link href="/admin/batch-input" className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Upload className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Input Massal AI</h2>
                                <p className="text-indigo-100 text-sm leading-relaxed">
                                    Ekstrak info kajian dari poster/teks secara instan dengan AI.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center text-white font-bold text-sm">
                                Coba Sekarang <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                )}

                {/* 3. Recurring Kajian (New Feature) */}
                <Link href="/admin/recurring-kajian" className="group relative overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar className="w-32 h-32 -mr-8 -mt-8 rotate-12 text-purple-600" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Jadwal Kajian Rutin</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Kelola template kajian rutin (Pekanan/Bulanan) yang otomatis digenerate.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-purple-600 font-bold text-sm">
                            Kelola Rutin <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* 4. Maps (Visual) */}
                <Link href="/admin/map" className="group relative overflow-hidden bg-white text-slate-900 border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MapIconImport className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MapIconImport className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold mb-2">Peta Sebaran</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Lihat visualisasi lokasi kajian aktif di peta interaktif.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center text-emerald-600 font-bold text-sm">
                            Buka Peta <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* 5. Imam Tarawih (Ramadhan Feature) */}
                {isAdmin && (
                    <Link href="/admin/tarawih" className="group relative overflow-hidden bg-gradient-to-br from-emerald-900 to-teal-800 text-white rounded-[2rem] p-8 shadow-lg hover:shadow-2xl hover:shadow-emerald-900/40 hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Moon className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-2xl">
                                    🌙
                                </div>
                                <h2 className="text-xl font-bold mb-2">Imam Tarawih</h2>
                                <p className="text-emerald-200 text-sm leading-relaxed">
                                    Input jadwal imam tarawih Ramadhan dari tabel DKM secara massal.
                                </p>
                            </div>
                            <div className="mt-8 flex items-center text-yellow-300 font-bold text-sm">
                                Input Jadwal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Footer Links */}
            <div className="flex justify-center pt-8 border-t border-slate-100">
                <Link href="/" target="_blank" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium">
                    Lihat Aplikasi Live <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}
