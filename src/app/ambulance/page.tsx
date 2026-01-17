'use client';
import { useState, useEffect } from 'react';
import { Search, Phone, MapPin, ChevronDown, Share2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Ambulance {
    id: number;
    name: string;
    region: string;
    city: string | null;
    address: string | null;
    contacts: string[];
    notes: string | null;
}

export default function AmbulancePage() {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
    const [filteredAmbulances, setFilteredAmbulances] = useState<Ambulance[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAmbulances();
    }, []);

    useEffect(() => {
        filterAmbulances();
    }, [searchQuery, selectedRegion, ambulances]);

    const fetchAmbulances = async () => {
        try {
            const res = await fetch('/api/ambulances');
            const data = await res.json();
            setAmbulances(data);
            setFilteredAmbulances(data);

            // Expand first region by default
            if (data.length > 0) {
                setExpandedRegions(new Set([data[0].region]));
            }
        } catch (error) {
            console.error('Failed to fetch ambulances:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAmbulances = () => {
        let filtered = ambulances;

        if (selectedRegion) {
            filtered = filtered.filter(a => a.region === selectedRegion);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(query) ||
                a.region.toLowerCase().includes(query) ||
                a.city?.toLowerCase().includes(query) ||
                a.address?.toLowerCase().includes(query)
            );
        }

        setFilteredAmbulances(filtered);
    };

    const toggleRegion = (region: string) => {
        const newExpanded = new Set(expandedRegions);
        if (newExpanded.has(region)) {
            newExpanded.delete(region);
        } else {
            newExpanded.add(region);
        }
        setExpandedRegions(newExpanded);
    };

    const groupedAmbulances: { [key: string]: Ambulance[] } = {};
    filteredAmbulances.forEach(ambulance => {
        if (!groupedAmbulances[ambulance.region]) {
            groupedAmbulances[ambulance.region] = [];
        }
        groupedAmbulances[ambulance.region].push(ambulance);
    });

    const regions = Object.keys(groupedAmbulances).sort();
    const allRegions = Array.from(new Set(ambulances.map(a => a.region))).sort();

    const handleShare = async () => {
        const url = window.location.href;
        const text = 'AMBULANS MUSLIM INDONESIA - GRATIS\\nJemput Pasien Rumah Sakit dan Pengurusan Jenazah';

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Ambulans Gratis', text, url });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(`${text}\\n${url}`);
            alert('Link berhasil disalin!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="text-white/80 hover:text-white flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm">Kembali</span>
                        </Link>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Bagikan</span>
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">🚑 Ambulans Muslim Indonesia</h1>
                    <p className="text-red-100 text-lg">GRATIS - Jemput Pasien Rumah Sakit & Pengurusan Jenazah</p>
                    <p className="text-red-200 text-sm mt-2">Update: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 space-y-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama organisasi, kota, atau wilayah..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Semua Wilayah ({allRegions.length} wilayah)</option>
                        {allRegions.map(region => (
                            <option key={region} value={region}>{region}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
                        <p className="mt-4 text-slate-600">Memuat data...</p>
                    </div>
                ) : regions.length === 0 ? (
                    <div className="text-center py-12 text-slate-600">
                        <p>Tidak ada hasil yang sesuai dengan pencarian Anda.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {regions.map((region) => {
                            const isExpanded = expandedRegions.has(region);
                            const ambulancesInRegion = groupedAmbulances[region];

                            return (
                                <div key={region} className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleRegion(region)}
                                        className="w-full px-6 py-4 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-red-600" />
                                            <span className="font-bold text-lg text-slate-900">{region}</span>
                                            <span className="text-sm text-slate-600">({ambulancesInRegion.length})</span>
                                        </div>
                                        <ChevronDown
                                            className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {isExpanded && (
                                        <div className="divide-y divide-slate-100">
                                            {ambulancesInRegion.map((ambulance, index) => (
                                                <div key={ambulance.id} className="p-6 hover:bg-slate-50 transition-colors">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-none w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <h3 className="font-bold text-slate-900 text-lg">{ambulance.name}</h3>

                                                            {ambulance.city && (
                                                                <p className="text-slate-600 flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4" />
                                                                    {ambulance.city}
                                                                </p>
                                                            )}

                                                            {ambulance.address && (
                                                                <p className="text-slate-600 text-sm">{ambulance.address}</p>
                                                            )}

                                                            <div className="space-y-2 pt-2">
                                                                {ambulance.contacts.map((contact, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={`https://wa.me/${contact}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                                                    >
                                                                        <Phone className="w-4 h-4" />
                                                                        <span>wa.me/{contact}</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                ))}
                                                            </div>

                                                            {ambulance.notes && (
                                                                <p className="text-sm text-slate-500 italic pt-2 border-t border-slate-100">
                                                                    {ambulance.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-600 text-sm">
                <p>💚 Layanan ambulance gratis untuk umat Muslim Indonesia</p>
                <p className="mt-2">Semoga Allah memudahkan urusan kita semua. Aamiin</p>
            </div>
        </div>
    );
}
