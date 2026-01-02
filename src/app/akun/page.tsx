'use client';
import { useState, useEffect } from 'react';
import { User, Settings, Heart, Calendar, LogOut, ChevronRight, Moon, Bell, HelpCircle, Shield, X, Save, Loader2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { createPortal } from 'react-dom';

/**
 * Edit Profile Modal Component
 */
function EditProfileModal({ isOpen, onClose, initialData, onSave }: {
    isOpen: boolean;
    onClose: () => void;
    initialData: { name: string; status: string };
    onSave: (data: { name: string; status: string }) => void;
}) {
    const [name, setName] = useState(initialData.name);
    const [status, setStatus] = useState(initialData.status);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(initialData.name);
            setStatus(initialData.status);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay for "real" feel
        setTimeout(() => {
            onSave({ name, status });
            setIsSaving(false);
            onClose();
        }, 500);
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Edit Profil</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-bold text-slate-800 transition-all"
                            placeholder="Masukkan nama anda..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status / Bio</label>
                        <input
                            type="text"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none font-bold text-slate-800 transition-all"
                            placeholder="Contoh: Penuntut Ilmu"
                        />
                    </div>
                </div>
                <div className="p-4 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Batal</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                        className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default function AkunPage() {
    const [stats, setStats] = useState({ attended: 0, liked: 0 });
    const [profile, setProfile] = useState({ name: 'Hamba Allah', status: 'Penuntut Ilmu' });
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Load Profile
        const savedName = localStorage.getItem('user_name');
        const savedStatus = localStorage.getItem('user_status');
        if (savedName) setProfile(prev => ({ ...prev, name: savedName }));
        if (savedStatus) setProfile(prev => ({ ...prev, status: savedStatus }));

        // Count stats from localStorage
        const attended = Object.keys(localStorage).filter(k => k.startsWith('attended_')).length;
        const liked = Object.keys(localStorage).filter(k => k.startsWith('liked_')).length;
        setStats({ attended, liked });

        // Check Admin Login (rudimentary check based on having a session or cookie logic, 
        // but for now we'll check if there's any 'admin_session' or similar in localStorage/cookie if we used that. 
        // Since we don't have a secure public auth yet, let's assume 'admin_logged_in' might be set by the login page, 
        // or we just check if the user can access admin routes. 
        // For this demo, let's just stick to the Login button unless we know for sure.)
        // Actually, let's check for 'admin_auth' cookie existence if possible, or just leave it as Login link usually.
        // Let's check a simple localStorage flag if your login logic sets one.
        // Looking at login route: it sets a cookie 'admin_session'. 
        // Client-side cookie reading is easiest with a small regex or library.
        if (document.cookie.includes('admin_session')) {
            setIsAdmin(true);
        }

    }, []);

    const handleUpdateProfile = (data: { name: string; status: string }) => {
        setProfile(data);
        localStorage.setItem('user_name', data.name);
        localStorage.setItem('user_status', data.status);
    };

    const MenuItem = ({ icon, label, onClick, link, className = "" }: { icon: any, label: string, onClick?: () => void, link?: string, className?: string }) => {
        const Content = (
            <div className={`flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer group ${className}`}>
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
            <div className="bg-teal-600 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] relative overflow-hidden transition-all duration-500">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-xl mb-4 relative group cursor-pointer" onClick={() => setIsEditOpen(true)}>
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                            <User className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-teal-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                            <Settings className="w-3 h-3" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
                    <p className="text-teal-100 text-sm bg-teal-700/50 px-3 py-1 rounded-full">{profile.status}</p>
                </div>
            </div>

            {/* Stats Cards - Overlapping */}
            <div className="px-6 -mt-10 relative z-20 grid grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center transform hover:scale-105 transition-transform duration-200">
                    <div className="w-8 h-8 mx-auto bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-2">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{stats.attended}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kajian Diikuti</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center transform hover:scale-105 transition-transform duration-200">
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

                <MenuItem
                    icon={<User className="w-5 h-5" />}
                    label="Edit Profil"
                    onClick={() => setIsEditOpen(true)}
                />
                <MenuItem
                    icon={<Bell className="w-5 h-5" />}
                    label="Notifikasi"
                    link="/notifikasi"
                />
                <MenuItem
                    icon={<Moon className="w-5 h-5" />}
                    label="Tampilan Aplikasi"
                    onClick={() => alert('Fitur Dark Mode akan segera hadir! Nantikan ya... 😉')}
                />

                <div className="h-4"></div>

                <MenuItem
                    icon={<HelpCircle className="w-5 h-5" />}
                    label="Bantuan & Hubungi Kami"
                    link="/hubungi-kami"
                />
                <MenuItem
                    icon={<Shield className="w-5 h-5" />}
                    label="Kebijakan Privasi"
                    link="/privacy-policy" // Assuming this route exists or we created it
                />

                <div className="h-4"></div>

                {isAdmin ? (
                    <MenuItem
                        icon={<LayoutDashboard className="w-5 h-5 text-blue-600" />}
                        label="Dashboard Admin"
                        link="/admin"
                        className="border-blue-100 bg-blue-50/50"
                    />
                ) : (
                    <MenuItem
                        icon={<LogOut className="w-5 h-5 text-orange-500" />}
                        label="Login Admin Area"
                        link="/login"
                    />
                )}
            </div>

            <div className="text-center pb-8 opacity-50">
                <p className="text-[10px] text-slate-400">PortalKajian.online v1.0.0</p>
            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                initialData={profile}
                onSave={handleUpdateProfile}
            />
        </div>
    );
}
