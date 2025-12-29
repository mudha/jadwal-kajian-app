'use client';
import { useState, useEffect } from 'react';
import { Search, GraduationCap, MapPin, Phone, DollarSign, Filter, X } from 'lucide-react';
import Link from 'next/link';

interface Sekolah {
    id: number;
    nama: string;
    slug: string;
    jenjang: string;
    kota: string;
    provinsi?: string;
    spp_bulanan?: number;
    uang_masuk?: number;
    khusus_akhwat?: boolean;
    khusus_ikhwan?: boolean;
    imageUrl?: string;
    alamat: string;
    telepon?: string;
    handphone?: string;
}

const JENJANG_OPTIONS = ['Semua', 'DC', 'PAUD', 'TK', 'MI', 'MTs', 'MA', 'SD', 'SMP', 'SMA', 'SMK', 'PT', 'Pesantren', 'Kursus'];

const JENJANG_MAP: Record<string, string> = {
    'DC': 'Day Care',
    'PAUD': 'Pendidikan Anak Usia Dini',
    'TK': 'Taman Kanak-Kanak',
    'MI': 'Madrasah Ibtidaiyah',
    'MTs': 'Madrasah Tsanawiyah',
    'MA': 'Madrasah Aliyah',
    'SD': 'Sekolah Dasar',
    'SMP': 'Sekolah Menengah Pertama',
    'SMA': 'Sekolah Menengah Atas',
    'SMK': 'Sekolah Menengah Kejuruan',
    'PT': 'Perguruan Tinggi',
    'Pesantren': 'Pondok Pesantren',
    'Kursus': 'Lembaga Kursus'
};

export default function SekolahSunnahPage() {
    const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [jenjang, setJenjang] = useState('Semua');
    const [kota, setKota] = useState('');
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchSekolah();
    }, [jenjang, kota, search]);

    const fetchSekolah = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (jenjang !== 'Semua') {
                const mappedJenjang = JENJANG_MAP[jenjang] || jenjang;
                params.append('jenjang', mappedJenjang);
            }
            if (kota) params.append('kota', kota);
            if (search) params.append('search', search);
            params.append('limit', '50');

            const res = await fetch(`/api/sekolah?${params.toString()}`);
            const data = await res.json();

            setSekolahList(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Error fetching sekolah:', error);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="w-12 h-12" />
                        <div>
                            <h1 className="text-4xl font-black">Sekolah Sunnah</h1>
                            <p className="text-purple-100">Direktori Sekolah Islam Bermanhaj Salaf</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6 relative">
                        <input
                            type="text"
                            placeholder="Cari nama sekolah atau alamat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-5 py-4 pl-12 rounded-2xl text-slate-900 font-bold outline-none shadow-lg"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex gap-3 flex-wrap items-center">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-white/30 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>

                        {jenjang !== 'Semua' && (
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg font-bold flex items-center gap-2">
                                {jenjang}
                                <button onClick={() => setJenjang('Semua')} className="hover:bg-white/20 rounded-full p-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {kota && (
                            <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg font-bold flex items-center gap-2">
                                {kota}
                                <button onClick={() => setKota('')} className="hover:bg-white/20 rounded-full p-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        <span className="text-white/90 text-sm">{total} sekolah ditemukan</span>
                    </div>

                    {/* Filter Dropdown */}
                    {showFilters && (
                        <div className="mt-4 bg-white rounded-2xl p-6 text-slate-900 shadow-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 block">Jenjang</label>
                                    <div className="flex flex-wrap gap-2">
                                        {JENJANG_OPTIONS.map(j => (
                                            <button
                                                key={j}
                                                onClick={() => setJenjang(j)}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${jenjang === j
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {j}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 block">Kota</label>
                                    <input
                                        type="text"
                                        placeholder="Misal: Jakarta, Bandung, Surabaya"
                                        value={kota}
                                        onChange={(e) => setKota(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* School List */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                        <p className="mt-4 text-slate-600 font-bold">Memuat sekolah...</p>
                    </div>
                ) : sekolahList.length === 0 ? (
                    <div className="text-center py-12">
                        <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-xl font-bold text-slate-600">Belum ada data sekolah</p>
                        <p className="text-slate-500">Data akan segera diimport dari sekolahsunnah.com</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sekolahList.map(sekolah => (
                            <Link
                                key={sekolah.id}
                                href={`/sekolah-sunnah/${sekolah.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100"
                            >
                                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                                    {sekolah.imageUrl ? (
                                        <img src={sekolah.imageUrl} alt={sekolah.nama} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <GraduationCap className="w-16 h-16 text-purple-300" />
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-black">
                                            {sekolah.jenjang}
                                        </span>
                                        {sekolah.khusus_akhwat && (
                                            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-black">
                                                🌸 Akhwat
                                            </span>
                                        )}
                                        {sekolah.khusus_ikhwan && (
                                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black">
                                                Ikhwan
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <h3 className="font-black text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                        {sekolah.nama}
                                    </h3>

                                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">{sekolah.kota}{sekolah.provinsi && `, ${sekolah.provinsi}`}</span>
                                    </div>

                                    {sekolah.spp_bulanan && (
                                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-green-700">SPP/Bulan</span>
                                                <span className="text-sm font-black text-green-900">{formatRupiah(sekolah.spp_bulanan)}</span>
                                            </div>
                                        </div>
                                    )}

                                    <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition-colors">
                                        Lihat Detail
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Attribution */}
            <div className="container mx-auto px-4 py-8 text-center text-sm text-slate-500">
                Data sekolah bersumber dari{' '}
                <a
                    href="https://sekolahsunnah.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline font-bold"
                >
                    SekolahSunnah.com
                </a>
            </div>
        </div>
    );
}
