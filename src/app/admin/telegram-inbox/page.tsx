'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatIndoDate } from '@/lib/date-utils';
import { Check, X, Edit2, Loader2, Send } from 'lucide-react';

export default function TelegramInbox() {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const router = useRouter();

    const fetchDrafts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/drafts');
            if (res.ok) {
                const data = await res.json();
                setDrafts(data);
            }
        } catch (error) {
            console.error('Error fetching drafts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, []);

    const handleApprove = async (draft: any) => {
        const payload = editingId === draft.id ? editForm : draft;

        try {
            const res = await fetch(`/api/admin/drafts/${draft.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Berhasil diposting ke database Kajian!');
                setEditingId(null);
                fetchDrafts(); // Refresh list
            } else {
                const data = await res.json();
                alert(`Gagal: ${data.error}`);
            }
        } catch (error) {
            alert('Terjadi kesalahan sistem');
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm('Yakin ingin membuang draft ini?')) return;

        try {
            const res = await fetch(`/api/admin/drafts/${id}/reject`, {
                method: 'POST'
            });

            if (res.ok) {
                fetchDrafts();
            }
        } catch (error) {
            alert('Gagal menolak draft');
        }
    };

    const startEditing = (draft: any) => {
        setEditingId(draft.id);
        setEditForm({ ...draft });
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">📥 Kotak Masuk Telegram (AI Drafts)</h1>
            <p className="text-slate-600 mb-8">Pesan dari channel Telegram yang sudah diekstrak oleh AI. Periksa dan edit sebelum mempublikasikannya.</p>

            {drafts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                    <p className="text-slate-500 font-medium">Belum ada jadwal baru dari Telegram yang mengantri.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {drafts.map((draft) => (
                        <div key={draft.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                            {/* Left Side: Raw Text */}
                            <div className="md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Send className="w-4 h-4 text-blue-500" />
                                    <h3 className="font-bold text-sm text-slate-700">Teks Asli (Source: {draft.source})</h3>
                                </div>
                                <div className="text-xs text-slate-600 whitespace-pre-wrap font-mono bg-white p-3 rounded-xl border border-slate-200 max-h-[400px] overflow-y-auto">
                                    {draft.raw_text}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Diterima: {new Date(draft.createdAt).toLocaleString('id-ID')}</p>
                            </div>

                            {/* Right Side: Parsed Data & Actions */}
                            <div className="md:w-2/3 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-teal-700 flex items-center gap-2">
                                        ✨ Ekstraksi AI
                                        {editingId === draft.id && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Mode Edit</span>}
                                    </h3>

                                    {editingId !== draft.id && (
                                        <button onClick={() => startEditing(draft)} className="text-slate-400 hover:text-teal-600 p-1">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {editingId === draft.id ? (
                                    // Edit Mode Form
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Masjid *</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.masjid || ''} onChange={e => setEditForm({ ...editForm, masjid: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal *</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.date || ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })} placeholder="Misal: Ahad, 25 Okt 2025" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Waktu</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.waktu || ''} onChange={e => setEditForm({ ...editForm, waktu: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Pemateri</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.pemateri || ''} onChange={e => setEditForm({ ...editForm, pemateri: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tema</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.tema || ''} onChange={e => setEditForm({ ...editForm, tema: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Kota</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Alamat</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">CP (Telepon)</label>
                                            <input type="text" className="w-full border rounded-lg p-2" value={editForm.cp || ''} onChange={e => setEditForm({ ...editForm, cp: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                            <input type="checkbox" id={`online-${draft.id}`} checked={editForm.isOnline == 1} onChange={e => setEditForm({ ...editForm, isOnline: e.target.checked ? 1 : 0 })} />
                                            <label htmlFor={`online-${draft.id}`} className="text-sm font-medium">Kajian Online / Streaming</label>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 text-sm">
                                        <div><span className="text-slate-400 text-xs block">Masjid</span><span className="font-bold">{draft.masjid || '-'}</span></div>
                                        <div><span className="text-slate-400 text-xs block">Tanggal</span><span className="font-bold text-teal-600">{draft.date || '-'}</span></div>
                                        <div><span className="text-slate-400 text-xs block">Waktu</span><span>{draft.waktu || '-'}</span></div>
                                        <div><span className="text-slate-400 text-xs block">Pemateri</span><span className="font-medium text-amber-700">{draft.pemateri || '-'}</span></div>
                                        <div className="md:col-span-2"><span className="text-slate-400 text-xs block">Tema</span><span className="font-medium">{draft.tema || '-'}</span></div>
                                        <div><span className="text-slate-400 text-xs block">Kota</span><span>{draft.city || '-'}</span></div>
                                        <div><span className="text-slate-400 text-xs block">CP</span><span>{draft.cp || '-'}</span></div>
                                        {draft.isOnline == 1 && (
                                            <div className="md:col-span-2 mt-1">
                                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Kajian Online</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    {editingId === draft.id ? (
                                        <>
                                            <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-colors">Batal</button>
                                            <button onClick={() => handleApprove(draft)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2">
                                                <Check className="w-4 h-4" /> Simpan & Approve
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleReject(draft.id)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-colors flex items-center gap-2">
                                                <X className="w-4 h-4" /> Tolak
                                            </button>
                                            <button onClick={() => handleApprove(draft)} className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm">
                                                <Check className="w-4 h-4" /> Approve & Posting
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
