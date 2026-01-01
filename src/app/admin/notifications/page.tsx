'use client';
import { useState, useEffect } from 'react';
import { Send, Bell, Info, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function BroadcastPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        target_audience: 'all'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Notifikasi berhasil dikirim ke semua pengguna' });
                setFormData({ title: '', message: '', type: 'info', target_audience: 'all' });
            } else {
                throw new Error('Gagal mengirim notification');
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Terjadi kesalahan saat mengirim notifikasi' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <Bell className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Broadcast Notifikasi</h1>
                    <p className="text-slate-500 text-sm">Kirim pesan informasi atau pengingat ke semua pengguna aplikasi</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                        {status && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                <p className="font-medium text-sm">{status.message}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Notifikasi</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'info', label: 'Info Umum', icon: Info, color: 'text-blue-500' },
                                        { id: 'reminder', label: 'Pengingat', icon: Clock, color: 'text-orange-500' },
                                        { id: 'recommendation', label: 'Rekomendasi', icon: MapPin, color: 'text-teal-500' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 ${formData.type === type.id
                                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            <type.icon className={`w-5 h-5 ${formData.type === type.id ? 'fill-current' : type.color}`} />
                                            <span className="text-xs font-bold">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Pesan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                    placeholder="Contoh: Update Jadwal Kajian"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Isi Pesan</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                    placeholder="Tulis pesan lengkap di sini..."
                                />
                                <p className="text-xs text-slate-400 mt-2 text-right">{formData.message.length} karakter</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Kirim Broadcast
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Preview Tampilan</h3>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                {formData.type === 'reminder' ? <Clock className="w-5 h-5 text-orange-500" /> :
                                    formData.type === 'recommendation' ? <MapPin className="w-5 h-5 text-teal-500" /> :
                                        <Info className="w-5 h-5 text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">
                                        {formData.title || 'Judul Notifikasi'}
                                    </h4>
                                    <span className="text-[10px] text-slate-400">Baru saja</span>
                                </div>
                                <p className="text-xs text-slate-600 line-clamp-3">
                                    {formData.message || 'Ini adalah contoh tampilan pesan notifikasi yang akan diterima oleh pengguna aplikasi.'}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-4 text-center">
                            Preview ini mungkin sedikit berbeda tergantung layar perangkat user.
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm mb-1">Tips Broadcast</h4>
                                <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-4">
                                    <li>Gunakan judul yang singkat dan menarik (maks 30 karakter).</li>
                                    <li>Pilih jenis ikon yang sesuai dengan konteks pesan.</li>
                                    <li>Hindari mengirim terlalu sering agar tidak dianggap spam.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
