'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import RecurringPatternSelector from '@/components/admin/RecurringPatternSelector';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import ImageUpload from '@/components/ImageUpload';
import { RecurringPattern, getPatternDescription, generateRecurringDates } from '@/lib/recurring-generator';
import { formatIndoDate } from '@/lib/date-utils';
import { Calendar, Clock, MapPin, PlusCircle, Trash2, Edit, RefreshCw, CheckCircle, Power, ArrowLeft } from 'lucide-react';
import { indonesianCities } from '@/data/cities';
import Link from 'next/link';

interface RecurringKajian {
    id: number;
    masjid: string;
    city: string;
    pemateri: string;
    tema?: string;
    pattern: RecurringPattern;
    day_of_week: number;
    week_of_month?: number;
    waktu_mulai: string;
    waktu_selesai?: string;
    isActive: number;
    [key: string]: any;
}

export default function RecurringKajianPage() {
    const router = useRouter();
    const { role, isLoading } = useAdmin();
    const [recurringList, setRecurringList] = useState<RecurringKajian[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        masjid: '',
        address: '',
        city: 'Jakarta',
        pemateri: '',
        pemateri2: '',
        pemateri3: '',
        tema: '',
        pattern: 'weekly' as RecurringPattern,
        day_of_week: 5, // Friday
        week_of_month: 1,
        waktu_mulai: '',
        waktu_selesai: 'Selesai',
        cp: '',
        cp2: '',
        cp3: '',
        gmapsUrl: '',
        lat: null as number | null,
        lng: null as number | null,
        imageUrl: '',
        catatan: '',
        linkInfo: '',
        khususAkhwat: false,
        isOnline: false,
        isKidsFriendly: false
    });

    // Preview upcoming dates
    const [previewDates, setPreviewDates] = useState<Date[]>([]);

    useEffect(() => {
        if (!isLoading && !role) {
            router.push('/login');
        } else if (role) {
            fetchRecurringKajian();
        }
    }, [role, isLoading]);

    useEffect(() => {
        // Update preview when pattern changes
        const dates = generateRecurringDates(
            {
                pattern: formData.pattern,
                dayOfWeek: formData.day_of_week,
                weekOfMonth: formData.week_of_month
            },
            new Date(),
            new Date(new Date().setMonth(new Date().getMonth() + 2))
        );
        setPreviewDates(dates.slice(0, 10)); // Show first 10
    }, [formData.pattern, formData.day_of_week, formData.week_of_month]);

    const fetchRecurringKajian = async () => {
        try {
            const res = await fetch('/api/recurring-kajian');
            const data = await res.json();
            setRecurringList(data);
        } catch (error) {
            console.error('Failed to fetch recurring kajian:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingId
                ? `/api/recurring-kajian/${editingId}`
                : '/api/recurring-kajian';

            const method = editingId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ ${editingId ? 'Updated' : 'Created'} successfully!`);
                resetForm();
                fetchRecurringKajian();
                setIsFormOpen(false);
            } else {
                setMessage(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            setMessage('❌ Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (kajian: RecurringKajian) => {
        setEditingId(kajian.id);
        setFormData({
            masjid: kajian.masjid,
            address: kajian.address || '',
            city: kajian.city,
            pemateri: kajian.pemateri,
            pemateri2: kajian.pemateri2 || '',
            pemateri3: kajian.pemateri3 || '',
            tema: kajian.tema || '',
            pattern: kajian.pattern,
            day_of_week: kajian.day_of_week,
            week_of_month: kajian.week_of_month,
            waktu_mulai: kajian.waktu_mulai,
            waktu_selesai: kajian.waktu_selesai || 'Selesai',
            cp: kajian.cp || '',
            cp2: kajian.cp2 || '',
            cp3: kajian.cp3 || '',
            gmapsUrl: kajian.gmapsUrl || '',
            lat: kajian.lat,
            lng: kajian.lng,
            imageUrl: kajian.imageUrl || '',
            catatan: kajian.catatan || '',
            linkInfo: kajian.linkInfo || '',
            khususAkhwat: !!kajian.khususAkhwat,
            isOnline: !!kajian.isOnline,
            isKidsFriendly: !!kajian.isKidsFriendly
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menonaktifkan kajian rutin ini?')) return;

        try {
            const res = await fetch(`/api/recurring-kajian/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('✅ Deactivated successfully');
                fetchRecurringKajian();
            }
        } catch (error) {
            setMessage('❌ Failed to delete');
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/recurring-kajian/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ months: 3 })
            });
            const data = await res.json();
            setMessage(`✅ Generated ${data.generated} kajian, skipped ${data.skipped}`);
        } catch (error) {
            setMessage('❌ Failed to generate');
        } finally {
            setIsGenerating(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            masjid: '',
            address: '',
            city: 'Jakarta',
            pemateri: '',
            pemateri2: '',
            pemateri3: '',
            tema: '',
            pattern: 'weekly',
            day_of_week: 5,
            week_of_month: 1,
            waktu_mulai: '',
            waktu_selesai: 'Selesai',
            cp: '',
            cp2: '',
            cp3: '',
            gmapsUrl: '',
            lat: null,
            lng: null,
            imageUrl: '',
            catatan: '',
            linkInfo: '',
            khususAkhwat: false,
            isOnline: false,
            isKidsFriendly: false
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin/manage" className="p-2 hover:bg-white rounded-lg transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <h1 className="text-3xl font-black text-slate-900">Kajian Rutin</h1>
                        </div>
                        <p className="text-slate-600">Kelola kajian yang otomatis muncul sesuai jadwal</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate
                        </button>
                        <button
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 font-bold"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium">
                        {message}
                    </div>
                )}

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {editingId ? 'Edit' : 'Tambah'} Kajian Rutin
                                </h2>
                                <button
                                    onClick={() => { setIsFormOpen(false); resetForm(); }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Recurring Pattern */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h3 className="text-sm font-black text-blue-900 mb-3 uppercase tracking-wider">Pola Rekurensi</h3>
                                    <RecurringPatternSelector
                                        pattern={formData.pattern}
                                        dayOfWeek={formData.day_of_week}
                                        weekOfMonth={formData.week_of_month}
                                        onChange={(pattern, dayOfWeek, weekOfMonth) => {
                                            setFormData({ ...formData, pattern, day_of_week: dayOfWeek, week_of_month: weekOfMonth });
                                        }}
                                    />
                                    <div className="mt-4 p-3 bg-white rounded-lg">
                                        <p className="text-xs font-bold text-slate-600 mb-2">Preview 10 Jadwal Berikutnya:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {previewDates.map((date, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    {formatIndoDate(date)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Masjid & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Nama Masjid</label>
                                        <AutosuggestInput
                                            type="masjid"
                                            value={formData.masjid}
                                            onChange={(val) => setFormData({ ...formData, masjid: val })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                            placeholder="Masjid..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Kota</label>
                                        <select
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                        >
                                            {indonesianCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Pemateri & Tema */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Pemateri</label>
                                        <AutosuggestInput
                                            type="pemateri"
                                            value={formData.pemateri}
                                            onChange={(val) => setFormData({ ...formData, pemateri: val })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                            placeholder="Ustadz..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Tema/Judul</label>
                                        <input
                                            type="text"
                                            value={formData.tema}
                                            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                            placeholder="Tema kajian..."
                                        />
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Waktu Mulai</label>
                                        <input
                                            type="text"
                                            value={formData.waktu_mulai}
                                            onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                            placeholder="Ba'da Maghrib"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 mb-2 block">Waktu Selesai</label>
                                        <input
                                            type="text"
                                            value={formData.waktu_selesai}
                                            onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                                            placeholder="Selesai"
                                        />
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">CP</label>
                                    <input
                                        type="text"
                                        value={formData.cp}
                                        onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono"
                                        placeholder="08..."
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="text-xs font-bold text-slate-600 mb-2 block">Poster Default</label>
                                    <ImageUpload
                                        value={formData.imageUrl}
                                        onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                        label=""
                                    />
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setIsFormOpen(false); resetForm(); }}
                                        className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-black text-slate-900">Kajian Rutin Aktif</h2>
                        <p className="text-sm text-slate-600">{recurringList.filter(k => k.isActive).length} template</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recurringList.filter(k => k.isActive).map(kajian => (
                            <div key={kajian.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{kajian.masjid}</h3>
                                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                                                {getPatternDescription({ pattern: kajian.pattern, dayOfWeek: kajian.day_of_week, weekOfMonth: kajian.week_of_month })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-1">
                                            <span className="font-bold">Pemateri:</span> {kajian.pemateri}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            <span className="font-bold">Kota:</span> {kajian.city} | <span className="font-bold">Waktu:</span> {kajian.waktu_mulai}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(kajian)}
                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(kajian.id)}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                        >
                                            <Power className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recurringList.filter(k => k.isActive).length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">Belum ada kajian rutin</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
