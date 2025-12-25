'use client';
import { useState, useEffect } from 'react';
import { Users, Trash2, Shield, ShieldCheck, Mail, Calendar, AlertCircle } from 'lucide-react';

interface Admin {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
}

export default function AdminManagementPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/admins');
            if (!res.ok) throw new Error('Failed to fetch admins');
            const data = await res.json();
            setAdmins(data);
        } catch (err) {
            setError('Gagal memuat data admin. Pastikan Anda Super Admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (id: number, currentRole: string) => {
        const newRole = currentRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';
        if (!confirm(`Ubah role admin ini menjadi ${newRole}?`)) return;

        try {
            const res = await fetch(`/api/admin/admins/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (res.ok) {
                setMessage('Role berhasil diperbarui');
                fetchAdmins();
                setTimeout(() => setMessage(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal memperbarui role');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus akun admin ini secara permanen?')) return;

        try {
            const res = await fetch(`/api/admin/admins/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('Admin berhasil dihapus');
                fetchAdmins();
                setTimeout(() => setMessage(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal menghapus admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kelola Admin</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">Manajemen hak akses dan privelege administrator</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Admin</p>
                        <p className="text-2xl font-black text-slate-900">{admins.length}</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold mb-6">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {message && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold mb-6">
                    <ShieldCheck className="w-5 h-5" />
                    {message}
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Privelege</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${admin.role === 'SUPER_ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{admin.username}</p>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5 font-medium">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Daftar: {new Date(admin.createdAt).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {admin.email || '-'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <button
                                            onClick={() => handleUpdateRole(admin.id, admin.role)}
                                            className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all shadow-sm ${admin.role === 'SUPER_ADMIN'
                                                    ? 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {admin.role}
                                        </button>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            className="p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
