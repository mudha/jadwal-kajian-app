'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Loader2, Wand2 } from 'lucide-react';
import SchoolFormModal from '@/components/admin/SchoolFormModal';

interface Sekolah {
    id: number;
    nama: string;
    slug: string;
    jenjang: string;
    kota: string;
    provinsi?: string;
    alamat: string;
    gmaps_url?: string;
    spp_bulanan?: number;
    uang_masuk?: number;
    khusus_akhwat?: boolean;
    khusus_ikhwan?: boolean;
    imageUrl?: string;
    telepon?: string;
    handphone?: string;
    website?: string;
    pembina?: string;
}

const cleanSchoolName = (name: string): string => {
    // Regex to remove "Akhwat Ikhwan", "Akhwat", "Ikhwan" from the end, case insensitive with optional whitespace
    return name.replace(/\s+(Akhwat\s+Ikhwan|Akhwat|Ikhwan)\s*$/i, '').trim();
};

export default function AdminSekolahPage() {
    const [list, setList] = useState<Sekolah[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Sekolah> | null>(null);
    const [isCleaning, setIsCleaning] = useState(false);

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/sekolah?limit=100');
            const data = await res.json();
            setList(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        try {
            await fetch(`/api/admin/sekolah/${id}`, { method: 'DELETE' });
            setList(l => l.filter(i => i.id !== id));
        } catch (e) {
            alert('Gagal menghapus');
        }
    };

    const handleFormSubmit = async (data: Partial<Sekolah>) => {
        const isEdit = !!data.id;
        const url = isEdit ? `/api/admin/sekolah/${data.id}` : '/api/admin/sekolah';
        const method = isEdit ? 'PATCH' : 'POST';

        // Clean name before saving just in case
        if (data.nama) {
            data.nama = cleanSchoolName(data.nama);
        }

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            fetchData();
            setIsModalOpen(false);
            setEditingItem(null);
        } else {
            throw new Error('Gagal menyimpan');
        }
    };

    const openModal = (item?: Sekolah) => {
        setEditingItem(item || {
            nama: '',
            jenjang: 'SD',
            kota: '',
            alamat: '',
            khusus_ikhwan: true,
            khusus_akhwat: true
        });
        setIsModalOpen(true);
    };

    const handleCleanupData = async () => {
        if (!confirm('Fitur ini akan membersihkan nama sekolah dengan menghapus kata "Akhwat Ikhwan" dari nama sekolah. Lanjutkan?')) return;

        setIsCleaning(true);
        let correctedCount = 0;

        try {
            for (const item of list) {
                const cleanedName = cleanSchoolName(item.nama);
                if (cleanedName !== item.nama) {
                    await fetch(`/api/admin/sekolah/${item.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nama: cleanedName })
                    });
                    correctedCount++;
                }
            }
            alert(`Selesai! ${correctedCount} data berhasil diperbaiki.`);
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Terjadi kesalahan saat perbaikan data.');
        } finally {
            setIsCleaning(false);
        }
    };

    const filtered = list.filter(i =>
        i.nama.toLowerCase().includes(search.toLowerCase()) ||
        i.kota.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Kelola Sekolah Sunnah</h1>
                    <p className="text-slate-600">Direktori sekolah Islam bermanhaj Salaf</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCleanupData}
                        disabled={isCleaning}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isCleaning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {isCleaning ? 'Memproses...' : 'Perbaiki Data Nama'}
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-purple-200"
                    >
                        <Plus className="w-5 h-5" /> Tambah Sekolah
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari sekolah berdasarkan nama atau kota..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-800"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-500 tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Nama Sekolah</th>
                            <th className="px-6 py-4">Jenjang</th>
                            <th className="px-6 py-4">Lokasi</th>
                            <th className="px-6 py-4 text-center">Fasilitas</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse">Memuat data direktori...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data ditemukan</td></tr>
                        ) : filtered.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 text-base">{cleanSchoolName(item.nama)}</div>
                                    <div className="text-xs text-slate-400 font-mono mt-0.5">{item.slug}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold border border-purple-100">
                                        {item.jenjang}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        {item.kota}
                                    </div>
                                    <div className="text-xs text-slate-400 pl-5">{item.provinsi}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {item.khusus_ikhwan && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm" title="Menerima Ikhwan">
                                                <span className="text-xs font-bold">L</span>
                                            </div>
                                        )}
                                        {item.khusus_akhwat && (
                                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200 shadow-sm" title="Menerima Akhwat">
                                                <span className="text-xs font-bold">P</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                            title="Edit Data"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="Hapus Data"
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

            <SchoolFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingItem}
            />
        </div>
    );
}

