'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Save, Loader2, Calendar, PlusCircle } from 'lucide-react';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import { parseIndoDate, formatYYYYMMDD, formatIndoDate } from '@/lib/date-utils';
import ImageUpload from '@/components/ImageUpload';

export interface KajianDetail {
    id: number;
    masjid: string;
    pemateri: string;
    pemateri2?: string;
    pemateri3?: string;
    tema: string;
    waktu: string;
    waktu_mulai?: string;
    waktu_selesai?: string;
    date: string;
    city: string;
    address: string;
    imageUrl?: string;
    gmapsUrl?: string;
    linkInfo?: string;
    attendanceCount?: number;
    khususAkhwat?: boolean;
    isOnline?: boolean;
    isKidsFriendly?: boolean;
    cp?: string;
    cp2?: string;
    cp3?: string;
    lat?: number;
    lng?: number;
    catatan?: string;
    is_canceled?: boolean;
    cancellation_reason?: string;
}

interface EditKajianModalProps {
    isOpen: boolean;
    onClose: () => void;
    kajian: KajianDetail;
    onSave: (updatedKajian: KajianDetail) => Promise<void>;
    onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function EditKajianModal({ isOpen, onClose, kajian, onSave, onToast }: EditKajianModalProps) {
    const [formData, setFormData] = useState<KajianDetail>({ ...kajian });
    const [isSaving, setIsSaving] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        // Parse existing waktu to split start and end
        const splitWaktu = (waktu: string) => {
            if (!waktu) return { start: '', end: 'Selesai' };
            // Try splitting by ' - ' first
            const parts = waktu.split(' - ');
            if (parts.length >= 2) {
                return { start: parts[0], end: parts.slice(1).join(' - ') };
            }
            return { start: waktu, end: 'Selesai' };
        };

        const { start, end } = splitWaktu(kajian.waktu || '');

        setFormData({
            ...kajian,
            waktu_mulai: kajian.waktu_mulai || start,
            waktu_selesai: kajian.waktu_selesai || end
        });
    }, [kajian]);

    // Global paste handler for images
    useEffect(() => {
        if (!isOpen) return;

        const handleGlobalPaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (!file) continue;

                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        // Try Cloudinary first
                        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                        let url = '';
                        if (cloudName && uploadPreset) {
                            formData.append('upload_preset', uploadPreset);
                            formData.append('folder', 'jadwal-kajian');

                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.secure_url) {
                                url = data.secure_url;
                            }
                        } else {
                            // Fallback to local API
                            const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.url) {
                                url = data.url;
                            }
                        }

                        if (url) {
                            handleChange('imageUrl', url);
                        }
                    } catch (error) {
                        console.error('Global paste upload error:', error);
                    }

                    break;
                }
            }
        };

        document.addEventListener('paste', handleGlobalPaste);
        return () => document.removeEventListener('paste', handleGlobalPaste);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (field: keyof KajianDetail, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Recombine waktu
            const start = formData.waktu_mulai || '';
            const end = formData.waktu_selesai || 'Selesai';
            const combinedWaktu = `${start} - ${end}`;

            const payload = {
                ...formData,
                waktu: combinedWaktu,
                is_canceled: formData.is_canceled,
                cancellation_reason: formData.cancellation_reason
            };

            await onSave(payload);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExtractCoords = async (url: string) => {
        if (!url) return;
        setIsExtracting(true);
        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    lat: data.lat,
                    lng: data.lng,
                    gmapsUrl: data.expandedUrl || url
                }));
                // alert(`Koordinat ditemukan: ${data.lat}, ${data.lng}`);
                if (onToast) onToast(`Koordinat ditemukan: ${data.lat}, ${data.lng}`, 'success');
            } else {
                // alert('Gagal mengekstrak koordinat. Pastikan link valid.');
                if (onToast) onToast('Gagal mengekstrak koordinat. Pastikan link valid.', 'error');
            }
        } catch (error) {
            console.error(error);
            // alert('Terjadi kesalahan saat mengekstrak koordinat.');
            if (onToast) onToast('Terjadi kesalahan saat mengekstrak koordinat.', 'error');
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-3xl h-[85vh] md:h-auto md:max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200 border border-slate-100 flex flex-col overflow-hidden">

                {/* Header - Fixed/Static */}
                <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 shrink-0">
                    <div>
                        <h2 className="font-black text-xl text-slate-900 tracking-tight">Edit Jadwal</h2>
                        <p className="text-xs text-slate-500 font-medium">Perbarui informasi kajian</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">

                    {/* Image Upload */}
                    <div>
                        <ImageUpload
                            value={formData.imageUrl}
                            onChange={(val) => handleChange('imageUrl', val)}
                            label="Poster Kajian"
                        />
                    </div>

                    {/* Masjid & Lokasi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Masjid / Lokasi</label>
                            <AutosuggestInput
                                type="masjid"
                                value={formData.masjid}
                                onChange={(val) => handleChange('masjid', val)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                placeholder="Nama Masjid..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Kota / Wilayah</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                value={formData.city}
                                onChange={e => handleChange('city', e.target.value)}
                                placeholder="Nama Kota..."
                            />
                        </div>
                    </div>

                    {/* Pemateri Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Pemateri / Ustadz</label>
                            {!formData.pemateri2 && (
                                <button
                                    type="button"
                                    onClick={() => handleChange('pemateri2', '')}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <PlusCircle className="w-3 h-3" /> Tambah Pemateri
                                </button>
                            )}
                        </div>
                        <AutosuggestInput
                            type="pemateri"
                            value={formData.pemateri}
                            onChange={(val) => handleChange('pemateri', val)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            placeholder="Nama Ustadz..."
                        />

                        {/* Pemateri 2 */}
                        {formData.pemateri2 !== undefined && (
                            <div className="relative">
                                <AutosuggestInput
                                    type="pemateri"
                                    value={formData.pemateri2 || ''}
                                    onChange={(val) => handleChange('pemateri2', val)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    placeholder="Pemateri kedua..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const { pemateri2, ...rest } = formData;
                                        setFormData(rest as KajianDetail);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Add Pemateri 3 button */}
                        {formData.pemateri2 && !formData.pemateri3 && (
                            <button
                                type="button"
                                onClick={() => handleChange('pemateri3', '')}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <PlusCircle className="w-3 h-3" /> Tambah Ketiga
                            </button>
                        )}

                        {/* Pemateri 3 */}
                        {formData.pemateri3 !== undefined && (
                            <div className="relative">
                                <AutosuggestInput
                                    type="pemateri"
                                    value={formData.pemateri3 || ''}
                                    onChange={(val) => handleChange('pemateri3', val)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                    placeholder="Pemateri ketiga..."
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const { pemateri3, ...rest } = formData;
                                        setFormData(rest as KajianDetail);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tema */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tema</label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400 resize-none"
                            rows={2}
                            value={formData.tema}
                            onChange={e => handleChange('tema', e.target.value)}
                            placeholder="Tema pembahasan..."
                        />
                    </div>

                    {/* Catatan dari Panitia */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Catatan dari Panitia</label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-slate-900 transition-all placeholder:text-slate-400 resize-y min-h-[80px]"
                            rows={3}
                            value={formData.catatan || ''}
                            onChange={e => handleChange('catatan', e.target.value)}
                            placeholder="Misal: Membawa makanan untuk berbuka, Khusus ikhwan, dll"
                        />
                    </div>

                    {/* Tanggal */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Tanggal</label>
                        <div className="relative group">
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all cursor-pointer"
                                value={(() => {
                                    const d = parseIndoDate(formData.date);
                                    return d ? formatYYYYMMDD(d) : '';
                                })()}
                                onChange={(e) => {
                                    const val = e.target.valueAsDate;
                                    if (val) {
                                        handleChange('date', formatIndoDate(val));
                                    }
                                }}
                            />
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500" />
                        </div>
                    </div>

                    {/* Waktu Mulai & Selesai */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Waktu Mulai</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                value={formData.waktu_mulai || ''}
                                onChange={e => handleChange('waktu_mulai', e.target.value)}
                                placeholder="Ba'da Maghrib / 19.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Waktu Selesai</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                                value={formData.waktu_selesai || 'Selesai'}
                                onChange={e => handleChange('waktu_selesai', e.target.value)}
                                placeholder="Selesai"
                            />
                        </div>
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Lengkap</label>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-slate-700 text-sm transition-all placeholder:text-slate-400 resize-none"
                            rows={2}
                            value={formData.address}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="Jalan, Kelurahan, Kecamatan..."
                        />
                    </div>

                    {/* Contact Person & Link Google Maps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Contact Person (CP)</label>
                                {formData.cp2 === undefined && (
                                    <button
                                        type="button"
                                        onClick={() => handleChange('cp2', '')}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                        <PlusCircle className="w-3 h-3" /> Tambah
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-emerald-700 transition-all placeholder:text-slate-400"
                                value={formData.cp || ''}
                                onChange={e => handleChange('cp', e.target.value)}
                                placeholder="08..."
                            />

                            {formData.cp2 !== undefined && (
                                <div className="relative animate-in slide-in-from-top-2 duration-200">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-emerald-700 transition-all placeholder:text-slate-400"
                                        value={formData.cp2 || ''}
                                        onChange={e => handleChange('cp2', e.target.value)}
                                        placeholder="CP 2..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const { cp2, ...rest } = formData;
                                            setFormData(rest as KajianDetail);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {formData.cp2 !== undefined && formData.cp3 === undefined && (
                                <button
                                    type="button"
                                    onClick={() => handleChange('cp3', '')}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto"
                                >
                                    <PlusCircle className="w-3 h-3" /> Tambah CP 3
                                </button>
                            )}

                            {formData.cp3 !== undefined && (
                                <div className="relative animate-in slide-in-from-top-2 duration-200">
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-bold text-emerald-700 transition-all placeholder:text-slate-400"
                                        value={formData.cp3 || ''}
                                        onChange={e => handleChange('cp3', e.target.value)}
                                        placeholder="CP 3..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const { cp3, ...rest } = formData;
                                            setFormData(rest as KajianDetail);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Google Maps</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                                    value={formData.gmapsUrl || ''}
                                    onChange={e => handleChange('gmapsUrl', e.target.value)}
                                    placeholder="https://maps.app.goo.gl/..."
                                />
                                <button
                                    type="button"
                                    onClick={() => handleExtractCoords(formData.gmapsUrl || '')}
                                    disabled={!formData.gmapsUrl || isExtracting}
                                    className="px-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-blue-600 transition-all disabled:opacity-50 border border-slate-200"
                                    title="Ekstrak Lat/Lng"
                                >
                                    {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Latitude & Longitude */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 px-1">Latitude</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="-7.xxxxx"
                                value={formData.lat || ''}
                                onChange={e => handleChange('lat', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 px-1">Longitude</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="112.xxxxx"
                                value={formData.lng || ''}
                                onChange={e => handleChange('lng', parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Link Info */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Link Pendaftaran / Streaming / Info</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none font-medium text-sm text-blue-600 transition-all placeholder:text-slate-400"
                            value={formData.linkInfo || ''}
                            onChange={e => handleChange('linkInfo', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                        <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData.khususAkhwat ? 'bg-pink-50 border-pink-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.khususAkhwat || false}
                                onChange={e => handleChange('khususAkhwat', e.target.checked)}
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.khususAkhwat ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300 bg-white'}`}>
                                {formData.khususAkhwat && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                            </div>
                            <span className={`font-bold text-sm ${formData.khususAkhwat ? 'text-pink-700' : 'text-slate-600'}`}>Khusus Akhwat</span>
                        </label>

                        <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData.isOnline ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.isOnline || false}
                                onChange={e => handleChange('isOnline', e.target.checked)}
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isOnline ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                {formData.isOnline && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                            </div>
                            <span className={`font-bold text-sm ${formData.isOnline ? 'text-blue-700' : 'text-slate-600'}`}>Online / Streaming</span>
                        </label>

                        <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData.isKidsFriendly ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={formData.isKidsFriendly || false}
                                onChange={e => handleChange('isKidsFriendly', e.target.checked)}
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isKidsFriendly ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                {formData.isKidsFriendly && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                            </div>
                            <span className={`font-bold text-sm ${formData.isKidsFriendly ? 'text-orange-700' : 'text-slate-600'}`}>🎈 Kajian Anak</span>
                        </label>
                    </div>

                    {/* Status Admin Section */}
                    <div className="pt-6 border-t-2 border-slate-200">
                        <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-slate-700 rounded-full"></span>
                            STATUS ADMIN
                        </h3>

                        <div className="space-y-4">
                            {/* Kajian Dibatalkan/Diliburkan */}
                            <label className={`block p-5 border-2 rounded-2xl cursor-pointer transition-all ${formData.is_canceled ? 'bg-red-50 border-red-300 shadow-md shadow-red-100' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={Boolean(formData.is_canceled)}
                                        onChange={e => handleChange('is_canceled', e.target.checked)}
                                    />
                                    <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_canceled ? 'border-red-500 bg-red-500' : 'border-slate-300 bg-white'}`}>
                                        {!!formData.is_canceled && (
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-black text-base mb-1 ${formData.is_canceled ? 'text-red-700' : 'text-slate-700'}`}>
                                            Kajian Dibatalkan / Diliburkan
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            Centang opsi ini jika kajian tidak jadi dilaksanakan agar jamaah tidak datang dengan sia-sia
                                        </div>
                                    </div>
                                </div>

                                {/* Alasan Pembatalan */}
                                {!!formData.is_canceled && (
                                    <div className="mt-4 pl-10 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <label className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 block">
                                            Alasan Pembatalan
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-white border-2 border-red-200 focus:border-red-500 rounded-xl outline-none text-sm font-bold text-red-800 placeholder:text-red-300 transition-all"
                                            value={formData.cancellation_reason || ''}
                                            onChange={e => handleChange('cancellation_reason', e.target.value)}
                                            placeholder="Misal: Ustadz berhalangan hadir"
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>


                    <div className="h-6" />
                </div>

                {/* Footer - Fixed/Static */}
                <div className="bg-white border-t border-slate-100 p-6 flex justify-end gap-3 z-10 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
