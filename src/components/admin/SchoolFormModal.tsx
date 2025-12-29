'use client';

import { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin, Phone, Banknote, Users, Share2, Crown } from 'lucide-react';

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
    email?: string; // New

    // Socials
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    telegram?: string;

    // Struktural
    pembina?: string; // keeping legacy naming support if needed, or mapping to nama_pembina
    nama_pembina?: string;
    ketua_yayasan?: string;
    kepala_sekolah?: string;
    nama_yayasan?: string;
}

interface SchoolFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Sekolah>) => Promise<void>;
    initialData?: Partial<Sekolah> | null;
}

const JENJANG_OPTIONS = ['DC', 'PAUD', 'TK', 'MI', 'SD', 'MTs', 'SMP', 'MA', 'SMA', 'SMK', 'PT', 'Pesantren', 'Kursus', 'Lainnya'];

export default function SchoolFormModal({ isOpen, onClose, onSubmit, initialData }: SchoolFormModalProps) {
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

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // Ensure booleans are handled
                khusus_akhwat: !!initialData.khusus_akhwat,
                khusus_ikhwan: !!initialData.khusus_ikhwan,
                is_full_day: !!initialData.is_full_day,
                is_boarding: !!initialData.is_boarding,
                is_paket_abc: !!initialData.is_paket_abc,
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-50 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {initialData?.id ? 'Edit Data Sekolah' : 'Input Sekolah Baru'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Formulir Data Sekolah Sunnah</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 scroll-smooth">
                    <form id="school-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* SECTION 1: STRUKTURAL INFRA */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Crown className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Struktural & Yayasan</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">Nama Yayasan</label>
                                    <input type="text" className="form-input"
                                        value={formData.nama_yayasan || ''}
                                        onChange={e => setFormData({ ...formData, nama_yayasan: e.target.value })} placeholder="Yayasan..." />
                                </div>
                                <div>
                                    <label className="label-text">Pembina</label>
                                    <input type="text" className="form-input"
                                        value={formData.nama_pembina || ''}
                                        onChange={e => setFormData({ ...formData, nama_pembina: e.target.value })} placeholder="Ustadz..." />
                                </div>
                                <div>
                                    <label className="label-text">Ketua Yayasan</label>
                                    <input type="text" className="form-input"
                                        value={formData.ketua_yayasan || ''}
                                        onChange={e => setFormData({ ...formData, ketua_yayasan: e.target.value })} placeholder="Nama Ketua..." />
                                </div>
                                <div>
                                    <label className="label-text">Kepala Sekolah</label>
                                    <input type="text" className="form-input"
                                        value={formData.kepala_sekolah || ''}
                                        onChange={e => setFormData({ ...formData, kepala_sekolah: e.target.value })} placeholder="Kepala Sekolah..." />
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: BASIC INFO */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Informasi Umum</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8">
                                    <label className="label-text">Nama Sekolah <span className="text-red-500">*</span></label>
                                    <input type="text" required className="form-input text-lg font-bold"
                                        value={formData.nama || ''}
                                        onChange={e => setFormData({ ...formData, nama: e.target.value })} placeholder="Contoh: SD Islam Imam Nawawi" />
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">*Jangan sertakan "Akhwat/Ikhwan" di nama.</p>
                                </div>
                                <div className="md:col-span-4">
                                    <label className="label-text">Jenjang</label>
                                    <select className="form-input" value={formData.jenjang || 'SD'} onChange={e => setFormData({ ...formData, jenjang: e.target.value })}>
                                        {JENJANG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-12">
                                    <label className="label-text">Deskripsi Singkat</label>
                                    <textarea rows={2} className="form-input"
                                        value={formData.deskripsi || ''}
                                        onChange={e => setFormData({ ...formData, deskripsi: e.target.value })} placeholder="Keterangan singkat tentang sekolah..." />
                                </div>
                                <div className="md:col-span-12">
                                    <label className="label-text">URL Logo</label>
                                    <input type="url" className="form-input font-mono text-sm"
                                        value={formData.imageUrl || ''}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                        </section>

                        {/* SECTION 3: LOKASI */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Lokasi</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">Kota / Kabupaten <span className="text-red-500">*</span></label>
                                    <input type="text" required className="form-input" value={formData.kota || ''} onChange={e => setFormData({ ...formData, kota: e.target.value })} placeholder="Bogor" />
                                </div>
                                <div>
                                    <label className="label-text">Provinsi</label>
                                    <input type="text" className="form-input" value={formData.provinsi || ''} onChange={e => setFormData({ ...formData, provinsi: e.target.value })} placeholder="Jawa Barat" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label-text">Alamat Lengkap</label>
                                    <textarea rows={2} className="form-input resize-none" value={formData.alamat || ''} onChange={e => setFormData({ ...formData, alamat: e.target.value })} placeholder="Jl. Raya..." />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label-text">Google Maps URL</label>
                                    <input type="url" className="form-input text-blue-600 underline-offset-2" value={formData.gmaps_url || ''} onChange={e => setFormData({ ...formData, gmaps_url: e.target.value })} placeholder="https://goo.gl/maps/..." />
                                </div>
                            </div>
                        </section>

                        {/* SECTION 4: KONTAK */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Kontak & Admin</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label-text">No. Telepon Sekolah (Kantor)</label>
                                    <input type="text" className="form-input" value={formData.telepon || ''} onChange={e => setFormData({ ...formData, telepon: e.target.value })} placeholder="021-..." />
                                </div>
                                <div>
                                    <label className="label-text">No. Telepon Alternatif</label>
                                    <input type="text" className="form-input" value={formData.telpon_2 || ''} onChange={e => setFormData({ ...formData, telpon_2: e.target.value })} placeholder="08..." />
                                </div>
                                <div>
                                    <label className="label-text">Nama Contact Person</label>
                                    <input type="text" className="form-input" value={formData.contact_person_nama || ''} onChange={e => setFormData({ ...formData, contact_person_nama: e.target.value })} placeholder="Bapak/Ibu..." />
                                </div>
                                <div>
                                    <label className="label-text">HP Contact Person</label>
                                    <input type="text" className="form-input" value={formData.contact_person_hp || ''} onChange={e => setFormData({ ...formData, contact_person_hp: e.target.value })} placeholder="08..." />
                                </div>
                                <div>
                                    <label className="label-text">Email</label>
                                    <input type="email" className="form-input" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@sekolah.com" />
                                </div>
                                <div>
                                    <label className="label-text">Website</label>
                                    <input type="text" className="form-input" value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="www.sekolah.com" />
                                </div>
                            </div>
                        </section>

                        {/* SECTION 5: SOSMED & BIAYA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                                        <Share2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Media Sosial</h3>
                                </div>
                                <div className="space-y-3">
                                    {['facebook', 'instagram', 'twitter', 'youtube', 'telegram'].map(soc => (
                                        <div key={soc} className="flex items-center gap-3">
                                            <div className="w-24 shrink-0 label-text mb-0 capitalize">{soc}</div>
                                            <input type="text" className="form-input py-2 text-sm"
                                                value={(formData as any)[soc] || ''}
                                                onChange={e => setFormData({ ...formData, [soc]: e.target.value })}
                                                placeholder={`URL/Username ${soc}`} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg">Estimasi Biaya</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="label-text">Uang Masuk (Rp)</label>
                                        <input type="number" className="form-input" value={formData.uang_masuk || ''} onChange={e => setFormData({ ...formData, uang_masuk: parseInt(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="label-text">SPP Bulanan (Rp)</label>
                                        <input type="number" className="form-input" value={formData.spp_bulanan || ''} onChange={e => setFormData({ ...formData, spp_bulanan: parseInt(e.target.value) || 0 })} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* SECTION 6: TARGET & FASILITAS */}
                        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg">Target & Fasilitas</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">Target Peserta</h4>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'khusus_ikhwan', label: 'Ikhwan (Laki-laki)' },
                                            { key: 'khusus_akhwat', label: 'Akhwat (Perempuan)' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any)[item.key] ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-400'}`}>
                                                    {(formData as any)[item.key] && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={(formData as any)[item.key] || false} onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })} />
                                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-sm text-slate-700 mb-3">Fasilitas / Program</h4>
                                    <div className="flex flex-col gap-3">
                                        {[
                                            { key: 'is_full_day', label: 'Full Day School' },
                                            { key: 'is_boarding', label: 'Boarding School' },
                                            { key: 'is_paket_abc', label: 'Kejar Paket A/B/C' }
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any)[item.key] ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                                                    {(formData as any)[item.key] && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={(formData as any)[item.key] || false} onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })} />
                                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-5 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} type="button" className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50" disabled={loading}>
                        Batal
                    </button>
                    <button form="school-form" type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2">
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        Simpan Data
                    </button>
                </div>

                <style jsx>{`
                .label-text {
                    @apply block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest;
                }
                .form-input {
                    @apply w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-sm;
                }
            `}</style>
            </div>
        </div>
    );
}
