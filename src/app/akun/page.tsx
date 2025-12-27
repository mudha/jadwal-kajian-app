'use client';
import { useState, useEffect } from 'react';
import { User, Settings, Heart, Calendar, LogOut, ChevronRight, Moon, Bell, HelpCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function AkunPage() {
    const [stats, setStats] = useState({ attended: 0, liked: 0 });

    useEffect(() => {
        // Count stats from localStorage
        const attended = Object.keys(localStorage).filter(k => k.startsWith('attended_')).length;
        const liked = Object.keys(localStorage).filter(k => k.startsWith('liked_')).length;
        setStats({ attended, liked });
    }, []);

    const MenuItem = ({ icon, label, onClick, link }: { icon: any, label: string, onClick?: () => void, link?: string }) => {
        const Content = (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                        {icon}
                    </div>
                    <span className="font-medium text-slate-700">{label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
        );

        return link ? <Link href={link}>{Content}</Link> : <div onClick={onClick}>{Content}</div>;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Profile Card */}
            <div className="bg-teal-600 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-xl mb-4">
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-slate-300" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Hamba Allah</h1>
                    <p className="text-teal-100 text-sm bg-teal-700/50 px-3 py-1 rounded-full">Penuntut Ilmu</p>
                </div>
            </div>

            {/* Stats Cards - Overlapping */}
            <div className="px-6 -mt-10 relative z-20 grid grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <div className="w-8 h-8 mx-auto bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-2">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{stats.attended}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kajian Diikuti</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
                    <div className="w-8 h-8 mx-auto bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mb-2">
                        <Heart className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{stats.liked}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Disukai</p>
                </div>
            </div>

            {/* Menu List */}
            <div className="p-6 max-w-lg mx-auto space-y-3 mt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Pengaturan & Lainnya</h3>

                <MenuItem icon={<User className="w-5 h-5" />} label="Edit Profil" />
                <MenuItem icon={<Bell className="w-5 h-5" />} label="Notifikasi" link="/notifikasi" />
                <MenuItem icon={<Moon className="w-5 h-5" />} label="Tampilan Aplikasi" />

                <div className="h-4"></div>

                <MenuItem icon={<HelpCircle className="w-5 h-5" />} label="Bantuan & FAQ" />
                <MenuItem icon={<Shield className="w-5 h-5" />} label="Kebijakan Privasi" />

                <div className="h-4"></div>

                <MenuItem
                    icon={<Settings className="w-5 h-5 text-orange-500" />}
                    label="Login Admin Area"
                    link="/admin/login"
                />
            </div>

            <div className="text-center pb-8 opacity-50">
                <p className="text-[10px] text-slate-400">Jadwal Kajian Sunnah App v1.0.0</p>
            </div>

            <BottomNav />
        </div>
    );
}
