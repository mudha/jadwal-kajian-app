'use client';

import { ArrowLeft, Mail, Phone, MapPin, Send, Github, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function HubungiKamiPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement form submission
        alert('Terima kasih! Pesan Anda akan segera kami proses.');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-br from-slate-600 to-slate-700 text-white px-6 py-8 sticky top-0 z-40 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="font-bold text-2xl md:text-3xl leading-tight">Hubungi Kami</h1>
                            <p className="text-slate-100 text-sm font-medium mt-1">Tentang PortalKajian.online</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* About Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-bold text-xl text-slate-900 mb-4">Tentang Platform</h2>
                    <div className="space-y-3 text-slate-600 leading-relaxed">
                        <p>
                            <strong className="text-slate-900">PortalKajian.online</strong> adalah platform digital yang menyediakan informasi jadwal kajian sunnah di berbagai masjid dan tempat kajian.
                        </p>
                        <p>
                            Tujuan kami adalah memudahkan kaum muslimin untuk menemukan kajian ilmiah yang sesuai dengan manhaj Ahlus Sunnah Wal Jama'ah.
                        </p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Email</h3>
                                <p className="text-sm text-slate-500">Hubungi via email</p>
                            </div>
                        </div>
                        <a href="mailto:info@portalkajian.online" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            info@portalkajian.online
                        </a>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">WhatsApp</h3>
                                <p className="text-sm text-slate-500">Chat dengan admin</p>
                            </div>
                        </div>
                        <a href="https://wa.me/6281234567890" target="_blank" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            +62 812-3456-7890
                        </a>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h2 className="font-bold text-xl text-slate-900 mb-4">Kirim Pesan</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nama</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Pesan</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            Kirim Pesan
                        </button>
                    </form>
                </div>

                {/* Footer Note */}
                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Platform ini dibuat dengan tujuan mempermudah dakwah sunnah. Barakallahu fikum.
                    </p>
                </div>
            </div>
        </div>
    );
}
