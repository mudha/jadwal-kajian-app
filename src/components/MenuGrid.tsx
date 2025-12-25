'use client';
import { Video, MapPin, Users, Navigation, Clock, Bell, Map, Book, Phone, User, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

const menuItems: MenuItem[] = [
    { icon: Video, label: 'Kajian Online', href: '/kajian?mode=online' },
    { icon: Navigation, label: 'Kajian Terdekat', href: '/kajian?mode=nearby' },
    { icon: Users, label: 'Kajian Muslimah', href: '/kajian?mode=akhwat' },
    { icon: MapPin, label: 'Lokasi Terdekat', href: '/kajian' },
    { icon: Clock, label: 'Jadwal Sholat', href: '/jadwal-sholat' },
    { icon: Bell, label: 'Pengingat Ibadah', href: '/agenda' },
    { icon: Map, label: 'Update Lokasi Saya', href: '#' },
    { icon: Book, label: 'Dzikir Pagi', href: '#' },
    { icon: Book, label: 'Dzikir Petang', href: '#' },
    { icon: User, label: 'Profil Asatidz', href: '#' },
    { icon: MapPin, label: 'Lokasi Kajian', href: '/kajian' },
    { icon: MapPin, label: 'Jadwal Kota', href: '/kajian' },
    { icon: Phone, label: 'Hubungi Kami', href: '#' },
];

export default function MenuGrid() {
    return (
        <div className="grid grid-cols-4 md:grid-cols-3 gap-4">
            {menuItems.map(({ icon: Icon, label, href }) => (
                <Link
                    key={label}
                    href={href}
                    className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-[10px] text-center font-medium text-slate-700 leading-tight">
                        {label}
                    </span>
                </Link>
            ))}
        </div>
    );
}
