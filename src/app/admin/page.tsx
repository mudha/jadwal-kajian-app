import { getAdminStats } from '@/lib/db-stats';
import { formatIndoDate } from '@/lib/date-utils';
import Link from 'next/link';
import {
    Calendar,
    MapPin,
    Users,
    Radio,
    PlusCircle,
    Upload,
    ArrowRight,
    Clock,
    ExternalLink
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();
    const todayDate = formatIndoDate(new Date());

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10">
                    <p className="text-blue-200 font-medium mb-1">Assalamualaikum, Admin</p>
                    <h1 className="text-3xl font-bold tracking-tight">Selamat Datang di Dashboard</h1>
                    <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        {todayDate}
                    </p>
                </div>

                <div className="relative z-10 flex gap-3">
                    <Link href="/" target="_blank" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-white/10">
                        <ExternalLink className="w-4 h-4" />
                        Lihat Web
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Kajian Hari Ini"
                    value={stats.jadwalHariIni}
                    icon={Radio}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                    desc="Aktif hari ini"
                />
                <StatCard
                    title="Total Jadwal"
                    value={stats.totalJadwal}
                    icon={Calendar}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                    desc="Semua database"
                />
                <StatCard
                    title="Total Ustadz"
                    value={stats.totalUstadz}
                    icon={Users}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                    desc="Terdaftar"
                />
                <StatCard
                    title="Total Masjid"
                    value={stats.totalMasjid}
                    icon={MapPin}
                    color="text-orange-500"
                    bg="bg-orange-500/10"
                    desc="Lokasi aktif"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions (Hero) */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg">Aksi Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/admin/batch-input" className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Upload className="w-32 h-32 -mr-10 -mt-10 transform rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-xl mb-1">Input Massal (AI)</h3>
                                <p className="text-blue-100 text-sm mb-4 opacity-90">Scan poster atau paste broadcast WA untuk ekstrak jadwal otomatis.</p>
                                <span className="inline-flex items-center gap-1 text-sm font-bold bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md group-hover:bg-white/30 transition-colors">
                                    Mulai Input <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>

                        <Link href="/admin/manage" className="group bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <PlusCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-1">Kelola Jadwal</h3>
                            <p className="text-slate-500 text-sm mb-4">Edit, hapus, atau tambah jadwal kajian secara manual.</p>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2 transition-all">
                                Ke Tabel Data <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>

                        <Link href="/admin/analytics" className="group bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 shadow-sm hover:border-purple-400 hover:shadow-md transition-all">
                            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-1">Statistik</h3>
                            <p className="text-slate-500 text-sm mb-4">Lihat trafik pengunjung, lokasi, device, dan tren.</p>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 group-hover:gap-2 transition-all">
                                Buka Dashboard <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>

                    {/* Recent Kajian List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Baru Ditambahkan</h3>
                            <Link href="/admin/manage" className="text-xs font-bold text-blue-600 hover:text-blue-700">Lihat Semua</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {stats.recentKajian.length > 0 ? (
                                stats.recentKajian.map((k: any) => (
                                    <div key={k.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500 text-xs">
                                            {k.id}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 text-sm truncate">{k.tema}</h4>
                                            <p className="text-xs text-slate-500 truncate">{k.pemateri} • {k.date}</p>
                                        </div>
                                        <div className="text-xs font-medium text-slate-400 whitespace-nowrap hidden sm:block">
                                            {k.city}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm">Belum ada data jadwal.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Column (Updates / Info) */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 text-lg">Status Sistem</h3>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Database</span>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">Connected</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Versi App</span>
                            <span className="text-xs font-bold text-slate-900">v1.0.2</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>

                        <div>
                            <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Tips Admin</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Gunakan fitur <b>Input Massal</b> untuk menghemat waktu. Cukup paste teks broadcast WA, AI akan mendeteksi tanggal & jam otomatis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg, desc }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
    );
}
