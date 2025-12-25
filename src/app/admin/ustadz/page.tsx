'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';

interface Ustadz {
    id: number;
    name: string;
    kajianCount?: number;
}

export default function UstadzManagementPage() {
    const [ustadzList, setUstadzList] = useState<Ustadz[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUstadz, setEditingUstadz] = useState<Ustadz | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUstadz();
    }, []);

    const fetchUstadz = async () => {
        try {
            const response = await fetch('/api/admin/ustadz');
            const data = await response.json();
            setUstadzList(data);
        } catch (error) {
            console.error('Error fetching ustadz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingUstadz
                ? `/api/admin/ustadz/${editingUstadz.id}`
                : '/api/admin/ustadz';
            const method = editingUstadz ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchUstadz();
                setIsModalOpen(false);
                setFormData({ name: '' });
                setEditingUstadz(null);
            }
        } catch (error) {
            console.error('Error saving ustadz:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus ustadz ini?')) return;

        try {
            const response = await fetch(`/api/admin/ustadz/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchUstadz();
            }
        } catch (error) {
            console.error('Error deleting ustadz:', error);
        }
    };

    const openEditModal = (ustadz: Ustadz) => {
        setEditingUstadz(ustadz);
        setFormData({ name: ustadz.name });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingUstadz(null);
        setFormData({ name: '' });
        setIsModalOpen(true);
    };

    const filteredUstadz = ustadzList.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Kelola Ustadz</h1>
                    <p className="text-slate-500 mt-1">Manajemen data ustadz/pemateri kajian</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    <Plus className="w-5 h-5" />
                    Tambah Ustadz
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama ustadz..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Ustadz</p>
                            <p className="text-2xl font-bold text-slate-900">{ustadzList.length}</p>
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
                                    Nama Ustadz
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
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : filteredUstadz.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data ustadz
                                    </td>
                                </tr>
                            ) : (
                                filteredUstadz.map((ustadz, index) => (
                                    <tr key={ustadz.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <span className="font-bold text-slate-900">{ustadz.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {ustadz.kajianCount || 0} kajian
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(ustadz)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ustadz.id)}
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
                                {editingUstadz ? 'Edit Ustadz' : 'Tambah Ustadz Baru'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nama Ustadz
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ name: e.target.value })}
                                    placeholder="Contoh: Ustadz Ahmad bin Umar"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    required
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
                                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    {editingUstadz ? 'Simpan' : 'Tambah'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
