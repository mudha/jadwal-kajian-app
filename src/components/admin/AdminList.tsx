'use client';
import { useState, useEffect } from 'react';
import { Users, Trash2, Shield, ShieldCheck, Mail, Calendar, AlertCircle, Plus, X, Loader2, Save, Edit, Key, UserCog, Info } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

interface Admin {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
}

export default function AdminList() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Add Admin State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        username: '',
        password: '',
        role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN'
    });

    // Edit Admin State
    const [editAdmin, setEditAdmin] = useState<{
        id: number;
        username: string;
        email: string;
        currentRole: 'ADMIN' | 'SUPER_ADMIN';
    } | null>(null);
    const [editTab, setEditTab] = useState<'password' | 'role' | 'info'>('password');
    const [editData, setEditData] = useState({
        newPassword: '',
        confirmPassword: '',
        role: '' as 'ADMIN' | 'SUPER_ADMIN'
    });
    const [isEditing, setIsEditing] = useState(false);

    // Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/admins');
            if (!res.ok) throw new Error('Failed to fetch admins');
            const data = await res.json();
            setAdmins(data);
        } catch (err) {
            setError('Gagal memuat data admin. Pastikan Anda memiliki akses.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setError('');

        try {
            const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('✅ Admin berhasil ditambahkan');
                setIsAddModalOpen(false);
                setNewAdmin({ username: '', password: '', role: 'ADMIN' });
                fetchAdmins();
            } else {
                setError(data.error || 'Gagal menambahkan admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditAdmin = (admin: Admin) => {
        setEditAdmin({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            currentRole: admin.role
        });
        setEditData({
            newPassword: '',
            confirmPassword: '',
            role: admin.role
        });
        setEditTab('password');
    };

    const handleSaveEdit = async () => {
        if (!editAdmin) return;

        if (editTab === 'password') {
            if (!editData.newPassword || editData.newPassword.length < 6) {
                setError('Password minimal 6 karakter');
                return;
            }
            if (editData.newPassword !== editData.confirmPassword) {
                setError('Password tidak cocok');
                return;
            }

            setIsEditing(true);
            try {
                const res = await fetch(`/api/admin/admins/${editAdmin.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: editData.newPassword })
                });

                if (res.ok) {
                    setMessage('✅ Password berhasil diubah');
                    setEditAdmin(null);
                } else {
                    const data = await res.json();
                    setError(data.error || 'Gagal mengubah password');
                }
            } catch (err) {
                setError('Terjadi kesalahan sistem');
            } finally {
                setIsEditing(false);
            }
        } else if (editTab === 'role') {
            if (editData.role === editAdmin.currentRole) {
                setError('Pilih role yang berbeda');
                return;
            }

            setIsEditing(true);
            try {
                const res = await fetch(`/api/admin/admins/${editAdmin.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: editData.role })
                });

                if (res.ok) {
                    setMessage('✅ Role berhasil diperbarui');
                    setEditAdmin(null);
                    fetchAdmins();
                } else {
                    const data = await res.json();
                    setError(data.error || 'Gagal memperbarui role');
                }
            } catch (err) {
                setError('Terjadi kesalahan sistem');
            } finally {
                setIsEditing(false);
            }
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsProcessing(true);

        try {
            const res = await fetch(`/api/admin/admins/${deleteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('✅ Admin berhasil dihapus');
                fetchAdmins();
                setDeleteId(null);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal menghapus admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kelola Admin</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">Manajemen hak akses dan privelege administrator</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Admin
                    </button>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hidden md:flex">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Admin</p>
                            <p className="text-xl font-black text-slate-900">{admins.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Messages */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold shadow-xl animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                    <button onClick={() => setError('')} className="ml-2 hover:bg-red-100 p-1 rounded-full"><X className="w-4 h-4" /></button>
                </div>
            )}

            {message && (
                <div className="fixed top-4 right-4 z-50 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold shadow-xl animate-in slide-in-from-top-2">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
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
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Terdaftar</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {admins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${admin.role === 'SUPER_ADMIN' ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-200' : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-200'}`}>
                                                {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{admin.username}</p>
                                                <p className="text-xs text-slate-400 font-medium">ID: {admin.id}</p>
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
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md ${admin.role === 'SUPER_ADMIN'
                                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-amber-100'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-100'
                                            }`}>
                                            {admin.role === 'SUPER_ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(admin.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditAdmin(admin)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all shadow-sm"
                                                title="Edit Admin"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                                title="Hapus Admin"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Admin Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Tambah Admin Baru</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={newAdmin.username}
                                    onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    placeholder="Username minimal 3 karakter"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={newAdmin.password}
                                    onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    placeholder="Password minimal 6 karakter"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Role API Access</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-colors ${newAdmin.role === 'ADMIN' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="ADMIN"
                                            checked={newAdmin.role === 'ADMIN'}
                                            onChange={() => setNewAdmin({ ...newAdmin, role: 'ADMIN' })}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newAdmin.role === 'ADMIN' ? 'border-blue-500' : 'border-slate-300'}`}>
                                            {newAdmin.role === 'ADMIN' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-700">Admin</span>
                                    </label>
                                    <label className={`cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-colors ${newAdmin.role === 'SUPER_ADMIN' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="SUPER_ADMIN"
                                            checked={newAdmin.role === 'SUPER_ADMIN'}
                                            onChange={() => setNewAdmin({ ...newAdmin, role: 'SUPER_ADMIN' })}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newAdmin.role === 'SUPER_ADMIN' ? 'border-amber-500' : 'border-slate-300'}`}>
                                            {newAdmin.role === 'SUPER_ADMIN' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-700">Super Admin</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Admin Modal */}
            {editAdmin && (
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Edit Admin: {editAdmin.username}</h3>
                            <button onClick={() => setEditAdmin(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-100">
                            <button
                                onClick={() => setEditTab('password')}
                                className={`flex-1 px-4 py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${editTab === 'password'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Key className="w-4 h-4" />
                                Password
                            </button>
                            <button
                                onClick={() => setEditTab('role')}
                                className={`flex-1 px-4 py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${editTab === 'role'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <UserCog className="w-4 h-4" />
                                Role
                            </button>
                            <button
                                onClick={() => setEditTab('info')}
                                className={`flex-1 px-4 py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 ${editTab === 'info'
                                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Info className="w-4 h-4" />
                                Info
                            </button>
                        </div>

                        <div className="p-6">
                            {editTab === 'password' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password Baru</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                            value={editData.newPassword}
                                            onChange={e => setEditData({ ...editData, newPassword: e.target.value })}
                                            placeholder="Minimal 6 karakter"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                            value={editData.confirmPassword}
                                            onChange={e => setEditData({ ...editData, confirmPassword: e.target.value })}
                                            placeholder="Ketik ulang password"
                                        />
                                    </div>
                                </div>
                            )}

                            {editTab === 'role' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-600 font-medium">Ubah hak akses administrator</p>
                                    <div className="space-y-3">
                                        <label className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-colors ${editData.role === 'ADMIN' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                            <input
                                                type="radio"
                                                name="editRole"
                                                value="ADMIN"
                                                checked={editData.role === 'ADMIN'}
                                                onChange={() => setEditData({ ...editData, role: 'ADMIN' })}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editData.role === 'ADMIN' ? 'border-blue-500' : 'border-slate-300'}`}>
                                                {editData.role === 'ADMIN' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                                            </div>
                                            <Shield className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-slate-700">Admin</span>
                                        </label>
                                        <label className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-colors ${editData.role === 'SUPER_ADMIN' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                            <input
                                                type="radio"
                                                name="editRole"
                                                value="SUPER_ADMIN"
                                                checked={editData.role === 'SUPER_ADMIN'}
                                                onChange={() => setEditData({ ...editData, role: 'SUPER_ADMIN' })}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editData.role === 'SUPER_ADMIN' ? 'border-amber-500' : 'border-slate-300'}`}>
                                                {editData.role === 'SUPER_ADMIN' && <div className="w-3 h-3 rounded-full bg-amber-500" />}
                                            </div>
                                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                                            <span className="font-bold text-slate-700">Super Admin</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {editTab === 'info' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Username</label>
                                        <div className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-600">
                                            {editAdmin.username}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
                                        <div className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-600">
                                            {editAdmin.email || '-'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Current Role</label>
                                        <div className="px-4 py-3 bg-slate-50 rounded-xl font-bold text-slate-600">
                                            {editAdmin.currentRole}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editTab !== 'info' && (
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditAdmin(null)}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={isEditing}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Simpan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Admin Modal */}
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Admin?"
                message="Admin yang dihapus tidak dapat lagi mengakses panel admin. Data tidak bisa dikembalikan."
                confirmText="Hapus Permanen"
                cancelText="Batal"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}

interface Admin {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
}

export default function AdminList() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Add Admin State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        username: '',
        password: '',
        role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN'
    });

    // Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [roleUpdate, setRoleUpdate] = useState<{ id: number, currentRole: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        setError('');

        try {
            const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Admin berhasil ditambahkan');
                setIsAddModalOpen(false);
                setNewAdmin({ username: '', password: '', role: 'ADMIN' });
                fetchAdmins();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setError(data.error || 'Gagal menambahkan admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateRole = (id: number, currentRole: string) => {
        setRoleUpdate({ id, currentRole });
    };

    const confirmUpdateRole = async () => {
        if (!roleUpdate) return;
        setIsProcessing(true);
        const { id, currentRole } = roleUpdate;
        const newRole = currentRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';

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
                setRoleUpdate(null);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal memperbarui role');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setIsProcessing(true);

        try {
            const res = await fetch(`/api/admin/admins/${deleteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('Admin berhasil dihapus');
                fetchAdmins();
                setTimeout(() => setMessage(''), 3000);
                setDeleteId(null);
            } else {
                const data = await res.json();
                setError(data.error || 'Gagal menghapus admin');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Memuat data...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kelola Admin</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold">Manajemen hak akses dan privelege administrator</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Admin
                    </button>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hidden md:flex">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Admin</p>
                            <p className="text-xl font-black text-slate-900">{admins.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto hover:bg-red-100 p-1 rounded-full"><X className="w-4 h-4" /></button>
                </div>
            )}

            {message && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold animate-in slide-in-from-top-2">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
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
                                            title="Klik untuk ubah role"
                                        >
                                            {admin.role}
                                        </button>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                                            title="Hapus Admin"
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

            {/* Add Admin Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">Tambah Admin Baru</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={newAdmin.username}
                                    onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                    placeholder="Username minimal 3 karakter"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={newAdmin.password}
                                    onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    placeholder="Password minimal 6 karakter"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Role API Access</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-colors ${newAdmin.role === 'ADMIN' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="ADMIN"
                                            checked={newAdmin.role === 'ADMIN'}
                                            onChange={() => setNewAdmin({ ...newAdmin, role: 'ADMIN' })}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newAdmin.role === 'ADMIN' ? 'border-blue-500' : 'border-slate-300'}`}>
                                            {newAdmin.role === 'ADMIN' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-700">Admin</span>
                                    </label>
                                    <label className={`cursor-pointer p-3 border rounded-xl flex items-center gap-3 transition-colors ${newAdmin.role === 'SUPER_ADMIN' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="SUPER_ADMIN"
                                            checked={newAdmin.role === 'SUPER_ADMIN'}
                                            onChange={() => setNewAdmin({ ...newAdmin, role: 'SUPER_ADMIN' })}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${newAdmin.role === 'SUPER_ADMIN' ? 'border-amber-500' : 'border-slate-300'}`}>
                                            {newAdmin.role === 'SUPER_ADMIN' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-700">Super Admin</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Role Update Modal */}
            <ConfirmationModal
                isOpen={!!roleUpdate}
                onClose={() => setRoleUpdate(null)}
                onConfirm={confirmUpdateRole}
                title="Ubah Role Admin?"
                message={roleUpdate ? `Apakah Anda yakin ingin mengubah role admin ini menjadi ${roleUpdate.currentRole === 'SUPER_ADMIN' ? 'ADMIN' : 'SUPER_ADMIN'}?` : ''}
                confirmText="Ya, Ubah Role"
                cancelText="Batal"
                type="warning"
                isLoading={isProcessing}
            />

            {/* Delete Admin Modal */}
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Hapus Admin?"
                message="Admin yang dihapus tidak dapat lagi mengakses panel admin. Data tidak bisa dikembalikan."
                confirmText="Hapus Permanen"
                cancelText="Batal"
                type="danger"
                isLoading={isProcessing}
            />
        </div>
    );
}
