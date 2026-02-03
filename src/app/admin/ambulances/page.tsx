'use client';
import { useState, useEffect } from 'react';
import { Download, FileText, Plus, Pencil, Trash2, Search, X, Loader2, Database } from 'lucide-react';

interface Ambulance {
    id: number;
    name: string;
    region: string;
    city: string | null;
    address: string | null;
    contacts: string[];
    notes: string | null;
}

export default function AmbulancesPage() {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [filteredAmbulances, setFilteredAmbulances] = useState<Ambulance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        region: '',
        city: '',
        address: '',
        contacts: [''],
        notes: ''
    });

    useEffect(() => {
        fetchAmbulances();
    }, []);

    useEffect(() => {
        filterAmbulances();
    }, [searchQuery, selectedRegion, ambulances]);

    const fetchAmbulances = async () => {
        try {
            const res = await fetch('/api/ambulances');
            const data = await res.json();
            setAmbulances(data);
            setFilteredAmbulances(data);
        } catch (error) {
            console.error('Failed to fetch ambulances:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAmbulances = () => {
        let filtered = ambulances;

        if (selectedRegion) {
            filtered = filtered.filter(a => a.region === selectedRegion);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(query) ||
                a.region.toLowerCase().includes(query) ||
                a.city?.toLowerCase().includes(query) ||
                a.address?.toLowerCase().includes(query)
            );
        }

        setFilteredAmbulances(filtered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanContacts = formData.contacts.filter(c => c.trim() !== '');
        if (cleanContacts.length === 0) {
            alert('Minimal harus ada 1 kontak');
            return;
        }

        try {
            const url = editingId ? `/api/ambulances/${editingId}` : '/api/ambulances';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, contacts: cleanContacts })
            });

            if (res.ok) {
                await fetchAmbulances();
                resetForm();
                setShowModal(false);
            } else {
                const error = await res.json();
                alert(`Gagal menyimpan: ${error.error}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('Terjadi kesalahan saat menyimpan');
        }
    };

    const handleEdit = (ambulance: Ambulance) => {
        setEditingId(ambulance.id);
        setFormData({
            name: ambulance.name,
            region: ambulance.region,
            city: ambulance.city || '',
            address: ambulance.address || '',
            contacts: ambulance.contacts.length > 0 ? ambulance.contacts : [''],
            notes: ambulance.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus layanan ambulance ini?')) return;

        try {
            const res = await fetch(`/api/ambulances/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchAmbulances();
            } else {
                alert('Gagal menghapus');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Terjadi kesalahan saat menghapus');
        }
    };

    const handleSeed = async () => {
        if (!confirm('Ini akan memuat data awal ambulance dari file sistem. Data yang sudah ada tidak akan dihapus (ignore duplicates). Lanjutkan?')) return;

        setSeeding(true);
        try {
            const res = await fetch('/api/ambulances/seed', { method: 'POST' });
            if (res.ok) {
                alert('Data berhasil dimuat!');
                await fetchAmbulances();
            } else {
                alert('Gagal memuat data');
            }
        } catch (error) {
            console.error('Seeding error:', error);
            alert('Terjadi kesalahan saat seeding');
        } finally {
            setSeeding(false);
        }
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        setExporting(true);
        try {
            const res = await fetch('/api/ambulances/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format, region: selectedRegion })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ambulans-gratis.${format === 'excel' ? 'xlsx' : 'pdf'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Gagal export');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Terjadi kesalahan saat export');
        } finally {
            setExporting(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            region: '',
            city: '',
            address: '',
            contacts: [''],
            notes: ''
        });
    };

    const addContactField = () => {
        setFormData(prev => ({ ...prev, contacts: [...prev.contacts, ''] }));
    };

    const removeContactField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index)
        }));
    };

    const updateContact = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.map((c, i) => i === index ? value : c)
        }));
    };

    const regions = Array.from(new Set(ambulances.map(a => a.region))).sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Layanan Ambulance Gratis</h1>
                    <p className="text-slate-600 text-sm">Manajemen data layanan ambulance gratis untuk umat Muslim</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Baru
                </button>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama, region, kota..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Semua Region</option>
                        {regions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSeed}
                            disabled={seeding || loading}
                            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                            title="Load data awal dari file system"
                        >
                            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                            Data Awal
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Download className="w-4 h-4" />
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                    </div>
                </div>

                <div className="text-sm text-slate-600">
                    Menampilkan {filteredAmbulances.length} dari {ambulances.length} layanan
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Region</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kota</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kontak</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredAmbulances.map((ambulance) => (
                                    <tr key={ambulance.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{ambulance.name}</div>
                                            {ambulance.notes && (
                                                <div className="text-xs text-slate-500 mt-1">{ambulance.notes}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{ambulance.region}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{ambulance.city || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {ambulance.contacts.map((contact, idx) => (
                                                <div key={idx} className="text-blue-600">+{contact}</div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(ambulance)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ambulance.id)}
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
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingId ? 'Edit Layanan Ambulance' : 'Tambah Layanan Ambulance'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Organisasi/Masjid *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Region *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.region}
                                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value.toUpperCase() }))}
                                        placeholder="JAKARTA, BANDUNG, dll"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Kota</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Alamat</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp *</label>
                                {formData.contacts.map((contact, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <div className="flex-none px-3 py-2 bg-slate-100 rounded-lg text-slate-600">+</div>
                                        <input
                                            type="text"
                                            value={contact}
                                            onChange={(e) => updateContact(index, e.target.value)}
                                            placeholder="628123456789"
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formData.contacts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeContactField(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addContactField}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    + Tambah Kontak
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Catatan</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={2}
                                    placeholder="Informasi tambahan, nama CP, dll"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingId ? 'Update' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
