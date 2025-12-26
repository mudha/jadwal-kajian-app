'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, GitMerge } from 'lucide-react';

interface Ustadz {
    id: number;
    name: string;
    kajianCount?: number;
}

export default function UstadzManagementPage() {
    const [ustadzList, setUstadzList] = useState<Ustadz[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [editingUstadz, setEditingUstadz] = useState<Ustadz | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [loading, setLoading] = useState(true);
    const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set());
    const [mergeTarget, setMergeTarget] = useState('');

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

    const toggleMergeSelection = (name: string) => {
        const newSelected = new Set(selectedForMerge);
        if (newSelected.has(name)) {
            newSelected.delete(name);
        } else {
            newSelected.add(name);
        }
        setSelectedForMerge(newSelected);
    };

    const handleMerge = async () => {
        if (selectedForMerge.size < 2) {
            alert('Pilih minimal 2 ustadz untuk digabung');
            return;
        }

        if (!mergeTarget) {
            alert('Pilih nama target untuk penggabungan');
            return;
        }

        const sourceNames = Array.from(selectedForMerge).filter(name => name !== mergeTarget);

        if (sourceNames.length === 0) {
            alert('Nama target tidak boleh sama dengan semua nama yang dipilih');
            return;
        }

        try {
            const response = await fetch('/api/admin/ustadz/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceNames, targetName: mergeTarget }),
            });

            if (response.ok) {
                alert(`Berhasil menggabungkan ${sourceNames.length} nama ustadz`);
                setSelectedForMerge(new Set());
                setMergeTarget('');
                setIsMergeModalOpen(false);
                fetchUstadz();
            } else {
                alert('Gagal menggabungkan ustadz');
            }
        } catch (error) {
            console.error('Error merging ustadz:', error);
            alert('Terjadi kesalahan saat menggabungkan');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Kelola Ustadz</h1>
                    <p className="text-slate-500 mt-1">Manajemen data ustadz/pemateri kajian</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {selectedForMerge.size > 0 && (
                        <button
                            onClick={() => setIsMergeModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 text-sm"
                        >
                            <GitMerge className="w-5 h-5" />
                            Gabung ({selectedForMerge.size})
                        </button>
                    )}
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Ustadz
                    </button>
                </div>
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

            {/* Content Area */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">Memuat data...</div>
                ) : filteredUstadz.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
                        Tidak ada data ustadz
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedForMerge.size === filteredUstadz.length && filteredUstadz.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedForMerge(new Set(filteredUstadz.map(u => u.name)));
                                                        } else {
                                                            setSelectedForMerge(new Set());
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </th>
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
                                        {filteredUstadz.map((ustadz, index) => (
                                            <tr key={ustadz.id} className={`hover:bg-slate-50 transition-colors ${selectedForMerge.has(ustadz.name) ? 'bg-amber-50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedForMerge.has(ustadz.name)}
                                                        onChange={() => toggleMergeSelection(ustadz.name)}
                                                        className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </td>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 md:hidden gap-4">
                            {filteredUstadz.map((ustadz) => (
                                <div
                                    key={ustadz.id}
                                    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between ${selectedForMerge.has(ustadz.name) ? 'bg-amber-50 border-amber-200' : ''}`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={selectedForMerge.has(ustadz.name)}
                                            onChange={() => toggleMergeSelection(ustadz.name)}
                                            className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate pr-2">{ustadz.name}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                                {ustadz.kajianCount || 0} kajian
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => openEditModal(ustadz)}
                                            className="p-2.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ustadz.id)}
                                            className="p-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
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

            {/* Merge Modal */}
            {isMergeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <GitMerge className="w-6 h-6" />
                                <div>
                                    <h2 className="text-xl font-bold">Gabung Nama Ustadz</h2>
                                    <p className="text-sm text-amber-100">Gabungkan {selectedForMerge.size} nama menjadi satu</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Selected Names */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Nama yang Dipilih ({selectedForMerge.size})
                                </label>
                                <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                                    {Array.from(selectedForMerge).map((name) => {
                                        const ustadz = ustadzList.find(u => u.name === name);
                                        return (
                                            <div key={name} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-900">{name}</span>
                                                </div>
                                                <span className="text-xs text-slate-500">{ustadz?.kajianCount || 0} kajian</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Target Name Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Pilih Nama Target (Nama yang Akan Digunakan)
                                </label>
                                <div className="space-y-2">
                                    {Array.from(selectedForMerge).map((name) => (
                                        <label
                                            key={name}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${mergeTarget === name
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="mergeTarget"
                                                value={name}
                                                checked={mergeTarget === name}
                                                onChange={(e) => setMergeTarget(e.target.value)}
                                                className="w-5 h-5 text-amber-600 focus:ring-2 focus:ring-amber-500"
                                            />
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900">{name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {ustadzList.find(u => u.name === name)?.kajianCount || 0} kajian akan tetap menggunakan nama ini
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Name Option */}
                            <div>
                                <label className="flex items-center gap-2 mb-3">
                                    <input
                                        type="checkbox"
                                        checked={mergeTarget !== '' && !selectedForMerge.has(mergeTarget)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setMergeTarget('');
                                            } else {
                                                setMergeTarget(Array.from(selectedForMerge)[0] || '');
                                            }
                                        }}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <span className="text-sm font-bold text-slate-700">Gunakan nama kustom</span>
                                </label>
                                {mergeTarget !== '' && !selectedForMerge.has(mergeTarget) && (
                                    <input
                                        type="text"
                                        value={mergeTarget}
                                        onChange={(e) => setMergeTarget(e.target.value)}
                                        placeholder="Masukkan nama baru..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                                    />
                                )}
                            </div>

                            {/* Preview */}
                            {mergeTarget && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-sm font-bold text-blue-900 mb-2">Preview Hasil:</p>
                                    <p className="text-sm text-blue-700">
                                        {Array.from(selectedForMerge).filter(n => n !== mergeTarget).length} nama akan diganti menjadi:{' '}
                                        <span className="font-bold">"{mergeTarget}"</span>
                                    </p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        Total: {ustadzList.filter(u => selectedForMerge.has(u.name)).reduce((sum, u) => sum + (u.kajianCount || 0), 0)} kajian
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMergeModalOpen(false);
                                        setMergeTarget('');
                                    }}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMerge}
                                    disabled={!mergeTarget}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
                                >
                                    Gabung Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
