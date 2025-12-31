'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, ExternalLink, GitMerge, Sparkles, X, RefreshCw, Eye } from 'lucide-react';
import DuplicateGroupList from '@/components/admin/DuplicateGroupList';

import ConfirmationModal from '@/components/admin/ConfirmationModal';

interface Masjid {
    id: string;
    name: string;
    city: string;
    address?: string;
    gmapsUrl?: string;
    lat?: number;
    lng?: number;
    kajianCount?: number;
}

export default function MasjidManagementPage() {
    const [masjidList, setMasjidList] = useState<Masjid[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMasjid, setEditingMasjid] = useState<Masjid | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        city: string;
        address: string;
        gmapsUrl: string;
        lat: string | number;
        lng: string | number;
    }>({ name: '', city: '', address: '', gmapsUrl: '', lat: '', lng: '' });
    const [loading, setLoading] = useState(true);
    const [selectedForMerge, setSelectedForMerge] = useState<Set<string>>(new Set());
    const [mergeTarget, setMergeTarget] = useState('');
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const [filterNoCoords, setFilterNoCoords] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [masjidToDelete, setMasjidToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Alert Modal State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    // List Modal States
    const [isMasjidListModalOpen, setIsMasjidListModalOpen] = useState(false);
    const [isCityListModalOpen, setIsCityListModalOpen] = useState(false);
    const [isKajianListModalOpen, setIsKajianListModalOpen] = useState(false);
    const [selectedMasjidForKajian, setSelectedMasjidForKajian] = useState<Masjid | null>(null);
    const [kajianList, setKajianList] = useState<any[]>([]);

    // Kajian Delete Modal State
    const [isKajianDeleteModalOpen, setIsKajianDeleteModalOpen] = useState(false);
    const [kajianToDelete, setKajianToDelete] = useState<any>(null);
    const [isDeletingKajian, setIsDeletingKajian] = useState(false);

    // Bulk Extract Modal State
    const [isBulkExtractModalOpen, setIsBulkExtractModalOpen] = useState(false);
    const [bulkExtractToProcess, setBulkExtractToProcess] = useState<Masjid[]>([]);
    const [bulkExtractMode, setBulkExtractMode] = useState<'all' | 'coords'>('all');
    const [isFinalConfirmOpen, setIsFinalConfirmOpen] = useState(false);
    const [bulkExtractStats, setBulkExtractStats] = useState<{ success: number, fail: number } | null>(null);

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
                ? `/api/admin/masjid/${encodeURIComponent(editingMasjid.name)}`
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
                setFormData({ name: '', city: '', address: '', gmapsUrl: '', lat: '', lng: '' });
                setEditingMasjid(null);
            }
        } catch (error) {
            console.error('Error saving masjid:', error);
        }
    };

    const handleDelete = (id: string) => {
        setMasjidToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!masjidToDelete) return;
        setIsDeleting(true);
        try {
            const masjid = masjidList.find(m => m.id === masjidToDelete);
            if (!masjid) return;

            const response = await fetch(`/api/admin/masjid/${encodeURIComponent(masjid.name)}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchMasjid();
                setIsDeleteModalOpen(false);
                setMasjidToDelete(null);
            } else {
                showAlert('Gagal', 'Gagal menghapus masjid', 'danger');
            }
        } catch (error) {
            console.error('Error deleting masjid:', error);
            showAlert('Kesalahan', 'Terjadi kesalahan saat menghapus data', 'danger');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (masjid: Masjid) => {
        setEditingMasjid(masjid);
        setFormData({
            name: masjid.name,
            city: masjid.city,
            address: masjid.address || '',
            gmapsUrl: masjid.gmapsUrl || '',
            lat: masjid.lat || '',
            lng: masjid.lng || '',
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingMasjid(null);
        setFormData({ name: '', city: '', address: '', gmapsUrl: '', lat: '', lng: '' });
        setIsModalOpen(true);
    };

    const fetchKajianByMasjid = async (masjidName: string) => {
        try {
            const response = await fetch('/api/kajian');
            const data = await response.json();
            const filtered = data.filter((k: any) => k.masjid === masjidName);
            setKajianList(filtered);
        } catch (error) {
            console.error('Error fetching kajian:', error);
            setKajianList([]);
        }
    };

    const confirmDeleteKajian = async () => {
        if (!kajianToDelete) return;
        setIsDeletingKajian(true);
        try {
            const res = await fetch(`/api/kajian/${kajianToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                // Refresh kajian list
                if (selectedMasjidForKajian) {
                    fetchKajianByMasjid(selectedMasjidForKajian.name);
                }
                // Refresh masjid list to update count
                fetchMasjid();
                setIsKajianDeleteModalOpen(false);
                setKajianToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting kajian:', error);
        } finally {
            setIsDeletingKajian(false);
        }
    };

    const [pendingSyncData, setPendingSyncData] = useState<any>(null);
    const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
    const [syncType, setSyncType] = useState<'form' | 'list' | null>(null); // 'form' for edit modal, 'list' for single sync

    const handleExtractCoords = async (url: string) => {
        if (!url) return;
        setLoading(true);
        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();
            setLoading(false); // Stop loading before showing modal/result

            if (data.success) {
                if (data.placeName && data.placeName !== formData.name) {
                    // Ask for confirmation
                    setPendingSyncData(data);
                    setSyncType('form');
                    setIsSyncConfirmOpen(true);
                } else {
                    // Direct update if name matches or no name found
                    setFormData(prev => ({
                        ...prev,
                        lat: data.lat,
                        lng: data.lng,
                        gmapsUrl: data.expandedUrl || url
                    }));
                    // Use a toast here in future, for now just silent or small info?
                    // alert(`Koordinat ditemukan: ${data.lat}, ${data.lng}`); // Removing this alert as per request, maybe just fill fields
                }
            } else {
                showAlert('Gagal', 'Gagal mengekstrak koordinat dari URL tersebut.', 'danger');
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            showAlert('Kesalahan', 'Terjadi kesalahan saat mengekstrak koordinat.', 'danger');
        }
    };

    const confirmSync = (updateName: boolean) => {
        if (!pendingSyncData) return;

        if (syncType === 'form') {
            setFormData(prev => ({
                ...prev,
                lat: pendingSyncData.lat,
                lng: pendingSyncData.lng,
                gmapsUrl: pendingSyncData.expandedUrl || prev.gmapsUrl,
                name: updateName ? pendingSyncData.placeName : prev.name
            }));
        } else if (syncType === 'list') {
            // Handle list item sync finalization
            const masjid = pendingSyncData.originalMasjid;
            const newName = updateName ? pendingSyncData.placeName : masjid.name;

            // Trigger actual update API
            fetch(`/api/admin/masjid/${encodeURIComponent(masjid.name)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    city: masjid.city,
                    address: masjid.address,
                    gmapsUrl: pendingSyncData.expandedUrl || masjid.gmapsUrl,
                    lat: pendingSyncData.lat,
                    lng: pendingSyncData.lng
                })
            }).then(() => {
                fetchMasjid();
            });
        }

        setIsSyncConfirmOpen(false);
        setPendingSyncData(null);
        setSyncType(null);
    };

    const filteredMasjid = masjidList.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNoCoords = filterNoCoords ? (!m.lat || !m.lng) : true;
        return matchesSearch && matchesNoCoords;
    });

    const toggleMergeSelection = (id: string) => {
        const newSelected = new Set(selectedForMerge);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedForMerge(newSelected);
    };

    const handleMerge = async () => {
        if (selectedForMerge.size < 2) {
            showAlert('Perhatian', 'Pilih minimal 2 masjid untuk digabung', 'warning');
            return;
        }

        if (!mergeTarget) {
            showAlert('Perhatian', 'Pilih nama target untuk penggabungan', 'warning');
            return;
        }

        // Convert IDs to masjid names
        const selectedMasjids = masjidList.filter(m => selectedForMerge.has(m.id));
        const targetMasjid = masjidList.find(m => m.id === mergeTarget);

        if (!targetMasjid) {
            showAlert('Error', 'Masjid target tidak ditemukan', 'danger');
            return;
        }

        const sourceNames = selectedMasjids
            .filter(m => m.id !== mergeTarget)
            .map(m => m.name);

        if (sourceNames.length === 0) {
            showAlert('Perhatian', 'Nama target tidak boleh sama dengan semua nama yang dipilih', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/admin/masjid/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceNames, targetName: targetMasjid.name }),
            });

            if (response.ok) {
                showAlert('Berhasil', `Berhasil menggabungkan ${sourceNames.length} masjid`, 'info');
                setSelectedForMerge(new Set());
                setMergeTarget('');
                setIsMergeModalOpen(false);
                fetchMasjid();
            } else {
                const errorData = await response.json();
                showAlert('Gagal', `Gagal menggabungkan masjid: ${errorData.error || 'Unknown error'}`, 'danger');
            }
        } catch (error) {
            console.error('Error merging masjid:', error);
            showAlert('Kesalahan', 'Terjadi kesalahan saat menggabungkan', 'danger');
        }
    };

    const handleBulkExtract = () => {
        const toExtract = masjidList.filter(m => m.gmapsUrl);
        if (toExtract.length === 0) {
            showAlert('Pesan', 'Tidak ada masjid yang memiliki URL Maps.', 'info');
            return;
        }

        setBulkExtractToProcess(toExtract);
        setIsBulkExtractModalOpen(true);
    };

    const proceedToFinalConfirm = (mode: 'all' | 'coords') => {
        setBulkExtractMode(mode);
        setIsBulkExtractModalOpen(false);
        setIsFinalConfirmOpen(true);
    };

    const startBulkExtract = async () => {
        setIsFinalConfirmOpen(false);
        setLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const masjid of bulkExtractToProcess) {
            try {
                const res = await fetch('/api/tools/extract-gmaps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: masjid.gmapsUrl })
                });
                const data = await res.json();

                if (data.success) {
                    const updateData = {
                        name: (bulkExtractMode === 'all' && data.placeName) ? data.placeName : masjid.name,
                        city: masjid.city,
                        address: masjid.address,
                        gmapsUrl: data.expandedUrl || masjid.gmapsUrl,
                        lat: data.lat,
                        lng: data.lng
                    };

                    await fetch(`/api/admin/masjid/${encodeURIComponent(masjid.name)}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`Error processing ${masjid.name}:`, error);
                failCount++;
            }
        }

        setLoading(false);
        setBulkExtractStats({ success: successCount, fail: failCount });
        fetchMasjid();
    };

    const handleSingleSync = async (masjid: Masjid) => {
        if (!masjid.gmapsUrl) return;
        setLoading(true);
        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: masjid.gmapsUrl })
            });
            const data = await res.json();

            if (data.success) {
                const newName = data.placeName || masjid.name;
                // Store original masjid to reference ID/City etc later
                setPendingSyncData({ ...data, originalMasjid: masjid });
                setSyncType('list');
                setIsSyncConfirmOpen(true);
            } else {
                showAlert('Gagal', 'Gagal mengambil data dari Google Maps.', 'danger');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Kelola Masjid</h1>
                    <p className="text-slate-500 mt-1">Manajemen data masjid/tempat kajian</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedForMerge.size > 0 && (
                        <button
                            onClick={() => setIsMergeModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all text-sm shadow-md shadow-amber-200"
                        >
                            <GitMerge className="w-4 h-4" />
                            Gabung ({selectedForMerge.size})
                        </button>
                    )}
                    <button
                        onClick={() => setIsDuplicateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all text-sm shadow-md shadow-purple-200"
                    >
                        <Sparkles className="w-4 h-4" />
                        Cek Duplikat
                    </button>
                    <button
                        onClick={handleBulkExtract}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all text-sm shadow-md shadow-blue-200"
                        title="Scan koordinat dari link maps"
                    >
                        <MapPin className="w-4 h-4" />
                        Scan Koordinat
                    </button>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all text-sm shadow-md shadow-teal-200"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Masjid
                    </button>
                </div>
            </div>

            {/* Search */}
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama masjid atau kota..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex items-center">
                    <label className={`flex items-center gap-3 px-6 py-3 rounded-xl border cursor-pointer transition-all select-none ${filterNoCoords ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input
                            type="checkbox"
                            checked={filterNoCoords}
                            onChange={(e) => setFilterNoCoords(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="font-bold whitespace-nowrap">Belum ada GPS ({masjidList.filter(m => !m.lat || !m.lng).length})</span>
                    </label>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => setIsMasjidListModalOpen(true)}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-teal-100 p-3 rounded-xl group-hover:bg-teal-200 transition-colors">
                            <MapPin className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-sm font-medium">Total Masjid</p>
                            <p className="text-2xl font-bold text-slate-900">{masjidList.length}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                </button>
                <button
                    onClick={() => setIsCityListModalOpen(true)}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer text-left group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-500 text-sm font-medium">Total Kota</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {new Set(masjidList.map(m => m.city)).size}
                            </p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">Memuat data...</div>
                ) : filteredMasjid.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 shadow-sm">
                        Tidak ada data masjid
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-3 py-3 text-left w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedForMerge.size === filteredMasjid.length && filteredMasjid.length > 0}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedForMerge(new Set(filteredMasjid.map(m => m.id)));
                                                        } else {
                                                            setSelectedForMerge(new Set());
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-2 focus:ring-teal-500"
                                                />
                                            </th>
                                            <th className="px-2 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                                                No
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Nama Masjid
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Kota
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider max-w-[150px]">
                                                Alamat
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                G.Maps
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Lat/Lng
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Kajian
                                            </th>
                                            <th className="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredMasjid.map((masjid, index) => (
                                            <tr key={masjid.id} className={`hover:bg-slate-50 transition-colors ${selectedForMerge.has(masjid.id) ? 'bg-amber-50' : ''}`}>
                                                <td className="px-3 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedForMerge.has(masjid.id)}
                                                        onChange={() => toggleMergeSelection(masjid.id)}
                                                        className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-sm text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                                                            <MapPin className="w-4 h-4 text-teal-600" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 text-sm">{masjid.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                                        {masjid.city}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-sm text-slate-600 max-w-[150px]">
                                                    <div className="break-words whitespace-normal leading-relaxed truncate">
                                                        {masjid.address || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    {masjid.gmapsUrl ? (
                                                        <a
                                                            href={masjid.gmapsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            Map
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-xs font-mono text-slate-500">
                                                    {masjid.lat && masjid.lng ? (
                                                        <div className="flex flex-col text-xs">
                                                            <span>{masjid.lat.toFixed(4)}</span>
                                                            <span>{masjid.lng.toFixed(4)}</span>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-3 py-3">
                                                    {masjid.kajianCount && masjid.kajianCount > 0 ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedMasjidForKajian(masjid);
                                                                setIsKajianListModalOpen(true);
                                                                fetchKajianByMasjid(masjid.name);
                                                            }}
                                                            className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
                                                        >
                                                            {masjid.kajianCount}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">0</span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleSingleSync(masjid)}
                                                            disabled={!masjid.gmapsUrl || loading}
                                                            title="Sinkronisasi Nama & Koordinat dari Google Maps"
                                                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30"
                                                        >
                                                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(masjid)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(masjid.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                            {filteredMasjid.map((masjid) => (
                                <div
                                    key={masjid.id}
                                    className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 ${selectedForMerge.has(masjid.id) ? 'bg-amber-50 border-amber-200' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={selectedForMerge.has(masjid.id)}
                                                onChange={() => toggleMergeSelection(masjid.id)}
                                                className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 shrink-0 mt-1"
                                            />
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900 truncate pr-2">{masjid.name}</h3>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mt-1">
                                                    {masjid.city}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => handleSingleSync(masjid)}
                                                disabled={!masjid.gmapsUrl || loading}
                                                className="p-2.5 text-teal-600 bg-teal-50 border border-teal-100 rounded-xl hover:bg-teal-100 active:scale-95 transition-all disabled:opacity-30"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(masjid)}
                                                className="p-2.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(masjid.id)}
                                                className="p-2.5 text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="text-sm text-slate-600 pl-8 space-y-2">
                                        <p className="line-clamp-2">{masjid.address || '-'}</p>
                                        {masjid.gmapsUrl && (
                                            <a
                                                href={masjid.gmapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg w-fit"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                Buka Google Maps
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 pl-8 mt-1">
                                        <div className="text-xs font-mono text-slate-400">
                                            {masjid.lat && masjid.lng ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-400"></span> GPS Found
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span> No GPS
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                            {masjid.kajianCount || 0} kajian
                                        </span>
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
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Link Google Maps (Opsional)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={formData.gmapsUrl}
                                        onChange={(e) => setFormData({ ...formData, gmapsUrl: e.target.value })}
                                        placeholder="https://maps.google.com/..."
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleExtractCoords(formData.gmapsUrl)}
                                        disabled={!formData.gmapsUrl}
                                        className="px-4 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-50"
                                        title="Ekstrak Lat/Lng"
                                    >
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 px-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.lat}
                                            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                            placeholder="Latitude"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 px-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            value={formData.lng}
                                            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                            placeholder="Longitude"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Paste link dari Google Maps untuk lokasi masjid
                                </p>
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
            {/* Merge Modal */}
            {isMergeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <GitMerge className="w-6 h-6" />
                                <div>
                                    <h2 className="text-xl font-bold">Gabung Masjid</h2>
                                    <p className="text-sm text-amber-100">Gabungkan {selectedForMerge.size} masjid menjadi satu</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Selected Names */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Masjid yang Dipilih ({selectedForMerge.size})
                                </label>
                                <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
                                    {Array.from(selectedForMerge).map((id) => {
                                        const masjid = masjidList.find(m => m.id === id);
                                        if (!masjid) return null;
                                        return (
                                            <div key={id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-900">{masjid.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 block">{masjid.city}</span>
                                                    <span className="text-xs text-slate-400 block">{masjid.kajianCount || 0} kajian</span>
                                                </div>
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
                                    {Array.from(selectedForMerge).map((id) => {
                                        const masjid = masjidList.find(m => m.id === id);
                                        if (!masjid) return null;
                                        return (
                                            <label
                                                key={id}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${mergeTarget === id
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="mergeTarget"
                                                    value={id}
                                                    checked={mergeTarget === id}
                                                    onChange={(e) => setMergeTarget(e.target.value)}
                                                    className="w-5 h-5 text-amber-600 focus:ring-2 focus:ring-amber-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-bold text-slate-900 block">{masjid.name}</span>
                                                    <span className="text-sm text-slate-500">{masjid.city}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    onClick={() => setIsMergeModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleMerge}
                                    className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors"
                                >
                                    Gabungkan Masjid
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Modal */}
            {isDuplicateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                Deteksi Duplikat Masjid
                            </h2>
                            <button
                                onClick={() => setIsDuplicateModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <DuplicateGroupList
                                type="masjid"
                                onSelectGroup={(items) => {
                                    setIsDuplicateModalOpen(false);
                                    const newSelected = new Set<string>();
                                    // Map names to IDs
                                    items.forEach(name => {
                                        const masjid = masjidList.find(m => m.name === name);
                                        if (masjid) newSelected.add(masjid.id);
                                    });
                                    setSelectedForMerge(newSelected);

                                    // Set target to canonical (first item) if found
                                    const target = masjidList.find(m => m.name === items[0]);
                                    if (target) setMergeTarget(target.id);

                                    setIsMergeModalOpen(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Hapus Data Masjid?"
                    message="Masjid yang dihapus akan hilang permanen beserta seluruh relasi kajianya jika ada."
                    confirmText="Hapus Masjid"
                    cancelText="Batal"
                    type="danger"
                    isLoading={isDeleting}
                />
            )}
            {/* Sync Confirmation Modal */}
            <ConfirmationModal
                isOpen={isSyncConfirmOpen}
                onClose={() => {
                    setIsSyncConfirmOpen(false);
                    setPendingSyncData(null);
                    setSyncType(null);
                }}
                onConfirm={() => confirmSync(true)}
                title={syncType === 'form' ? "Update Nama Masjid?" : "Sinkronisasi Data?"}
                message={
                    pendingSyncData
                        ? (syncType === 'form'
                            ? `Nama di Google Maps: "${pendingSyncData.placeName}".\nApakah Anda ingin mengubah nama masjid saat ini menjadi nama tersebut?`
                            : `Ditemukan data baru dari Google Maps: "${pendingSyncData.placeName}".\nUpdate nama dan koordinat masjid ini?`)
                        : ''
                }
                confirmText={syncType === 'form' ? "Ya, Ubah Nama" : "Ya, Update Data"}
                cancelText={syncType === 'form' ? "Tidak, Biarkan Nama Lama" : "Batal"}
                type="info"
            />

            {/* Masjid List Modal */}
            {isMasjidListModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                    Daftar Masjid ({masjidList.length})
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Semua masjid yang terdaftar di sistem</p>
                            </div>
                            <button
                                onClick={() => setIsMasjidListModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="space-y-2">
                                {masjidList.map((masjid, idx) => (
                                    <div
                                        key={masjid.id}
                                        className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <span className="text-teal-700 font-bold text-sm">{idx + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{masjid.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500">{masjid.city}</span>
                                                {masjid.kajianCount !== undefined && masjid.kajianCount > 0 && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                        {masjid.kajianCount} kajian
                                                    </span>
                                                )}
                                                {masjid.lat && masjid.lng && (
                                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                                                        GPS
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {masjid.gmapsUrl && (
                                            <a
                                                href={masjid.gmapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                title="Buka di Google Maps"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* City List Modal */}
            {isCityListModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Daftar Kota ({new Set(masjidList.map(m => m.city)).size})
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">Kota yang memiliki masjid terdaftar</p>
                            </div>
                            <button
                                onClick={() => setIsCityListModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Array.from(new Set(masjidList.map(m => m.city)))
                                    .sort()
                                    .map((city, idx) => {
                                        const count = masjidList.filter(m => m.city === city).length;
                                        return (
                                            <div
                                                key={city}
                                                className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-blue-700 font-bold text-sm">{idx + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate">{city}</p>
                                                    <p className="text-xs text-slate-500">{count} masjid</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Kajian List Modal */}
            {isKajianListModalOpen && selectedMasjidForKajian && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-orange-600" />
                                    Kajian di {selectedMasjidForKajian.name}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">{kajianList.length} kajian terdaftar</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsKajianListModalOpen(false);
                                    setSelectedMasjidForKajian(null);
                                    setKajianList([]);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {kajianList.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-slate-400">Tidak ada kajian terdaftar</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {kajianList.map((kajian, idx) => (
                                        <div
                                            key={kajian.id}
                                            className="flex items-start gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <span className="text-orange-700 font-bold text-sm">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 mb-1">{kajian.tema}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {kajian.pemateri}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {kajian.date}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {kajian.waktu}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <a
                                                    href={`/kajian/${kajian.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Preview Kajian"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                <a
                                                    href={`/admin/manage?edit=${kajian.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Kajian"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        setKajianToDelete(kajian);
                                                        setIsKajianDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Kajian"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Kajian Delete Modal */}
            {isKajianDeleteModalOpen && kajianToDelete && (
                <ConfirmationModal
                    isOpen={isKajianDeleteModalOpen}
                    onClose={() => {
                        setIsKajianDeleteModalOpen(false);
                        setKajianToDelete(null);
                    }}
                    onConfirm={confirmDeleteKajian}
                    title="Hapus Kajian?"
                    message={`Apakah Anda yakin ingin menghapus kajian "${kajianToDelete.tema}"? Data yang dihapus tidak dapat dikembalikan.`}
                    confirmText="Hapus Kajian"
                    cancelText="Batal"
                    type="danger"
                    isLoading={isDeletingKajian}
                />
            )}

            {/* Bulk Extract Sequence Modals */}
            {isBulkExtractModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden">
                        <div className="p-6 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg">Pilih Mode Update</h3>
                            <button onClick={() => setIsBulkExtractModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-600 mb-6">Anda akan memproses <b>{bulkExtractToProcess.length}</b> masjid. Pilih informasi apa yang ingin diupdate dari Google Maps:</p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => proceedToFinalConfirm('all')}
                                    className="p-4 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-2xl text-left transition-all group"
                                >
                                    <div className="font-bold text-slate-900 group-hover:text-blue-700">🛒 Nama & Koordinat</div>
                                    <div className="text-xs text-slate-500">Update koordinat GPS sekaligus menyesuaikan nama masjid sesuai Google Maps.</div>
                                </button>
                                <button
                                    onClick={() => proceedToFinalConfirm('coords')}
                                    className="p-4 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-2xl text-left transition-all group"
                                >
                                    <div className="font-bold text-slate-900 group-hover:text-blue-700">📍 Koordinat Saja</div>
                                    <div className="text-xs text-slate-500">Hanya update koordinat GPS (Lat/Lng) tanpa mengubah nama masjid yang sudah ada.</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isFinalConfirmOpen && (
                <ConfirmationModal
                    isOpen={isFinalConfirmOpen}
                    onClose={() => setIsFinalConfirmOpen(false)}
                    onConfirm={startBulkExtract}
                    title="Mulai Update Massal?"
                    message={`Sistem akan memproses ${bulkExtractToProcess.length} masjid dengan mode "${bulkExtractMode === 'all' ? 'Nama & Koordinat' : 'Koordinat Saja'}". Proses ini mungkin memakan waktu beberapa saat.`}
                    confirmText="Ya, Mulai Sekarang"
                    cancelText="Batal"
                    type="warning"
                />
            )}

            {bulkExtractStats && (
                <ConfirmationModal
                    isOpen={!!bulkExtractStats}
                    onClose={() => setBulkExtractStats(null)}
                    onConfirm={() => setBulkExtractStats(null)}
                    title="Selesai!"
                    message={`Proses update massal telah selesai.\n\n✅ Berhasil: ${bulkExtractStats.success}\n❌ Gagal: ${bulkExtractStats.fail}`}
                    confirmText="Tutup"
                    showCancel={false}
                    type="info"
                />
            )}

            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText="OK"
                showCancel={false}
                type={alertConfig.type}
            />
        </div>
    );
}
