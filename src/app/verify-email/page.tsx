'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_verified'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token verifikasi tidak ditemukan');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (token: string) => {
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.alreadyVerified) {
                    setStatus('already_verified');
                    setMessage(data.message);
                } else {
                    setStatus('success');
                    setMessage(data.message);
                }
            } else {
                setStatus('error');
                setMessage(data.error || 'Verifikasi gagal');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Terjadi kesalahan saat verifikasi');
            console.error('Verification error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4">
                            <Mail className="w-8 h-8 text-teal-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Verifikasi Email
                        </h1>
                        <p className="text-slate-600 text-sm">
                            PortalKajian.online
                        </p>
                    </div>

                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Memverifikasi email Anda...</p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">
                                Email Berhasil Diverifikasi!
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {message}
                            </p>
                            <Link
                                href="/login"
                                className="inline-block w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Login Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Already Verified State */}
                    {status === 'already_verified' && (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                                <CheckCircle className="w-12 h-12 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">
                                Email Sudah Diverifikasi
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Email Anda sudah pernah diverifikasi sebelumnya.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Login Sekarang
                            </Link>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3">
                                Verifikasi Gagal
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                {message}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/register/contributor"
                                    className="block w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    Daftar Ulang
                                </Link>
                                <Link
                                    href="/"
                                    className="block w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                >
                                    Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Butuh bantuan? <a href="/hubungi-kami" className="text-teal-600 hover:underline font-medium">Hubungi Kami</a>
                </p>
            </div>
        </div>
    );
}
