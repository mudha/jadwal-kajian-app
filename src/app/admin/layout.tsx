import Link from 'next/link';
import { LayoutDashboard, FileInput, LogOut, ShieldCheck, ListMusic, Calendar } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Determine active session (double check server side)
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
                            <p className="text-slate-400 text-xs">Jadwal Kajian App</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/manage"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Kelola Jadwal</span>
                    </Link>
                    <Link
                        href="/admin/batch-input"
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                    >
                        <FileInput className="w-5 h-5" />
                        <span className="font-medium">Input Massal</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <LogoutButton />
                </div>
            </aside>

            {/* Mobile Nav & Content Wrapper */}
            <div className="flex-1 md:ml-64">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1.5 rounded-lg text-white">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900">Admin Panel</span>
                    </div>
                    <LogoutButton mobile />
                </header>

                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
