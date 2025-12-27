'use client';
import { useState, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Auto-redirect if already logged in
        fetch('/api/admin/check-session')
            .then(res => {
                if (res.ok) {
                    router.replace('/admin');
                }
            })
            .catch(() => { });
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                setError('Password salah. Silakan coba lagi.');
            }
        } catch (err) {
            setError('Terjadi kesalahan sistem.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                    <div className="p-8 md:p-12">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-200 mx-auto">
                            <ShieldCheck className="w-8 h-8" />
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Admin Login</h1>
                            <p className="text-slate-500 font-medium">Halaman khusus pengelola jadwal kajian.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Username ID</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="text"
                                        required
                                        autoComplete="off"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold transition-all text-slate-900"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password Akses</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="password"
                                        required
                                        autoComplete="new-password"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold transition-all text-slate-900"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100 animate-shake">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? 'Memverifikasi...' : 'Masuk Dashboard'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-50 p-6 text-center border-t border-slate-100 space-y-3">
                        <p className="text-slate-400 text-xs font-medium">Lupa password? Hubungi Lead Developer.</p>
                        <p className="text-slate-600 text-sm">
                            Belum punya akun?{' '}
                            <a href="/register" className="text-blue-600 font-bold hover:text-blue-700">
                                Daftar di sini
                            </a>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-sm font-medium italic">
                    &copy; 2025 Jadwal Kajian Indonesia Portal
                </p>
            </div>
        </div>
    );
}
