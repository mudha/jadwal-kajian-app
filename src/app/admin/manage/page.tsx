'use client';
import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Calendar, MapPin, X, Save, AlertTriangle, ChevronDown, User, Clock, CheckCircle, Info, Eye } from 'lucide-react';
import Link from 'next/link';
import { indonesianCities } from '@/data/cities';
import { parseIndoDate, formatIndoDate, formatYYYYMMDD } from '@/lib/date-utils';
import { splitWaktu, splitPemateri } from '@/lib/parser';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import ImageUpload from '@/components/ImageUpload';


interface Kajian {
    id: number;
    region?: string;
    city: string;
    masjid: string;
    address: string;
    gmapsUrl?: string; // Optional
    cp?: string; // Optional Contact Person
    pemateri: string;
    pemateri2?: string;
    pemateri3?: string;
    tema: string;
    waktu: string;
    waktu_mulai?: string;
    waktu_selesai?: string;
    date: string;
    linkInfo?: string;
    khususAkhwat?: boolean;
    isOnline?: boolean;
    isKidsFriendly?: boolean;
    imageUrl?: string;
    attendanceCount?: number;
    lat?: number;
    lng?: number;
    catatan?: string;
}

import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function AdminManagePage() {
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKajian, setEditingKajian] = useState<Kajian | null>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Duplicate Scan State
    const [isDuplicateScanModalOpen, setIsDuplicateScanModalOpen] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    // Delete Duplicate Modal State
    const [isDeleteDuplicateModalOpen, setIsDeleteDuplicateModalOpen] = useState(false);
    const [duplicateToDelete, setDuplicateToDelete] = useState<Kajian | null>(null);
    const [isDeletingDuplicate, setIsDeletingDuplicate] = useState(false);

    // Notification Toast State
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);



    // City Autocomplete State
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [cityFilter, setCityFilter] = useState('');

    // Waktu Autocomplete State
    const [isWaktuDropdownOpen, setIsWaktuDropdownOpen] = useState(false);

    // Common waktu suggestions for kajian
    const waktuSuggestions = [
        "Ba'da Shubuh - Selesai",
        "Ba'da Dhuhur - Selesai",
        "Ba'da Ashar - Selesai",
        "Ba'da Maghrib - Selesai",
        "Ba'da Isya - Selesai",
        "Shubuh - Selesai",
        "Dhuhur - Selesai",
        "Ashar - Selesai",
        "Maghrib - Selesai",
        "Isya - Selesai",
        "Sholat Jumat",
    ];







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

    // Auto-dismiss notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleDelete = (id: number) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/kajian/${itemToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setKajianList(prev => prev.filter(k => k.id !== itemToDelete));
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            } else {
                setNotification({ message: 'Gagal menghapus data', type: 'error' });
            }
        } catch (e) {
            setNotification({ message: 'Gagal menghapus data', type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const scanDuplicates = () => {
        setIsScanning(true);

        // Group kajian by city + masjid + date + waktu
        const groups = new Map<string, Kajian[]>();

        kajianList.forEach(kajian => {
            const key = `${kajian.city}|${kajian.masjid}|${kajian.date}|${kajian.waktu}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(kajian);
        });

        // Filter only groups with duplicates (more than 1 item)
        const duplicates = Array.from(groups.values())
            .filter(group => group.length > 1)
            .map(group => ({
                key: `${group[0].city} - ${group[0].masjid} - ${group[0].date} - ${group[0].waktu}`,
                items: group.sort((a, b) => a.id - b.id) // Sort by ID
            }));

        setDuplicateGroups(duplicates);
        setIsDuplicateScanModalOpen(true);
        setIsScanning(false);
    };

    const confirmDeleteDuplicate = async () => {
        if (!duplicateToDelete) return;
        setIsDeletingDuplicate(true);
        try {
            const res = await fetch(`/api/kajian/${duplicateToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                // Refresh data and rescan
                await fetchData();
                setIsDeleteDuplicateModalOpen(false);
                setDuplicateToDelete(null);
                setIsDuplicateScanModalOpen(false);
                // Auto rescan after delete
                setTimeout(() => scanDuplicates(), 500);
            }
        } catch (e) {
            console.error('Error deleting duplicate:', e);
        } finally {
            setIsDeletingDuplicate(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKajian) return;

        try {
            // Merge waktu_mulai and waktu_selesai for backward compatibility
            const waktu = editingKajian.waktu_mulai && editingKajian.waktu_selesai
                ? `${editingKajian.waktu_mulai} - ${editingKajian.waktu_selesai}`
                : editingKajian.waktu || '';

            // Prepare data with merged waktu
            const dataToSend = {
                ...editingKajian,
                waktu
            };

            const res = await fetch(`/api/kajian/${editingKajian.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (res.ok) {
                setKajianList(prev => prev.map(k => k.id === editingKajian.id ? editingKajian : k));
                setIsEditModalOpen(false);
                setEditingKajian(null);
            } else {
                setNotification({ message: 'Gagal memperbarui data', type: 'error' });
            }
        } catch (e) {
            console.error(e);
            setNotification({ message: 'Terjadi kesalahan saat menyimpan', type: 'error' });
        }
    };

    const [isExtracting, setIsExtracting] = useState(false);


    // ... (rest of code)

    const handleExtractCoordinates = async () => {
        if (!confirm('Ekstrak koordinat dari semua Google Maps URL?\n\nIni akan mengupdate kajian yang punya gmapsUrl tapi belum punya koordinat lat/lng.')) {
            return;
        }

        setIsExtracting(true);
        try {
            const res = await fetch('/api/admin/extract-coordinates', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                let message = `✓ Berhasil!\n\nTotal: ${data.stats.total}\nUpdated: ${data.stats.updated}\nFailed: ${data.stats.failed}`;

                if (data.sampleUrls && data.sampleUrls.length > 0) {
                    message += '\n\nSample URLs:\n' + data.sampleUrls.slice(0, 3).map((url: string, i: number) =>
                        `${i + 1}. ${url.substring(0, 60)}...`
                    ).join('\n');
                }

                if (data.errors && data.errors.length > 0) {
                    message += '\n\nFirst 3 Errors:\n' + data.errors.slice(0, 3).map((err: any, i: number) =>
                        `${i + 1}. ${err.masjid}: ${err.error}\n   URL: ${err.url.substring(0, 50)}...`
                    ).join('\n');
                }

                setNotification({ message, type: 'success' });
                // Refresh data
                fetchData();
            } else {
                setNotification({ message: `Gagal: ${data.error}`, type: 'error' });
            }
        } catch (error) {
            console.error('Error extracting coordinates:', error);
            setNotification({ message: 'Terjadi kesalahan saat mengekstrak koordinat', type: 'error' });
        } finally {
            setIsExtracting(false);
        }
    };

    const filteredList = kajianList

        .filter(k =>
            k.masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.pemateri.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.tema.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // ...

    const handleExtractCoords = async (url: string) => {
        if (!url || !editingKajian) return;

        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();

            if (data.success) {
                setEditingKajian({
                    ...editingKajian,
                    lat: data.lat,
                    lng: data.lng,
                    gmapsUrl: data.expandedUrl || url
                });
                setNotification({ message: `Koordinat ditemukan: ${data.lat}, ${data.lng}`, type: 'success' });
            } else {
                setNotification({ message: 'Gagal mengekstrak koordinat dari URL tersebut', type: 'error' });
            }
        } catch (error) {
            console.error(error);
            setNotification({ message: 'Terjadi kesalahan saat mengekstrak koordinat', type: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Kelola Jadwal Kajian</h1>
                    <p className="text-slate-600">Update, edit, atau hapus jadwal kajian yang terdaftar.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={scanDuplicates}
                        disabled={isScanning}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-bold text-sm transition-all ${isScanning ? 'bg-amber-800 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
                        title="Scan kajian duplikat di database"
                    >
                        {isScanning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Scanning...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                Scan Duplikat
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleExtractCoordinates}
                        disabled={isExtracting}
                        className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg font-bold text-sm transition-all ${isExtracting ? 'bg-teal-800 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                        title="Ekstrak koordinat dari Google Maps URL"
                    >
                        {isExtracting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Memproses...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-4 h-4" />
                                Extract Koordinat
                            </>
                        )}
                    </button>
                    <Link
                        href="/admin/batch-input"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Input Baru
                    </Link>
                </div>
            </div>

            {/* Search Bar & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari berdasarkan Masjid, Ustadz, atau Kota..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    />
                </div>
            </div>

            {/* Table / List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">Memuat data...</div>
                ) : filteredList.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-medium">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block w-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Waktu & Tanggal</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Masjid / Lokasi</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600">Pemateri & Tema</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center">Peserta</th>
                                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredList.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        {item.date}
                                                    </div>
                                                    <p className="pl-6 text-sm text-slate-600 font-medium">{item.waktu}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-slate-900">{item.masjid}</div>
                                                        {item.lat && item.lng && (
                                                            <span
                                                                className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded-md text-[9px] font-black uppercase tracking-tighter border border-teal-100"
                                                                title={`GPS Active: ${item.lat}, ${item.lng}`}
                                                            >
                                                                <MapPin className="w-2 h-2 fill-teal-600" />
                                                                GPS
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-slate-600 mt-1 font-medium">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.city}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-slate-900">{item.pemateri}</div>
                                                    <p className="text-sm text-slate-600 font-medium line-clamp-1" title={item.tema}>{item.tema}</p>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
                                                        {item.attendanceCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/kajian/${item.id}`}
                                                            target="_blank"
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Lihat Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                // Auto-split waktu and pemateri when editing
                                                                const waktuSplit = splitWaktu(item.waktu);
                                                                const pemateriSplit = splitPemateri(item.pemateri);

                                                                setEditingKajian({
                                                                    ...item,
                                                                    ...waktuSplit,
                                                                    ...pemateriSplit
                                                                });
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
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden w-full max-w-full overflow-hidden">
                            {filteredList.map((item) => (
                                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                    {/* Header: Date & Actions */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm bg-slate-50 px-3 py-1.5 rounded-lg">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {item.date}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/kajian/${item.id}`}
                                                target="_blank"
                                                className="p-2 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors"
                                                title="Lihat Preview"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setEditingKajian({ ...item });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{item.tema}</h3>

                                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-4 font-medium">
                                            <User className="w-4 h-4 text-purple-500" /> {item.pemateri}
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                            <div className="flex items-start gap-2 text-sm text-slate-700">
                                                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900">{item.masjid}</p>
                                                    <p className="text-xs text-slate-600 font-bold truncate">{item.city}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600 font-bold pl-6 border-t border-slate-200 pt-3 mt-1">
                                                <Clock className="w-3 h-3" /> {item.waktu}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2">
                                        {item.lat && item.lng ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-bold border border-teal-100">
                                                <MapPin className="w-3 h-3" /> GPS Aktif
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 italic">No GPS</span>
                                        )}

                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                            {item.attendanceCount || 0} Peserta
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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

                        <div className="p-4 md:p-8 overflow-y-auto pb-32">
                            <form id="editForm" onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Masjid / Lokasi</label>
                                    <div className="relative">
                                        <AutosuggestInput
                                            type="masjid"
                                            value={editingKajian.masjid}
                                            onChange={(val) => setEditingKajian({ ...editingKajian, masjid: val })}
                                            onSelect={(item) => {
                                                setEditingKajian(prev => {
                                                    if (!prev) return null;
                                                    return {
                                                        ...prev,
                                                        masjid: item.value,
                                                        ...(item.address ? { address: item.address } : {}),
                                                        ...(item.gmapsUrl ? { gmapsUrl: item.gmapsUrl } : {}),
                                                        ...(item.city ? { city: item.city } : {}),
                                                        ...(item.lat ? { lat: item.lat } : {}),
                                                        ...(item.lng ? { lng: item.lng } : {})
                                                    };
                                                });
                                            }}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            placeholder="Ketik nama masjid..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Pemateri / Ustadz</label>
                                            {!editingKajian.pemateri2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingKajian({ ...editingKajian, pemateri2: '' })}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Tambah Pemateri
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <AutosuggestInput
                                                type="pemateri"
                                                value={editingKajian.pemateri}
                                                onChange={(val) => setEditingKajian({ ...editingKajian, pemateri: val })}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                                placeholder="Pemateri utama..."
                                            />
                                        </div>

                                        {editingKajian.pemateri2 !== undefined && (
                                            <div className="relative">
                                                <AutosuggestInput
                                                    type="pemateri"
                                                    value={editingKajian.pemateri2 || ''}
                                                    onChange={(val) => setEditingKajian({ ...editingKajian, pemateri2: val })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                                    placeholder="Pemateri kedua..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const { pemateri2, ...rest } = editingKajian;
                                                        setEditingKajian(rest as any);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                    title="Hapus pemateri kedua"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {editingKajian.pemateri2 && !editingKajian.pemateri3 && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingKajian({ ...editingKajian, pemateri3: '' })}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Tambah Pemateri Ketiga
                                            </button>
                                        )}

                                        {editingKajian.pemateri3 !== undefined && (
                                            <div className="relative">
                                                <AutosuggestInput
                                                    type="pemateri"
                                                    value={editingKajian.pemateri3 || ''}
                                                    onChange={(val) => setEditingKajian({ ...editingKajian, pemateri3: val })}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                                    placeholder="Pemateri ketiga..."
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const { pemateri3, ...rest } = editingKajian;
                                                        setEditingKajian(rest as any);
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                    title="Hapus pemateri ketiga"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Kota / Wilayah</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900 placeholder:text-slate-400"
                                                value={editingKajian.city}
                                                onChange={e => {
                                                    setEditingKajian({ ...editingKajian, city: e.target.value });
                                                    setCityFilter(e.target.value);
                                                    setIsCityDropdownOpen(true);
                                                }}
                                                onFocus={() => {
                                                    setCityFilter(editingKajian.city);
                                                    setIsCityDropdownOpen(true);
                                                }}
                                                onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
                                            />
                                            {isCityDropdownOpen && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                    {indonesianCities
                                                        .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                                                        .map(city => (
                                                            <button
                                                                key={city}
                                                                type="button"
                                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm"
                                                                onClick={() => {
                                                                    setEditingKajian({ ...editingKajian, city: city });
                                                                    setIsCityDropdownOpen(false);
                                                                }}
                                                            >
                                                                {city}
                                                            </button>
                                                        ))
                                                    }
                                                    {indonesianCities.filter(c => c.toLowerCase().includes(cityFilter.toLowerCase())).length === 0 && (
                                                        <div className="px-4 py-3 text-slate-400 text-xs text-center italic">Kota tidak ditemukan</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Tema</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900 placeholder:text-slate-400"
                                        value={editingKajian.tema}
                                        onChange={e => setEditingKajian({ ...editingKajian, tema: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Catatan dari Panitia</label>
                                    <textarea
                                        rows={2}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
                                        value={editingKajian.catatan || ''}
                                        onChange={e => setEditingKajian({ ...editingKajian, catatan: e.target.value })}
                                        placeholder="Misal: Membawa makanan untuk berbuka, Khusus ikhwan, dll"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Tanggal</label>
                                        <div className="relative group">
                                            <input
                                                type="date"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900"
                                                value={(() => {
                                                    const d = parseIndoDate(editingKajian.date);
                                                    return d ? formatYYYYMMDD(d) : '';
                                                })()}
                                                onChange={e => {
                                                    const val = e.target.valueAsDate;
                                                    if (val) {
                                                        setEditingKajian({ ...editingKajian, date: formatIndoDate(val) });
                                                    }
                                                }}
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Waktu Mulai</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900 placeholder:text-slate-400"
                                                value={editingKajian.waktu_mulai || ''}
                                                onChange={e => {
                                                    setEditingKajian({ ...editingKajian, waktu_mulai: e.target.value });
                                                    setIsWaktuDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsWaktuDropdownOpen(true)}
                                                onBlur={() => setTimeout(() => setIsWaktuDropdownOpen(false), 200)}
                                                placeholder="Ba'da Maghrib / 19.00"
                                            />
                                            {isWaktuDropdownOpen && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                    {['Ba\'da Shubuh', 'Ba\'da Dhuhur', 'Ba\'da Ashar', 'Ba\'da Maghrib', 'Ba\'da Isya', 'Shubuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya', 'Sholat Jumat']
                                                        .filter(w => w.toLowerCase().includes((editingKajian.waktu_mulai || '').toLowerCase()))
                                                        .map(waktu => (
                                                            <button
                                                                key={waktu}
                                                                type="button"
                                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm"
                                                                onClick={() => {
                                                                    setEditingKajian({ ...editingKajian, waktu_mulai: waktu });
                                                                    setIsWaktuDropdownOpen(false);
                                                                }}
                                                            >
                                                                {waktu}
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Waktu Selesai</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900 placeholder:text-slate-400"
                                            value={editingKajian.waktu_selesai || 'Selesai'}
                                            onChange={e => setEditingKajian({ ...editingKajian, waktu_selesai: e.target.value })}
                                            placeholder="Selesai / 20.00"
                                        />
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Alamat Lengkap</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-900 placeholder:text-slate-400"
                                        value={editingKajian.address}
                                        onChange={e => setEditingKajian({ ...editingKajian, address: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Contact Person (CP)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-emerald-700 placeholder:text-slate-400"
                                            value={editingKajian.cp || ''}
                                            onChange={e => setEditingKajian({ ...editingKajian, cp: e.target.value })}
                                            placeholder="08..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Link Google Maps</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-blue-700 truncate placeholder:text-slate-400"
                                                value={editingKajian.gmapsUrl || ''}
                                                onChange={e => setEditingKajian({ ...editingKajian, gmapsUrl: e.target.value })}
                                                placeholder="https://maps.app.goo.gl/..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleExtractCoords(editingKajian.gmapsUrl || '')}
                                                disabled={!editingKajian.gmapsUrl}
                                                className="px-3 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-50"
                                                title="Ekstrak Lat/Lng"
                                            >
                                                <MapPin className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Latitude"
                                                    value={editingKajian.lat || ''}
                                                    onChange={e => setEditingKajian({ ...editingKajian, lat: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Longitude"
                                                    value={editingKajian.lng || ''}
                                                    onChange={e => setEditingKajian({ ...editingKajian, lng: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Link Pendaftaran / Streaming</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-blue-700 placeholder:text-slate-400"
                                        value={editingKajian.linkInfo || ''}
                                        onChange={e => setEditingKajian({ ...editingKajian, linkInfo: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <ImageUpload
                                        label="Poster / Gambar Kajian"
                                        value={editingKajian.imageUrl || ''}
                                        onChange={(url) => setEditingKajian({ ...editingKajian, imageUrl: url })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${editingKajian.khususAkhwat ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                                            checked={editingKajian.khususAkhwat || false}
                                            onChange={e => setEditingKajian({ ...editingKajian, khususAkhwat: e.target.checked })}
                                        />
                                        <span className={`font-bold ${editingKajian.khususAkhwat ? 'text-pink-700' : 'text-slate-600'}`}>Khusus Akhwat</span>
                                    </label>

                                    <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${editingKajian.isOnline ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            checked={editingKajian.isOnline || false}
                                            onChange={e => setEditingKajian({ ...editingKajian, isOnline: e.target.checked })}
                                        />
                                        <span className={`font-bold ${editingKajian.isOnline ? 'text-blue-700' : 'text-slate-600'}`}>Online / Streaming</span>
                                    </label>

                                    <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${editingKajian.isKidsFriendly ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                            checked={editingKajian.isKidsFriendly || false}
                                            onChange={e => setEditingKajian({ ...editingKajian, isKidsFriendly: e.target.checked })}
                                        />
                                        <span className={`font-bold ${editingKajian.isKidsFriendly ? 'text-orange-700' : 'text-slate-600'}`}>🎈 Kajian Anak</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold rounded-xl transition-all"
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
            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Hapus Jadwal Kajian?"
                    message="Tindakan ini tidak dapat dibatalkan. Data jadwal yang dihapus akan hilang permanen dari database."
                    confirmText="Hapus Sekarang"
                    cancelText="Batal"
                    type="danger"
                    isLoading={isDeleting}
                />
            )}

            {/* Duplicate Scan Modal */}
            {isDuplicateScanModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    Hasil Scan Duplikat
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {duplicateGroups.length === 0
                                        ? 'Tidak ada kajian duplikat ditemukan'
                                        : `Ditemukan ${duplicateGroups.length} grup duplikat`}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsDuplicateScanModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {duplicateGroups.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-bold text-slate-900">Alhamdulillah!</p>
                                    <p className="text-slate-500 mt-2">Tidak ada kajian duplikat di database</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {duplicateGroups.map((group, groupIdx) => (
                                        <div key={groupIdx} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="bg-amber-100 p-2 rounded-lg">
                                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-amber-900 text-sm">Duplikat #{groupIdx + 1}</h3>
                                                    <p className="text-xs text-amber-700 mt-1">{group.key}</p>
                                                    <p className="text-xs text-amber-600 mt-1">{group.items.length} kajian dengan masjid, tanggal, dan waktu yang sama</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {group.items.map((item: Kajian, itemIdx: number) => (
                                                    <div key={item.id} className="bg-white p-3 rounded-lg border border-amber-200">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-bold text-slate-500">ID: {item.id}</span>
                                                                    {itemIdx === 0 && (
                                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                                                            Original
                                                                        </span>
                                                                    )}
                                                                    {itemIdx > 0 && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                                                            Duplikat
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="font-bold text-slate-900 text-sm">{item.tema}</p>
                                                                <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                                                                    <p>👤 {item.pemateri}</p>
                                                                    <p>🏙️ {item.city}</p>
                                                                    <p>🕌 {item.masjid}</p>
                                                                    <p>📅 {item.date} • ⏰ {item.waktu}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Link
                                                                    href={`/kajian/${item.id}`}
                                                                    target="_blank"
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Preview"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingKajian(item);
                                                                        setIsEditModalOpen(true);
                                                                        setIsDuplicateScanModalOpen(false);
                                                                    }}
                                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                    title="Edit kajian"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                {itemIdx > 0 && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setDuplicateToDelete(item);
                                                                            setIsDeleteDuplicateModalOpen(true);
                                                                        }}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Hapus duplikat"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                            <button
                                onClick={() => setIsDuplicateScanModalOpen(false)}
                                className="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Duplicate Confirmation Modal */}
            {isDeleteDuplicateModalOpen && duplicateToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteDuplicateModalOpen}
                    onClose={() => {
                        setIsDeleteDuplicateModalOpen(false);
                        setDuplicateToDelete(null);
                    }}
                    onConfirm={confirmDeleteDuplicate}
                    title="Hapus Kajian Duplikat?"
                    message={`Apakah Anda yakin ingin menghapus kajian duplikat "${duplicateToDelete.tema}"? Data yang dihapus tidak dapat dikembalikan.`}
                    confirmText="Hapus Kajian"
                    cancelText="Batal"
                    type="danger"
                    isLoading={isDeletingDuplicate}
                />
            )}

            {/* Toast Notification */}
            {notification && (
                <div className="fixed bottom-4 right-4 z-[200] animate-in slide-in-from-bottom-5 duration-300">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md ${notification.type === 'success' ? 'bg-green-600 text-white' :
                        notification.type === 'error' ? 'bg-red-600 text-white' :
                            'bg-blue-600 text-white'
                        }`}>
                        <div className="flex-1">
                            <p className="font-bold text-sm">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
