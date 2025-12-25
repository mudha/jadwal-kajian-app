'use client';
import { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Plus, Calendar, MapPin, X, Save, AlertTriangle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { indonesianCities } from '@/data/cities';
import { parseIndoDate, formatIndoDate, formatYYYYMMDD } from '@/lib/date-utils';

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
    imageUrl?: string;
    attendanceCount?: number;
    lat?: number;
    lng?: number;
}

export default function AdminManagePage() {
    const [kajianList, setKajianList] = useState<Kajian[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKajian, setEditingKajian] = useState<Kajian | null>(null);

    const [isUploading, setIsUploading] = useState(false);

    // City Autocomplete State
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
    const [cityFilter, setCityFilter] = useState('');

    // Masjid Autocomplete State
    const [isMasjidDropdownOpen, setIsMasjidDropdownOpen] = useState(false);
    const [masjidSuggestions, setMasjidSuggestions] = useState<Array<{ value: string; count: number }>>([]);

    // Pemateri Autocomplete State
    const [isPemateriDropdownOpen, setIsPemateriDropdownOpen] = useState(false);
    const [pemateriSuggestions, setPemateriSuggestions] = useState<Array<{ value: string; count: number }>>([]);

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                setIsUploading(true);
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.url) {
                        setEditingKajian((prev: any) => prev ? ({ ...prev, imageUrl: data.url }) : null);
                    }
                } catch (err) {
                    console.error('Upload failed', err);
                    alert('Gagal upload gambar paste');
                } finally {
                    setIsUploading(false);
                }
            }
        }
    };

    const fetchMasjidSuggestions = async (query: string) => {
        if (!query || query.length < 2) {
            setMasjidSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`/api/admin/suggestions?type=masjid&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setMasjidSuggestions(data);
        } catch (error) {
            console.error('Error fetching masjid suggestions:', error);
        }
    };

    const fetchPemateriSuggestions = async (query: string) => {
        if (!query || query.length < 2) {
            setPemateriSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`/api/admin/suggestions?type=pemateri&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setPemateriSuggestions(data);
        } catch (error) {
            console.error('Error fetching pemateri suggestions:', error);
        }
    };

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

    const handleExtractCoordinates = async () => {
        if (!confirm('Ekstrak koordinat dari semua Google Maps URL?\n\nIni akan mengupdate kajian yang punya gmapsUrl tapi belum punya koordinat lat/lng.')) {
            return;
        }

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

                alert(message);
                // Refresh data
                fetchData();
            } else {
                alert(`✗ Gagal: ${data.error}`);
            }
        } catch (error) {
            console.error('Error extracting coordinates:', error);
            alert('Terjadi kesalahan saat mengekstrak koordinat');
        }
    };

    const filteredList = kajianList.filter(k =>
        k.masjid.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.pemateri.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.tema.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                alert(`Koordinat ditemukan: ${data.lat}, ${data.lng}`);
            } else {
                alert('Gagal mengekstrak koordinat dari URL tersebut.');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat mengekstrak koordinat.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Kelola Jadwal Kajian</h1>
                    <p className="text-slate-500">Update, edit, atau hapus jadwal kajian yang terdaftar.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleExtractCoordinates}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm"
                        title="Ekstrak koordinat dari Google Maps URL"
                    >
                        <MapPin className="w-4 h-4" />
                        Extract Koordinat
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
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Peserta</th>
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
                                            <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{item.pemateri}</div>
                                            <p className="text-sm text-slate-500 line-clamp-1" title={item.tema}>{item.tema}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold text-xs">
                                                {item.attendanceCount || 0}
                                            </span>
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
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                            value={editingKajian.masjid}
                                            onChange={e => {
                                                setEditingKajian({ ...editingKajian, masjid: e.target.value });
                                                fetchMasjidSuggestions(e.target.value);
                                                setIsMasjidDropdownOpen(true);
                                            }}
                                            onFocus={() => {
                                                if (editingKajian.masjid.length >= 2) {
                                                    fetchMasjidSuggestions(editingKajian.masjid);
                                                    setIsMasjidDropdownOpen(true);
                                                }
                                            }}
                                            onBlur={() => setTimeout(() => setIsMasjidDropdownOpen(false), 200)}
                                            placeholder="Ketik nama masjid..."
                                            required
                                        />
                                        {isMasjidDropdownOpen && masjidSuggestions.length > 0 && (
                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                {masjidSuggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm flex items-center justify-between"
                                                        onClick={() => {
                                                            setEditingKajian({ ...editingKajian, masjid: suggestion.value });
                                                            setIsMasjidDropdownOpen(false);
                                                        }}
                                                    >
                                                        <span>{suggestion.value}</span>
                                                        <span className="text-xs text-slate-400">{suggestion.count}x</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Pemateri</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
                                                value={editingKajian.pemateri}
                                                onChange={e => {
                                                    setEditingKajian({ ...editingKajian, pemateri: e.target.value });
                                                    fetchPemateriSuggestions(e.target.value);
                                                    setIsPemateriDropdownOpen(true);
                                                }}
                                                onFocus={() => {
                                                    if (editingKajian.pemateri.length >= 2) {
                                                        fetchPemateriSuggestions(editingKajian.pemateri);
                                                        setIsPemateriDropdownOpen(true);
                                                    }
                                                }}
                                                onBlur={() => setTimeout(() => setIsPemateriDropdownOpen(false), 200)}
                                                placeholder="Ketik nama ustadz..."
                                                required
                                            />
                                            {isPemateriDropdownOpen && pemateriSuggestions.length > 0 && (
                                                <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                                                    {pemateriSuggestions.map((suggestion, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium text-slate-700 text-sm flex items-center justify-between"
                                                            onClick={() => {
                                                                setEditingKajian({ ...editingKajian, pemateri: suggestion.value });
                                                                setIsPemateriDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span>{suggestion.value}</span>
                                                            <span className="text-xs text-slate-400">{suggestion.count}x</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kota / Wilayah</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
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
                                            type="date"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold"
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
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-blue-600 truncate"
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
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    placeholder="Longitude"
                                                    value={editingKajian.lng || ''}
                                                    onChange={e => setEditingKajian({ ...editingKajian, lng: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                                                />
                                            </div>
                                        </div>
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

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Poster / Gambar Kajian (URL)</label>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium text-xs truncate transition-all group-hover:bg-white"
                                                    placeholder="Paste URL atau Gambar (Ctrl+V) di sini..."
                                                    value={editingKajian.imageUrl || ''}
                                                    onChange={e => setEditingKajian({ ...editingKajian, imageUrl: e.target.value })}
                                                    onPaste={handlePaste}
                                                />
                                                {isUploading && (
                                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-blue-600 animate-spin">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    </div>
                                                )}
                                                {editingKajian.imageUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingKajian({ ...editingKajian, imageUrl: '' })}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Hapus URL"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {editingKajian.imageUrl && (
                                            <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                                                <img
                                                    src={editingKajian.imageUrl}
                                                    className="w-full h-full object-cover"
                                                    alt="Preview"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingKajian({ ...editingKajian, imageUrl: '' })}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> Hapus Gambar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all mt-4">
                                    <input
                                        type="checkbox"
                                        id="khususAkhwat"
                                        className="w-5 h-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                                        checked={editingKajian.khususAkhwat || false}
                                        onChange={e => setEditingKajian({ ...editingKajian, khususAkhwat: e.target.checked })}
                                    />
                                    <span className="font-bold text-slate-700">Khusus Akhwat / Muslimah</span>
                                </label>
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
