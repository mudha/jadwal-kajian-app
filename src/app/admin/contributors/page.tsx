'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Shield, ShieldCheck, FileText, ChevronRight, Search, UserPlus, BarChart2 } from 'lucide-react';
import PendingContributorsList from '@/components/admin/PendingContributorsList';

interface Contributor {
    id: number;
    username: string;
    fullName: string;
    role: string;
    total_kajian: number;
}

export default function ContributorsPage() {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'performance'>('pending');

    useEffect(() => {
        fetchContributors();
    }, []);

    const fetchContributors = async () => {
        try {
            const res = await fetch('/api/admin/contributors');
            const data = await res.json();
            setContributors(data);
        } catch (error) {
            console.error('Failed to fetch contributors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContributors = contributors.filter(c =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kelola Kontributor</h1>
                    <p className="text-slate-500 font-bold mt-2">Setujui pendaftar baru dan pantau kinerja tim.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <UserPlus className="w-4 h-4" />
                    Permintaan
                </button>
                <button
                    onClick={() => setActiveTab('performance')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'performance'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <BarChart2 className="w-4 h-4" />
                    Kinerja
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'pending' ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl mb-8">
                        <h2 className="text-lg font-bold text-blue-900 mb-1">Permintaan Bergabung</h2>
                        <p className="text-blue-700 text-sm">Review dan setujui pendaftar yang ingin menjadi kontributor.</p>
                    </div>
                    <PendingContributorsList />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">Total Kontributor Aktif: <strong className="text-slate-900">{contributors.length}</strong></p>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari kontributor..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Memuat data...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredContributors.map((c) => (
                                <Link href={`/admin/contributors/${c.id}`} key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Users className="w-24 h-24" />
                                    </div>

                                    <div className="relative z-10 flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.role === 'SUPER_ADMIN'
                                                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200'
                                                    : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200'
                                                } shadow-md`}>
                                                {c.role === 'SUPER_ADMIN'
                                                    ? <ShieldCheck className="w-6 h-6 text-white" />
                                                    : <Shield className="w-6 h-6 text-white" />
                                                }
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{c.fullName || c.username}</h3>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{c.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="font-black text-slate-700">{c.total_kajian}</span>
                                            <span className="text-xs font-bold text-slate-400">Kajian</span>
                                        </div>

                                        <div className="p-2 rounded-full bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredContributors.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 border-dashed">
                            <p className="text-slate-400 font-bold">Tidak ada kontributor ditemukan</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
