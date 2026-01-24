'use client';
import { useState, useEffect } from 'react';
import { Check, X, Loader2, Clock, Mail, User, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Application {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    motivation: string;
    token_expires_at?: number;
}

export default function PendingContributorsList() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/pending-contributors');
            const data = await res.json();
            // console.log('Pending data:', data); 
            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'menyetujui' : 'menolak'} pendaftar ini?`)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/pending-contributors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action })
            });

            if (res.ok) {
                setApplications(prev => prev.filter(app => app.id !== id));
                router.refresh(); // Refresh pending counts in layout
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal memproses permintaan');
            }
        } catch (error) {
            alert('Terjadi kesalahan sistem');
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return <div className="py-12 text-center text-slate-500">Memuat data...</div>;

    if (applications.length === 0) {
        return (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                    <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Semua Bersih!</h3>
                <p className="text-slate-500 mt-1">Tidak ada permintaan pendaftaran kontributor baru saat ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {applications.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-all">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-black text-lg text-slate-900">{app.fullName}</h3>
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded textxs font-bold uppercase tracking-wider text-[10px]">
                                @{app.username}
                            </span>
                        </div>

                        <div className="space-y-1 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" /> {app.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" /> {app.phoneNumber || '-'}
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Alasan Bergabung</p>
                            <p className="text-slate-700 italic">"{app.motivation || 'Tidak ada alasan'}"</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:flex-col shrink-0">
                        <button
                            onClick={() => handleAction(app.id, 'approve')}
                            disabled={!!processingId}
                            className="flex-1 md:w-full px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Setujui
                        </button>
                        <button
                            onClick={() => handleAction(app.id, 'reject')}
                            disabled={!!processingId}
                            className="flex-1 md:w-full px-5 py-2.5 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                            Tolak
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
