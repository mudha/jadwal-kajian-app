'use client';

import { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Phone, Banknote, Users, Share2, Crown, Loader2 } from 'lucide-react';

interface Sekolah {
    id: number;
    nama: string;
    slug: string;
    jenjang: string;
    kota: string;
    provinsi?: string;
    alamat: string;
    gmaps_url?: string;
    lat?: number;
    lng?: number;
    spp_bulanan?: number;
    uang_masuk?: number;
    deskripsi?: string;

    // Target & Fasilitas
    khusus_akhwat?: boolean;
    khusus_ikhwan?: boolean;
    is_full_day?: boolean;
    is_boarding?: boolean;
    is_paket_abc?: boolean;

    imageUrl?: string;

    // Kontak
    telepon?: string;
    telpon_2?: string;
    handphone?: string;
    contact_person_nama?: string;
    contact_person_hp?: string;
    website?: string;
    whatsapp_link?: string;
    email?: string;

    // Socials
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    telegram?: string;

    // Struktural
    pembina?: string;
    nama_pembina?: string;
    ketua_yayasan?: string;
    kepala_sekolah?: string;
    nama_yayasan?: string;
}

interface SchoolFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onSubmit?: (data: Partial<Sekolah>) => Promise<void>;
    editData?: Sekolah | null;
    initialData?: Partial<Sekolah> | null; // Add initialData alias for editData compatibility
}

const JENJANG_OPTIONS = ['DC', 'PAUD', 'TK', 'MI', 'SD', 'MTs', 'SMP', 'MA', 'SMA', 'SMK', 'PT', 'Pesantren', 'Kursus'];

