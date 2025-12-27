import { getAdminStats } from '@/lib/db-stats';
import { formatIndoDate } from '@/lib/date-utils';
import Link from 'next/link';
import {
    Calendar,
    MapPin,
    Users,
    Radio,
    Upload,
    ArrowRight,
    Clock,
    ExternalLink,
    Zap,
    TrendingUp,
    ShieldCheck,
    Search
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();
    const todayDate = formatIndoDate(new Date());

    return (
        <div className="space-y-8">
            {/* Hero Header Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Card - Wider */}
                <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl flex flex-col justify-between min-h-[250px] border border-slate-800">
                    {/* Abstract Background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-200 mb-3 backdrop-blur-md">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Admin Panel v2.0
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
                                Assalamu'alaikum, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Admin.</span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
                                Pantau dan kelola jadwal kajian dengan kekuatan AI. Semua data dalam satu kendali.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-4 mt-8">
                        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="font-medium text-slate-200">{todayDate}</span>
                        </div>
                        <Link href="/" target="_blank" className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold hover:bg-blue-50 transition-all">
                            Lihat Aplikasi
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Column */}
                <div className="grid grid-rows-3 gap-6 h-full">
                    <StatCard
                        title="Kajian Hari Ini"
                        value={stats.jadwalHariIni}
                        icon={Radio}
                        theme="emerald"
                        trend="+12% dari kemarin"
                    />
                    <StatCard
                        title="Total Jadwal"
                        value={stats.totalJadwal}
                        icon={Calendar}
                        theme="blue"
                        trend="Database aktif"
                    />
                    {/* Search Quick Access */}
                    <Link href="/admin/manage" className="row-span-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 transition-all group flex flex-col justify-center gap-2 cursor-text">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Search className="w-6 h-6" />
                            <span className="text-lg font-medium">Cari jadwal, ustadz...</span>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full w-0 bg-blue-500 group-hover:w-full transition-all duration-500"></div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Core Metrics & Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* AI Import Action - Large Square */}
                <Link href="/admin/batch-input" className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[2.5rem] p-8 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/20 transition-all group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <Zap className="w-48 h-48 -mr-16 -mt-16 rotate-12" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                                <Upload className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Input Massal AI</h2>
                            <p className="text-indigo-100/80 max-w-sm leading-relaxed">
                                Ekstrak info kajian dari poster atau teks broadcast WA secara instan menggunakan AI termutakhir.
                            </p>
                        </div>
                        <div className="mt-8 flex items-center gap-2 font-bold text-lg">
                            Mulai Sekarang <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Secondary Stats */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-purple-200 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" /> Popular
                        </span>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-slate-900 mb-1">{stats.totalUstadz}</div>
                        <div className="text-slate-500 font-medium">Ustadz Terdaftar</div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-orange-200 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <div className="text-4xl font-black text-slate-900 mb-1">{stats.totalMasjid}</div>
                        <div className="text-slate-500 font-medium">Masjid & Lokasi</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Jadwal Terbaru</h3>
                            <p className="text-slate-500 text-sm">Update terakhir database kajian.</p>
                        </div>
                        <Link href="/admin/manage" className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {stats.recentKajian.length > 0 ? (
                            stats.recentKajian.map((k: any, i: number) => (
                                <div key={k.id} className="p-6 hover:bg-slate-50/80 transition-colors group flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-sm">
                                        #{k.id}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 text-base mb-1 truncate group-hover:text-blue-600 transition-colors">{k.tema}</h4>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                                                <Users className="w-3 h-3" /> {k.pemateri}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{k.date}</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-right">
                                        <div className="text-sm font-bold text-slate-700">{k.city}</div>
                                        <div className="text-xs text-slate-400">Lokasi</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-slate-400">Belum ada data jadwal.</div>
                        )}
                    </div>
                </div>

                {/* System Status Panel */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-between min-h-[400px] border border-white/10">
                    <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            System Live
                        </h3>

                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="text-sm text-slate-400 mb-1">Database Latency</div>
                                <div className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-2">
                                    24ms <span className="text-xs font-sans font-medium text-slate-500 bg-white/10 px-2 py-0.5 rounded-full">Excellent</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="text-sm text-slate-400 mb-1">Total Requests</div>
                                <div className="text-2xl font-mono font-bold text-blue-400">
                                    1.2k <span className="text-xs text-slate-500 font-sans font-medium">/ 24h</span>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="text-sm text-slate-400 mb-1">Next Scheduler</div>
                                <div className="text-lg font-medium text-slate-200">
                                    03:00 WIB
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <p className="text-xs text-slate-500 leading-relaxed">
                            <span className="font-bold text-slate-300">Pro Tip:</span> Gunakan fitur deteksi duplikat secara berkala untuk menjaga kebersihan database masjid dan ustadz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, theme, trend }: any) {
    const isEmerald = theme === 'emerald';

    return (
        <div className={`relative overflow-hidden rounded-[2.5rem] p-6 flex flex-col justify-center h-full border transition-all hover:scale-[1.02] ${isEmerald
            ? 'bg-emerald-50 border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/10'
            : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2.5 rounded-xl ${isEmerald ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {isEmerald && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>}
            </div>
            <div>
                <h3 className="text-3xl font-black text-slate-900 mb-1">{value}</h3>
                <p className="font-bold text-sm text-slate-500 mb-0.5">{title}</p>
                <p className={`text-xs font-semibold ${isEmerald ? 'text-emerald-600' : 'text-slate-400'}`}>{trend}</p>
            </div>
        </div>
    );
}
