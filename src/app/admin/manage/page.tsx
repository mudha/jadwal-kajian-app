'use client';
import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Calendar, MapPin, X, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Kajian {
    id: number;
    region?: string;
    city: string;
    masjid: string;
    address: string;
    gmapsUrl?: string; // Optional
    cp?: string; // Optional Contact Person
    pemateri: string;
    tema: string;
    waktu: string;
    date: string;
    linkInfo?: string;
    khususAkhwat?: boolean;
}

export default function AdminManagePage() {
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKajian, setEditingKajian] = useState<Kajian | null>(null);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/kajian');
            const data = await response.json();
            if (Array.isArray(data)) {
                setKajianList(data);
            }
        } catch (e) {
            console.error('Error fetching data', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus jadwal ini?')) {
            try {
                const res = await fetch(`/api/kajian/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setKajianList(prev => prev.filter(k => k.id !== id));
                }
            } catch (e) {
                alert('Gagal menghapus data');
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKajian) return;

        try {
            const res = await fetch(`/api/kajian/${editingKajian.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingKajian),
            });

            if (res.ok) {
                setKajianList(prev => prev.map(k => k.id === editingKajian.id ? editingKajian : k));
                setIsEditModalOpen(false);
                setEditingKajian(null);
                alert('Data berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui data');
            }
        } catch (e) {
            console.error(e);
            alert('Terjadi kesalahan saat menyimpan');
        }
    };

    const filteredList = kajianList.filter(k =>
        k.masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.pemateri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.tema.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Kelola Jadwal Kajian</h1>
                    <p className="text-slate-500">Update, edit, atau hapus jadwal kajian yang terdaftar.</p>
                </div>
                <Link
                    href="/admin/batch-input"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Input Baru
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari berdasarkan Masjid, Ustadz, atau Kota..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
            </div>

            {/* Table / List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Memuat data...</div>
                ) : filteredList.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Waktu & Tanggal</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Masjid / Lokasi</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pemateri & Tema</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredList.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                <Calendar className="w-4 h-4 text-blue-500" />
                                                {item.date}
                                            </div>
                                            <p className="pl-6 text-sm text-slate-500">{item.waktu}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{item.masjid}</div>
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{item.pemateri}</div>
                                            <p className="text-sm text-slate-500 line-clamp-1" title={item.tema}>{item.tema}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingKajian({ ...item });
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
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
                )}
            </div>

            {/* Edit Modal (Duplicated for simplicity in this file) */}
            {isEditModalOpen && editingKajian && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <h2 className="text-2xl font-black text-slate-900">Edit Jadwal</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <form id="editForm" onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Masjid / Lokasi</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                        value={editingKajian.masjid}
                                        onChange={e => setEditingKajian({ ...editingKajian, masjid: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Pemateri</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.pemateri}
                                            onChange={e => setEditingKajian({ ...editingKajian, pemateri: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kota</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.city}
                                            onChange={e => setEditingKajian({ ...editingKajian, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tema</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                        value={editingKajian.tema}
                                        onChange={e => setEditingKajian({ ...editingKajian, tema: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tanggal</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.date}
                                            onChange={e => setEditingKajian({ ...editingKajian, date: e.target.value })}
                                            placeholder="Contoh: Senin, 20 Januari 2025"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Waktu</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.waktu}
                                            onChange={e => setEditingKajian({ ...editingKajian, waktu: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Lengkap</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                                        value={editingKajian.address}
                                        onChange={e => setEditingKajian({ ...editingKajian, address: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Contact Person (CP)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.cp || ''}
                                            onChange={e => setEditingKajian({ ...editingKajian, cp: e.target.value })}
                                            placeholder="08..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Google Maps</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-blue-600 truncate"
                                            value={editingKajian.gmapsUrl || ''}
                                            onChange={e => setEditingKajian({ ...editingKajian, gmapsUrl: e.target.value })}
                                            placeholder="https://maps.app.goo.gl/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Pendaftaran / Streaming</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-blue-600"
                                        value={editingKajian.linkInfo || ''}
                                        onChange={e => setEditingKajian({ ...editingKajian, linkInfo: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="khususAkhwat"
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={editingKajian.khususAkhwat || false}
                                        onChange={e => setEditingKajian({ ...editingKajian, khususAkhwat: e.target.checked })}
                                    />
                                    <label htmlFor="khususAkhwat" className="font-bold text-slate-700">Khusus Akhwat / Muslimah</label>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="editForm"
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
