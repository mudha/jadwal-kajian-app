'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Eye,
    Users,
    MessageCircle,
    Smartphone,
    MapPin,
    Globe,
    ArrowUpRight,
    Calendar,
    Search,
    Mosque,
    Moon,
    BookOpen,
    UserCheck,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface StatsViewProps {
    stats: any;
}

export default function StatsView({ stats }: StatsViewProps) {
    const [timeRange, setTimeRange] = useState('Days');
    const [locationTab, setLocationTab] = useState<'cities' | 'countries'>('cities');

    const locationData = locationTab === 'cities' ? stats.topCities : (stats.topCountries || []);
    const locationLabel = locationTab === 'cities' ? 'Cities' : 'Countries';

    // Select data based on timeRange
    let chartData = [];
    if (timeRange === 'Days') {
        chartData = stats.dailyViews.length > 0 ? stats.dailyViews : [
            { date: 'Mon', count: 0 }, { date: 'Tue', count: 0 }, { date: 'Wed', count: 0 },
            { date: 'Thu', count: 0 }, { date: 'Fri', count: 0 }, { date: 'Sat', count: 0 }, { date: 'Sun', count: 0 }
        ];
    } else if (timeRange === 'Weeks') {
        chartData = stats.weeklyViews && stats.weeklyViews.length > 0 ? stats.weeklyViews : [];
    } else {
        chartData = stats.monthlyViews && stats.monthlyViews.length > 0 ? stats.monthlyViews : [];
    }

    const formatXAxis = (val: string) => {
        if (!val) return '';
        if (timeRange === 'Days') return val.split('-').slice(1).join('/'); // MM/DD
        if (timeRange === 'Weeks') return `W${val.split('-')[1]}`; // Wxx
        return val; // YYYY-MM
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Moon className="w-8 h-8 text-emerald-600 fill-emerald-100" />
                        Assalamualaikum, Admin
                    </h1>
                    <p className="text-slate-500 mt-1">Pantau perkembangan dakwah dan jadwal kajian hari ini.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-100 shadow-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Kajian"
                    value={stats.totalJadwal}
                    trend={stats.jadwalTrend}
                    icon={BookOpen}
                    color="emerald"
                />
                <StatCard
                    title="Jadwal Hari Ini"
                    value={stats.jadwalHariIni}
                    subtitle="Kajian aktif sekarang"
                    icon={Calendar}
                    color="amber"
                />
                <StatCard
                    title="Total Masjid"
                    value={stats.totalMasjid}
                    subtitle="Masjid terdaftar"
                    icon={Mosque}
                    color="blue"
                />
                <StatCard
                    title="Total Ustadz"
                    value={stats.totalUstadz}
                    subtitle="Pemateri aktif"
                    icon={UserCheck}
                    color="violet"
                />
            </div>

            {/* Traffic Analytics Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Statistik Pengunjung
                        </h2>
                        <p className="text-slate-500 text-sm">Grafik kunjungan website berdasarkan waktu.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['Days', 'Weeks', 'Months'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === range
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[320px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatXAxis}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#barGradient)"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                                activeBar={{ fill: '#047857' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Grid: Map & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Location Map */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg group">
                    <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center opacity-20 invert"></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/90 pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Globe className="w-5 h-5 text-emerald-400" />
                                Peta Sebaran Jamaah
                            </h3>
                            <p className="text-slate-400 text-sm">Lokasi pengunjung terbanyak.</p>
                        </div>
                        <div className="flex bg-slate-800 p-1 rounded-lg text-xs font-bold border border-slate-700">
                            <button
                                onClick={() => setLocationTab('cities')}
                                className={`px-3 py-1 rounded transition-all ${locationTab === 'cities' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Kota
                            </button>
                            <button
                                onClick={() => setLocationTab('countries')}
                                className={`px-3 py-1 rounded transition-all ${locationTab === 'countries' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                Negara
                            </button>
                        </div>
                    </div>

                    <div className="relative h-[200px] w-full flex items-center justify-center mb-6">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20"></span>
                                <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-emerald-400 font-bold text-xs">Live Visitor Map</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {locationData.length > 0 ? locationData.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-slate-700 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-200">{item.name || 'Unknown'}</span>
                                </div>
                                <div className="font-mono font-bold text-emerald-400">{item.count}</div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 italic py-4">Belum ada data lokasi.</div>
                        )}
                        <button
                            onClick={() => alert("Laporan lengkap akan tersedia di update berikutnya!")}
                            className="w-full py-2.5 mt-2 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all uppercase tracking-wide"
                        >
                            View Full Report
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Top Content */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-600" />
                                Kajian Paling Diminati
                            </h3>
                            <Link href="/admin/kelola-jadwal" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                Lihat Semua <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {stats.recentKajian.length > 0 ? stats.recentKajian.map((post: any) => (
                                <div key={post.id} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 line-clamp-1">{post.tema}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{post.pemateri}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-700">{post.view_count || 0}</p>
                                        <p className="text-[10px] text-slate-400">views</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-slate-400 py-8">Belum ada data kajian.</p>
                            )}
                        </div>
                    </div>

                    {/* Top Devices */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-violet-600" />
                                Akses Perangkat
                            </h3>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-violet-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                <Smartphone className="w-6 h-6 text-violet-600 mb-2" />
                                {stats.topBrowsers?.find((b: any) => b.name === 'Mobile' || b.name === 'mobile')?.count || 0}
                                <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Mobile</div>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                <Globe className="w-6 h-6 text-slate-500 mb-2" />
                                {stats.totalVisitors - (stats.topBrowsers?.find((b: any) => b.name === 'Mobile' || b.name === 'mobile')?.count || 0)}
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Desktop / Other</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, trend, icon: Icon, color }: any) {
    const colorStyles = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        violet: "bg-violet-50 text-violet-600 border-violet-100",
    };

    const styles = colorStyles[color as keyof typeof colorStyles] || colorStyles.emerald;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${styles}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-2 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
}
