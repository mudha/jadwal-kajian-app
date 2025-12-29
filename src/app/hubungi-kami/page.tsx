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
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Phone className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">WhatsApp Admin</h3>
                            <p className="text-sm text-slate-500 font-medium">Armudha Abu Naurah</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-slate-600 leading-relaxed text-sm">
                            Jika Anda memiliki pertanyaan, saran, atau ingin menambahkan informasi kajian, silakan hubungi kami melalui WhatsApp.
                        </p>
                        <a
                            href="https://wa.me/6281392135904"
                            target="_blank"
                            className="block w-full py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-center rounded-xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            Chat via WhatsApp
                        </a>
                    </div>
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
