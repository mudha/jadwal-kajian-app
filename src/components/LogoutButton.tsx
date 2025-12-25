'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ mobile }: { mobile?: boolean }) {
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm('Keluar dari halaman admin?')) {
            await fetch('/api/login', { method: 'DELETE' });
            router.push('/login');
            router.refresh();
        }
    };

    if (mobile) {
        return (
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <LogOut className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Keluar</span>
        </button>
    );
}
