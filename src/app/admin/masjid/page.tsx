'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';

interface Masjid {
    id: number;
    name: string;
    city: string;
    address?: string;
    kajianCount?: number;
}

export default function MasjidManagementPage() {
    const [masjidList, setMasjidList] = useState<Masjid[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMasjid, setEditingMasjid] = useState<Masjid | null>(null);
    const [formData, setFormData] = useState({ name: '', city: '', address: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMasjid();
    }, []);

    const fetchMasjid = async () => {
        try {
            const response = await fetch('/api/admin/masjid');
            const data = await response.json();
            setMasjidList(data);
        } catch (error) {
            console.error('Error fetching masjid:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingMasjid
                ? `/api/admin/masjid/${editingMasjid.id}`
                : '/api/admin/masjid';
            const method = editingMasjid ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchMasjid();
                setIsModalOpen(false);
                setFormData({ name: '', city: '', address: '' });
                setEditingMasjid(null);
            }
        } catch (error) {
            console.error('Error saving masjid:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus masjid ini?')) return;

        try {
            const response = await fetch(`/api/admin/masjid/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMasjid();
            }
        } catch (error) {
            console.error('Error deleting masjid:', error);
        }
    };

    const openEditModal = (masjid: Masjid) => {
        setEditingMasjid(masjid);
        setFormData({
            name: masjid.name,
            city: masjid.city,
            address: masjid.address || '',
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingMasjid(null);
        setFormData({ name: '', city: '', address: '' });
        setIsModalOpen(true);
    };

    const filteredMasjid = masjidList.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Kelola Masjid</h1>
                    <p className="text-slate-500 mt-1">Manajemen data masjid/tempat kajian</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Masjid
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama masjid atau kota..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-100 p-3 rounded-xl">
                            <MapPin className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Masjid</p>
                            <p className="text-2xl font-bold text-slate-900">{masjidList.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Kota</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {new Set(masjidList.map(m => m.city)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Nama Masjid
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Kota
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Alamat
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Jumlah Kajian
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredMasjid.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data masjid
                                    </td>
                                </tr>
                            ) : (
                                filteredMasjid.map((masjid, index) => (
                                    <tr key={masjid.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-teal-600" />
                                                </div>
                                                <span className="font-bold text-slate-900">{masjid.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                                {masjid.city}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                            {masjid.address || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {masjid.kajianCount || 0} kajian
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(masjid)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(masjid.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="px-6 py-5 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingMasjid ? 'Edit Masjid' : 'Tambah Masjid Baru'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nama Masjid
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Masjid Al-Ikhlas"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Kota
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Contoh: Jakarta"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Alamat (Opsional)
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Contoh: Jl. Raya No. 123, Jakarta Selatan"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
                                >
                                    {editingMasjid ? 'Simpan' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
