'use client';
import Link from 'next/link';
import { UserPlus, Shield, Users, ArrowRight } from 'lucide-react';

export default function RegisterLandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Bergabung dengan PortalKajian.online
                    </h1>
                    <p className="text-teal-100 text-lg">
                        Pilih jenis akun yang ingin Anda daftarkan
                    </p>
                </div>

                {/* Two Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contributor Card */}
                    <Link
                        href="/register/contributor"
                        className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">
                                Daftar sebagai Kontributor
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Bantu update jadwal kajian di daerahmu. Gratis, mudah, dan tidak perlu kode rahasia!
                            </p>
                            <ul className="text-left space-y-2 mb-6 text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-600 font-bold">✓</span>
                                    <span>Tanpa kode rahasia</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-600 font-bold">✓</span>
                                    <span>Review dalam 1x24 jam</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-teal-600 font-bold">✓</span>
                                    <span>Berkontribusi untuk umat</span>
                                </li>
                            </ul>
                            <div className="flex items-center gap-2 text-teal-600 font-bold group-hover:gap-4 transition-all">
                                Daftar Sekarang
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>

                    {/* Admin Card */}
                    <Link
                        href="/register/admin"
                        className="group bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1 cursor-pointer opacity-90"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-3">
                                Daftar sebagai Admin
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Memerlukan kode rahasia khusus dari administrator utama.
                            </p>
                            <ul className="text-left space-y-2 mb-6 text-sm text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-600 font-bold">●</span>
                                    <span>Butuh kode rahasia</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-600 font-bold">●</span>
                                    <span>Akses penuh ke sistem</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-600 font-bold">●</span>
                                    <span>Kelola semua data</span>
                                </li>
                            </ul>
                            <div className="flex items-center gap-2 text-slate-600 font-bold group-hover:gap-4 transition-all">
                                Daftar Admin
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-8 space-y-3">
                    <p className="text-white/80 text-sm">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-bold text-white hover:underline">
                            Login di sini
                        </Link>
                    </p>
                    <Link
                        href="/"
                        className="inline-block text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
        </div>
    );
}
