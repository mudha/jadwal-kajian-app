'use client';
import { Calculator, Users, Clock, Navigation, Cloud, Moon, Search, Info, MessageCircle, MapPin, Bell, ChevronRight } from 'lucide-react';

export default function AkunPage() {
    const menuLainnya = [
        { icon: Clock, label: 'Jadwal Sholat', href: '#' },
        { icon: Cloud, label: 'Bacaan Dzikir Pagi', href: '#' },
        { icon: Moon, label: 'Bacaan Dzikir Petang', href: '#' },
        { icon: Search, label: 'Cari Artikel Islam', href: '#' },
        { icon: Info, label: 'Tentang Aplikasi', href: '#' },
        { icon: MessageCircle, label: 'Hubungi Kami', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="bg-teal-600 text-white px-6 py-4">
                <h1 className="text-xl font-bold">Akun</h1>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/* Menu Lainnya */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <h2 className="px-4 py-3 bg-slate-100 font-bold text-slate-700">Menu Lainnya</h2>
                    <div className="divide-y divide-slate-100">
                        {menuLainnya.map(({ icon: Icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 text-slate-600" />
                                    <span className="font-medium text-slate-700">{label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                            </a>
                        ))}
                    </div>
                </section>

                {/* Pengaturan */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <h2 className="px-4 py-3 bg-slate-100 font-bold text-slate-700">Pengaturan</h2>
                    <div className="divide-y divide-slate-100">
                        {/* Radius Terdekat */}
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center gap-3">
                                <Navigation className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Radius Terdekat</span>
                            </div>
                            <select className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                                <option>15 km</option>
                                <option>10 km</option>
                                <option>20 km</option>
                                <option>30 km</option>
                            </select>
                        </div>

                        {/* Waktu Pengingat */}
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Waktu Pengingat Kajian</span>
                            </div>
                            <select className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                                <option>-3 Jam</option>
                                <option>-1 Jam</option>
                                <option>-6 Jam</option>
                                <option>-12 Jam</option>
                            </select>
                        </div>

                        {/* Kalender Hijriyah */}
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Kalender Hijriyah</span>
                            </div>
                            <select className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                                <option>0 Hari</option>
                                <option>+1 Hari</option>
                                <option>-1 Hari</option>
                            </select>
                        </div>

                        {/* Update Lokasi */}
                        <a
                            href="#"
                            className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Update Lokasi</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </a>

                        {/* Notifikasi Adzan */}
                        <a
                            href="#"
                            className="flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-600" />
                                <span className="font-medium text-slate-700">Notifikasi Adzan</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
