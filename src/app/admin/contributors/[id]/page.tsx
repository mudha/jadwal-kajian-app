'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Shield, ShieldCheck, Clock, MapPin, Calendar, FileText } from 'lucide-react';

interface Kajian {
    id: number;
    tema: string;
    pemateri: string;
    masjid: string;
    date: string;
    waktu: string;
    imageUrl?: string;
    is_canceled?: boolean;
}

interface AdminDetail {
    id: number;
    username: string;
    fullName: string;
    role: string;
    createdAt: string;
}

export default function ContributorDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [admin, setAdmin] = useState<AdminDetail | null>(null);
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/contributors/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAdmin(data.admin);
                    setKajianList(data.kajian);
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;
    if (!admin) return <div className="p-8 text-center text-red-500">Kontributor tidak ditemukan</div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link href="/admin/contributors" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>

                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${admin.role === 'SUPER_ADMIN'
                                ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200'
                                : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200'
                            }`}>
                            {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="w-10 h-10 text-white" /> : <Shield className="w-10 h-10 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{admin.fullName || admin.username}</h1>
                            <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" /> @{admin.username}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="uppercase tracking-wide text-xs font-bold">{admin.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Input</p>
                            <p className="text-2xl font-black text-slate-900">{kajianList.length} <span className="text-sm font-bold text-slate-400">Kajian</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kajian List */}
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-4 px-2">Riwayat Input Data</h2>

                {kajianList.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center border-dashed">
                        <p className="text-slate-400 font-bold">Belum ada data kajian yang diinput.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kajianList.map((kajian) => (
                            <Link href={`/kajian/${kajian.id}`} key={kajian.id} target="_blank" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4 group">
                                <div className="w-20 h-20 bg-slate-100 rounded-xl shrink-0 overflow-hidden relative">
                                    <img
                                        src={kajian.imageUrl || '/images/default-kajian.png'}
                                        alt={kajian.tema}
                                        className="w-full h-full object-cover"
                                    />
                                    {kajian.is_canceled && (
                                        <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center">
                                            <span className="text-[10px] font-black text-white">LIBUR</span>
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-teal-600 uppercase bg-teal-50 px-1.5 py-0.5 rounded">{kajian.date}</span>
                                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <Clock className="w-2.5 h-2.5" /> {kajian.waktu}
                                        </span>
                                    </div>
                                    <h3 className={`font-bold text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors ${kajian.is_canceled ? 'line-through text-slate-400' : ''}`}>
                                        {kajian.tema}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">{kajian.pemateri}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                                        <MapPin className="w-3 h-3" />
                                        {kajian.masjid}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