export default function SchoolFormModal({ isOpen, onClose, onSuccess, onSubmit, editData, initialData }: SchoolFormModalProps) {
    const dataToEdit = editData || initialData;

    const [formData, setFormData] = useState<Partial<Sekolah>>({
        nama: '',
        jenjang: 'SD',
        kota: '',
        alamat: '',
        provinsi: '',
        khusus_ikhwan: true,
        khusus_akhwat: true,
        is_full_day: false,
        is_boarding: false,
        is_paket_abc: false,
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (dataToEdit) {
            setFormData({
                ...dataToEdit,
                khusus_akhwat: !!dataToEdit.khusus_akhwat,
                khusus_ikhwan: !!dataToEdit.khusus_ikhwan,
                is_full_day: !!dataToEdit.is_full_day,
                is_boarding: !!dataToEdit.is_boarding,
                is_paket_abc: !!dataToEdit.is_paket_abc,
            });
        } else {
            setFormData({
                nama: '',
                jenjang: 'SD',
                kota: '',
                alamat: '',
                provinsi: '',
                khusus_ikhwan: true,
                khusus_akhwat: true,
                is_full_day: false,
                is_boarding: false,
                is_paket_abc: false,
            });
        }
    }, [dataToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (onSubmit) {
                await onSubmit({ ...formData, id: dataToEdit?.id });
            } else {
                const url = dataToEdit?.id ? `/api/admin/sekolah/${dataToEdit.id}` : '/api/admin/sekolah';
                const method = dataToEdit?.id ? 'PATCH' : 'POST';

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) throw new Error('Failed to save');
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error saving school:', error);
            alert('Gagal menyimpan data. Silakan coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col">

                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
                    <div>
                        <h2 className="font-black text-xl text-slate-900 tracking-tight">
                            {editData?.id ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">Formulir data sekolah sunnah</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">

                    {/* Informasi Umum */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-black text-sm text-blue-600 uppercase tracking-wider">Informasi Umum</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Sekolah</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.nama || ''}
                                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                    placeholder="Nama lengkap sekolah..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jenjang</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all"
                                    value={formData.jenjang || 'SD'}
                                    onChange={e => setFormData({ ...formData, jenjang: e.target.value })}
                                >
                                    {JENJANG_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">URL Logo (Opsional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                                    value={formData.imageUrl || ''}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Deskripsi Singkat</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-slate-700 text-sm transition-all placeholder:text-slate-400 resize-none"
                                    rows={2}
                                    value={formData.deskripsi || ''}
                                    onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="Keterangan singkat tentang sekolah..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-black text-sm text-emerald-600 uppercase tracking-wider">Lokasi</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kota / Kabupaten</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.kota || ''}
                                    onChange={e => setFormData({ ...formData, kota: e.target.value })}
                                    placeholder="Jakarta, Bogor, dst..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Provinsi</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.provinsi || ''}
                                    onChange={e => setFormData({ ...formData, provinsi: e.target.value })}
                                    placeholder="Jawa Barat, DKI Jakarta..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Lengkap</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-medium text-slate-700 text-sm transition-all placeholder:text-slate-400 resize-none"
                                    rows={2}
                                    value={formData.alamat || ''}
                                    onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                                    placeholder="Jalan, Kelurahan, Kecamatan..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Google Maps</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                                    value={formData.gmaps_url || ''}
                                    onChange={e => setFormData({ ...formData, gmaps_url: e.target.value })}
                                    placeholder="https://maps.app.goo.gl/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono text-sm text-slate-600 transition-all placeholder:text-slate-400"
                                    value={formData.lat || ''}
                                    onChange={e => setFormData({ ...formData, lat: parseFloat(e.target.value) || undefined })}
                                    placeholder="-6.xxxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none font-mono text-sm text-slate-600 transition-all placeholder:text-slate-400"
                                    value={formData.lng || ''}
                                    onChange={e => setFormData({ ...formData, lng: parseFloat(e.target.value) || undefined })}
                                    placeholder="106.xxxxx"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Phone className="w-5 h-5 text-purple-600" />
                            <h3 className="font-black text-sm text-purple-600 uppercase tracking-wider">Kontak & Sosial Media</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Telepon</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl outline-none font-bold text-emerald-700 transition-all placeholder:text-slate-400"
                                    value={formData.telepon || ''}
                                    onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                                    placeholder="021-xxxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Handphone / WhatsApp</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl outline-none font-bold text-emerald-700 transition-all placeholder:text-slate-400"
                                    value={formData.handphone || ''}
                                    onChange={e => setFormData({ ...formData, handphone: e.target.value })}
                                    placeholder="08xxxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link WhatsApp</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl outline-none font-medium text-sm text-emerald-600 transition-all placeholder:text-slate-400"
                                    value={formData.whatsapp_link || ''}
                                    onChange={e => setFormData({ ...formData, whatsapp_link: e.target.value })}
                                    placeholder="https://wa.me/..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Website</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                                    value={formData.website || ''}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@sekolah.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Structural */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Crown className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-black text-sm text-indigo-600 uppercase tracking-wider">Struktural & Yayasan</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Yayasan</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.nama_yayasan || ''}
                                    onChange={e => setFormData({ ...formData, nama_yayasan: e.target.value })}
                                    placeholder="Yayasan..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Pembina</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.nama_pembina || ''}
                                    onChange={e => setFormData({ ...formData, nama_pembina: e.target.value })}
                                    placeholder="Ustadz..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Ketua Yayasan</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.ketua_yayasan || ''}
                                    onChange={e => setFormData({ ...formData, ketua_yayasan: e.target.value })}
                                    placeholder="Nama Ketua..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kepala Sekolah</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400"
                                    value={formData.kepala_sekolah || ''}
                                    onChange={e => setFormData({ ...formData, kepala_sekolah: e.target.value })}
                                    placeholder="Nama Kepala Sekolah..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Biaya */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Banknote className="w-5 h-5 text-amber-600" />
                            <h3 className="font-black text-sm text-amber-600 uppercase tracking-wider">Biaya Pendidikan</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Uang Pendaftaran (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-bold text-amber-700 transition-all placeholder:text-slate-400"
                                    value={formData.uang_masuk || ''}
                                    onChange={e => setFormData({ ...formData, uang_masuk: parseInt(e.target.value) || undefined })}
                                    placeholder="4000000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">SPP Bulanan (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl outline-none font-bold text-amber-700 transition-all placeholder:text-slate-400"
                                    value={formData.spp_bulanan || ''}
                                    onChange={e => setFormData({ ...formData, spp_bulanan: parseInt(e.target.value) || undefined })}
                                    placeholder="300000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target & Fasilitas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-cyan-600" />
                            <h3 className="font-black text-sm text-cyan-600 uppercase tracking-wider">Target & Fasilitas</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-3">Target Peserta</h4>
                                {[
                                    { key: 'khusus_ikhwan', label: 'Ikhwan (Laki-laki)' },
                                    { key: 'khusus_akhwat', label: 'Akhwat (Perempuan)' }
                                ].map(item => (
                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${(formData as any)[item.key] ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300 group-hover:border-cyan-400'}`}>
                                            {(formData as any)[item.key] && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={(formData as any)[item.key] || false}
                                            onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-3">Fasilitas / Program</h4>
                                {[
                                    { key: 'is_full_day', label: 'Full Day School' },
                                    { key: 'is_boarding', label: 'Boarding School' },
                                    { key: 'is_paket_abc', label: 'Kejar Paket A/B/C' }
                                ].map(item => (
                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${(formData as any)[item.key] ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                            {(formData as any)[item.key] && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={(formData as any)[item.key] || false}
                                            onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex justify-end gap-3 z-10 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}
