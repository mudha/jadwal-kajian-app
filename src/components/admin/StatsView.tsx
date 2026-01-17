'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    Eye,
    Users,
    MessageCircle,
    ThumbsUp,
    MapPin,
    Globe,
    ArrowUpRight,
    Calendar,
    Search
} from 'lucide-react';
import { useState } from 'react';

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

    // Mock Referrers Data (since we don't have this in DB yet)
    const referrers = [
        { name: 'Google Search', count: Math.floor(stats.totalVisitors * 0.45), url: 'google.com' },
        { name: 'Direct', count: Math.floor(stats.totalVisitors * 0.30), url: 'portalkajian.online' },
        { name: 'WhatsApp', count: Math.floor(stats.totalVisitors * 0.15), url: 'whatsapp.com' },
        { name: 'Facebook', count: Math.floor(stats.totalVisitors * 0.05), url: 'facebook.com' },
        { name: 'Other', count: Math.floor(stats.totalVisitors * 0.05), url: '-' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Traffic Chart Section */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Traffic Overview</h2>
                        <p className="text-slate-500 text-sm">Visualisasi data pengunjung harian, mingguan, dan bulanan.</p>
                    </div>
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        {['Days', 'Weeks', 'Months'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatXAxis}
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
                                fill="#2563eb"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                activeBar={{ fill: '#1d4ed8' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <SimpleStatCard
                    label="Active Viewers"
                    value={stats.visitors24h}
                    subvalue="+12% since yesterday"
                    subColor="text-emerald-500"
                    icon={Eye}
                />
                <SimpleStatCard
                    label="Total Visitors"
                    value={stats.totalVisitors}
                    subvalue="All time unique"
                    icon={Users}
                />
                <SimpleStatCard
                    label="Total Jadwal"
                    value={stats.totalJadwal}
                    subvalue={`${stats.jadwalHariIni} today`}
                    icon={Calendar}
                />
                <SimpleStatCard
                    label="Comments"
                    value="0"
                    subvalue="Not enabled"
                    icon={MessageCircle}
                />
            </div>

            {/* Split View: Posts & Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Viewed Posts */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Recent Updates</h3>
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Posts & Pages</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Title</th>
                                    <th className="px-6 py-3 font-semibold text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stats.recentKajian.length > 0 ? stats.recentKajian.map((post: any) => (
                                    <tr key={post.id} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 line-clamp-1">{post.tema}</div>
                                            <div className="text-xs text-slate-500">{post.pemateri}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-bold text-slate-700">
                                                {(post.id * 7) % 50 + 12} {/* Mock views per post (Deterministic for hydration) */}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-400">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto">
                            View all posts <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Referrers */}
                <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Top Referrers</h3>
                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Traffic Sources</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Source</th>
                                    <th className="px-6 py-3 font-semibold text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {referrers.map((ref, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-blue-600 hover:underline cursor-pointer">{ref.name}</div>
                                            <div className="text-xs text-slate-500">{ref.url}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-mono font-bold text-slate-700">{ref.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Locations Map Mockup */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Locations</h3>
                        <p className="text-sm text-slate-500">Top visiting cities</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                        <button
                            onClick={() => setLocationTab('cities')}
                            className={`px-3 py-1 rounded shadow-sm transition-all ${locationTab === 'cities' ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Cities
                        </button>
                        <button
                            onClick={() => setLocationTab('countries')}
                            className={`px-3 py-1 rounded shadow-sm transition-all ${locationTab === 'countries' ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Countries
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Visual Map (Placeholder using simple CSS/SVG) */}
                    {/* Visual Map (Abstract) */}
                    <div className="bg-slate-900 rounded-xl aspect-[16/9] flex items-center justify-center relative overflow-hidden border border-slate-800 group">
                        {/* World Map Backdrop (Abstract) */}
                        <Globe className="w-64 h-64 text-slate-800/50 absolute -right-10 -bottom-10" strokeWidth={0.5} />
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-contain bg-no-repeat bg-center opacity-20 invert"></div>

                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 shadow-lg">
                                <p className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Live Visitor Map
                                </p>
                            </div>
                        </div>

                        {/* Dot Overlays */}
                        {locationData.length > 0 ? locationData.map((item: any, i: number) => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse"
                                style={{
                                    top: `${20 + ((i * 13) % 60)}%`,
                                    left: `${20 + ((i * 17) % 60)}%`,
                                    animationDelay: `${i * 0.5}s`
                                }}
                                title={`${item.name}: ${item.count} visitors`}
                            />
                        )) : (
                            // Mock dots if no data yet for visual appeal
                            [1, 2, 3, 4, 5].map((_, i) => (
                                <div
                                    key={`mock-${i}`}
                                    className="absolute w-2 h-2 bg-slate-600 rounded-full opacity-50"
                                    style={{
                                        top: `${30 + ((i * 23) % 40)}%`,
                                        left: `${30 + ((i * 29) % 40)}%`
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {/* Cities List */}
                    <div className="space-y-4">
                        {locationData.length > 0 ? locationData.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-700">{item.name || 'Unknown'}</span>
                                </div>
                                <div className="font-mono font-bold text-slate-900">{item.count}</div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 italic py-8">No {locationLabel.toLowerCase()} data available yet.</div>
                        )}
                        <button
                            onClick={() => alert("Laporan lengkap akan tersedia di update berikutnya!")}
                            className="w-full py-2 mt-2 text-sm text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            View Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SimpleStatCard({ label, value, subvalue, icon: Icon, subColor = "text-slate-400" }: any) {
    return (
        <div className="bg-white border border-slate-200 p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</div>
                <Icon className="w-5 h-5 text-slate-300" />
            </div>
            <div>
                <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
                <div className={`text-xs font-bold ${subColor}`}>{subvalue}</div>
            </div>
        </div>
    );
}
