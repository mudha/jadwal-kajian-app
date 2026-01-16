'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, User, Mail, MapPin, Phone, MessageSquare, Calendar, Loader2, AlertCircle } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

interface Application {
    id: number;
    username: string;
    email: string;
    fullName: string;
    region: string;
    city: string | null;
    phoneNumber: string | null;
    motivation: string | null;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function ContributorsManagementPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', id: number } | null>(null);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/admin/contributors/applications');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setApplications(data);
        } catch (err) {
            setError('Gagal memuat data pendaftar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleApprove = async (id: number) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/contributors/${id}/approve`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchApplications();
                setConfirmAction(null);
            } else {
                const data = await res.json();
                alert(data.details ? `Gagal: ${data.details}` : (data.error || 'Gagal menyetujui pendaftar'));
                return;
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: number) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/contributors/${id}/reject`, {
                method: 'POST'
            });
            if (res.ok) {
                await fetchApplications();
                setConfirmAction(null);
            } else {
                const data = await res.json();
                alert(data.error || 'Gagal menolak');
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setActionLoading(false);
        }
    };

    const pendingCount = applications.filter(a => a.status === 'pending').length;
    const approvedCount = applications.filter(a => a.status === 'approved').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kelola Pendaftar Kontributor</h1>
                <p className="text-slate-500 mt-2 font-bold">Review dan approve pendaftar kontributor baru</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Pending</p>
                    <p className="text-4xl font-black text-amber-700">{pendingCount}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Disetujui</p>
                    <p className="text-4xl font-black text-green-700">{approvedCount}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">Ditolak</p>
                    <p className="text-4xl font-black text-red-700">{rejectedCount}</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-bold">{error}</p>
                </div>
            )}

            {/* Applications List */}
            <div className="space-y-4">
                {applications.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                        <p className="text-slate-500 font-bold">Belum ada pendaftar</p>
                    </div>
                ) : (
                    applications.map(app => (
                        <div
                            key={app.id}
                            className={`bg-white rounded-2xl border-2 p-6 transition-all ${app.status === 'pending'
                                ? 'border-amber-200 hover:shadow-lg'
                                : app.status === 'approved'
                                    ? 'border-green-200 opacity-75'
                                    : 'border-red-200 opacity-50'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-black text-slate-900">{app.fullName}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${app.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : app.status === 'approved'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {app.status === 'pending' ? '⏳ Pending' : app.status === 'approved' ? '✓ Disetujui' : '✗ Ditolak'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">Username: <strong>{app.username}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{app.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{app.region}{app.city ? `, ${app.city}` : ''}</span>
                                        </div>
                                        {app.phoneNumber && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="font-medium">{app.phoneNumber}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-xs">
                                                {new Date(app.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {app.motivation && (
                                        <div className="mt-3 bg-slate-50 rounded-xl p-3">
                                            <div className="flex items-start gap-2 text-sm">
                                                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-1">Motivasi</p>
                                                    <p className="text-slate-700 leading-relaxed">{app.motivation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {app.status === 'pending' && (
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => setConfirmAction({ type: 'approve', id: app.id })}
                                            className="p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors border border-green-200"
                                            title="Setujui"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction({ type: 'reject', id: app.id })}
                                            className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors border border-red-200"
                                            title="Tolak"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (!confirmAction) return;
                    if (confirmAction.type === 'approve') {
                        handleApprove(confirmAction.id);
                    } else {
                        handleReject(confirmAction.id);
                    }
                }}
                title={confirmAction?.type === 'approve' ? 'Setujui Pendaftar?' : 'Tolak Pendaftar?'}
                message={
                    confirmAction?.type === 'approve'
                        ? 'Akun kontributor akan otomatis dibuat dan bisa langsung login'
                        : 'Pendaftar akan ditandai sebagai ditolak'
                }
                confirmText={confirmAction?.type === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                cancelText="Batal"
                type={confirmAction?.type === 'approve' ? 'info' : 'danger'}
                isLoading={actionLoading}
            />
        </div>
    );
}
