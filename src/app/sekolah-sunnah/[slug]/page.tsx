'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GraduationCap, MapPin, Phone, Globe, MessageCircle, DollarSign, ArrowLeft, ExternalLink, User } from 'lucide-react';
import Link from 'next/link';

interface Sekolah {
    id: number;
    nama: string;
    slug: string;
    jenjang: string;
    alamat: string;
    kota: string;
    provinsi?: string;
    telepon?: string;
    handphone?: string;
    whatsapp_link?: string;
    website?: string;
    gmaps_url?: string;
    lat?: number;
    lng?: number;
    uang_masuk?: number;
    spp_bulanan?: number;
    deskripsi?: string;
    khusus_akhwat?: boolean;
    khusus_ikhwan?: boolean;
    nama_pembina?: string;
    ketua_yayasan?: string;
    kepala_sekolah?: string;
    imageUrl?: string;
}

export default function SekolahDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [sekolah, setSekolah] = useState<Sekolah | null>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.slug) {
            fetchDetail();
        }
    }, [params.slug]);

    const fetchDetail = async () => {
        try {
            const res = await fetch(`/api/sekolah/${params.slug}`);
            if (!res.ok) {
                router.push('/sekolah-sunnah');
                return;
            }
            const data = await res.json();
            setSekolah(data.school);
            setRelated(data.related || []);
        } catch (error) {
            console.error('Error fetching detail:', error);
            router.push('/sekolah-sunnah');
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (amount?: number) => {
        if (!amount) return 'Hubungi Sekolah';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    <p className="mt-4 text-slate-600 font-bold">Memuat detail...</p>
                </div>
            </div>
        );
    }

    if (!sekolah) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header with Back Button */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/sekolah-sunnah"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Daftar
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Image */}
                        <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100 relative shadow-lg">
                            {sekolah.imageUrl ? (
                                <img src={sekolah.imageUrl} alt={sekolah.nama} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <GraduationCap className="w-24 h-24 text-purple-300" />
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                <div className="flex gap-2 mb-3">
                                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-black">
                                        {sekolah.jenjang}
                                    </span>
                                    {sekolah.khusus_akhwat && (
                                        <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-black">
                                            🌸 Khusus Akhwat
                                        </span>
                                    )}
                                    {sekolah.khusus_ikhwan && (
                                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-black">
                                            Khusus Ikhwan
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black text-white mb-2">{sekolah.nama}</h1>
                                <div className="flex items-center gap-2 text-white/90">
                                    <MapPin className="w-5 h-5" />
                                    <span className="font-bold">{sekolah.kota}{sekolah.provinsi && `, ${sekolah.provinsi}`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        {sekolah.deskripsi && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-4">Tentang Sekolah</h2>
                                <p className="text-slate-700 leading-relaxed">{sekolah.deskripsi}</p>
                            </div>
                        )}

                        {/* Alamat & Map */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Lokasi</h2>
                            <p className="text-slate-700 mb-4 flex items-start gap-2">
                                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <span>{sekolah.alamat}</span>
                            </p>

                            {sekolah.gmaps_url && (
                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                    <iframe
                                        src={sekolah.gmaps_url}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            )}
                        </div>

                        {/* Data Struktural */}
                        {(sekolah.nama_pembina || sekolah.ketua_yayasan || sekolah.kepala_sekolah) && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 mb-4">Data Struktural</h2>
                                <div className="space-y-3">
                                    {sekolah.nama_pembina && (
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-purple-600 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-slate-500 font-bold">Pembina</div>
                                                <div className="font-bold text-slate-900">{sekolah.nama_pembina}</div>
                                            </div>
                                        </div>
                                    )}
                                    {sekolah.ketua_yayasan && (
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-purple-600 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-slate-500 font-bold">Ketua Yayasan</div>
                                                <div className="font-bold text-slate-900">{sekolah.ketua_yayasan}</div>
                                            </div>
                                        </div>
                                    )}
                                    {sekolah.kepala_sekolah && (
                                        <div className="flex items-start gap-3">
                                            <User className="w-5 h-5 text-purple-600 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-slate-500 font-bold">Kepala Sekolah</div>
                                                <div className="font-bold text-slate-900">{sekolah.kepala_sekolah}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Biaya */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-black text-slate-900 mb-4">Biaya Pendidikan</h2>

                            <div className="space-y-4">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-bold text-blue-900">Uang Pendaftaran</span>
                                    </div>
                                    <div className="text-2xl font-black text-blue-900">{formatRupiah(sekolah.uang_masuk)}</div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <span className="text-sm font-bold text-green-900">SPP / Bulan</span>
                                    </div>
                                    <div className="text-2xl font-black text-green-900">{formatRupiah(sekolah.spp_bulanan)}</div>
                                </div>
                            </div>

                            {/* Contact Buttons */}
                            <div className="mt-6 space-y-3">
                                {sekolah.whatsapp_link && (
                                    <a
                                        href={sekolah.whatsapp_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        WhatsApp
                                    </a>
                                )}

                                {sekolah.telepon && (
                                    <a
                                        href={`tel:${sekolah.telepon}`}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Phone className="w-5 h-5" />
                                        Telepon
                                    </a>
                                )}

                                {sekolah.website && (
                                    <a
                                        href={sekolah.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Globe className="w-5 h-5" />
                                        Website
                                    </a>
                                )}

                                <a
                                    href={`https://sekolahsunnah.com/${sekolah.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    Lihat di SekolahSunnah.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Schools */}
                {related.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Sekolah Terdekat</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {related.map(school => (
                                <Link
                                    key={school.id}
                                    href={`/sekolah-sunnah/${school.slug}`}
                                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                                >
                                    <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{school.nama}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{school.kota}</span>
                                    </div>
                                    {school.spp_bulanan && (
                                        <div className="mt-2 text-sm font-bold text-green-600">
                                            {formatRupiah(school.spp_bulanan)}/bulan
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
