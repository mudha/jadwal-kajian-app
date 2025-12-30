import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function LogoutButton({ mobile }: { mobile?: boolean }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        setIsOpen(false);
        await fetch('/api/login', { method: 'DELETE' });
        router.push('/login');
        router.refresh();
    };

    if (mobile) {
        return (
            <>
                <button onClick={() => setIsOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <LogOut className="w-5 h-5" />
                </button>
                <ConfirmationModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onConfirm={handleLogout}
                    title="Keluar dari Admin?"
                    message="Sesi login Anda akan berakhir."
                    confirmText="Keluar"
                    type="danger"
                />
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Keluar</span>
            </button>
            <ConfirmationModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleLogout}
                title="Keluar dari Admin?"
                message="Sesi login Anda akan berakhir."
                confirmText="Keluar"
                type="danger"
            />
        </>
    );
}
