'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, Merge, Search, X, CheckCircle, MapPin } from 'lucide-react';

interface DuplicateGroup {
    canonical: string;
    variants: string[];
    count: number;
    type: 'masjid' | 'ustadz';
    locationInfo?: { [key: string]: { cities: string; addresses: string } };
}

interface MergeAction {
    type: 'masjid' | 'ustadz';
    from: string;
    to: string;
}

export default function DeduplicatePage() {
    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<'all' | 'masjid' | 'ustadz'>('all');
    const [mergeQueue, setMergeQueue] = useState<MergeAction[]>([]);
    const [isMerging, setIsMerging] = useState(false);

    useEffect(() => {
        fetchDuplicates();
    }, []);

    const fetchDuplicates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/detect-duplicates');
            const data = await res.json();
            if (data.success) {
                setDuplicates(data.duplicates || []);
            }
        } catch (error) {
            console.error('Error fetching duplicates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMerge = async (group: DuplicateGroup, variantToMerge: string) => {
        const action: MergeAction = {
            type: group.type,
            from: variantToMerge,
            to: group.canonical
        };

        if (!confirm(`Merge "${variantToMerge}" → "${group.canonical}"?\n\nSemua kajian dengan nama "${variantToMerge}" akan diubah menjadi "${group.canonical}".`)) {
            return;
        }

        setIsMerging(true);
        try {
            const res = await fetch('/api/admin/merge-duplicates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(action)
            });

            const data = await res.json();
            if (data.success) {
                // Refresh duplicates list
                await fetchDuplicates();
            } else {
                alert('Gagal melakukan merge: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error merging:', error);
            alert('Terjadi kesalahan saat merge');
        } finally {
            setIsMerging(false);
        }
    };

    const filteredDuplicates = duplicates.filter(group => {
        const matchesType = selectedType === 'all' || group.type === selectedType;
        const matchesSearch = searchTerm === '' ||
            group.canonical.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.variants.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesType && matchesSearch;
    });

    const totalDuplicates = duplicates.reduce((sum, g) => sum + g.variants.length, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Deteksi Duplikat</h1>
                    <p className="text-slate-500">Temukan dan gabungkan nama ustadz atau masjid yang duplikat.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-orange-500 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-orange-900">{duplicates.length}</div>
                            <div className="text-xs font-bold text-orange-700 uppercase tracking-wider">Grup Duplikat</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500 rounded-xl">
                            <Merge className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-red-900">{totalDuplicates}</div>
                            <div className="text-xs font-bold text-red-700 uppercase tracking-wider">Total Duplikat</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-500 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-teal-900">{filteredDuplicates.length}</div>
                            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Ditampilkan</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama ustadz atau masjid..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedType === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setSelectedType('masjid')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedType === 'masjid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Masjid
                        </button>
                        <button
                            onClick={() => setSelectedType('ustadz')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedType === 'ustadz' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            Ustadz
                        </button>
                    </div>
                </div>
            </div>

            {/* Duplicate Groups */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600 font-medium">Memindai duplikat...</p>
                </div>
            ) : filteredDuplicates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-2">Tidak Ada Duplikat</h3>
                    <p className="text-slate-500">Semua nama ustadz dan masjid sudah unik!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDuplicates.map((group, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${group.type === 'masjid' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {group.type}
                                            </span>
                                            <h3 className="text-lg font-black text-slate-900">{group.canonical}</h3>
                                        </div>
                                        <span className="text-sm font-bold text-slate-500">{group.variants.length} varian</span>
                                    </div>

                                    {/* Canonical Location Info */}
                                    {group.locationInfo?.[group.canonical] && (
                                        <div className="flex items-start gap-2 text-xs text-slate-600 pl-1">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                                            <div>
                                                <div className="font-bold">{group.locationInfo[group.canonical].cities || 'Kota tidak diketahui'}</div>
                                                <div className="text-slate-500 line-clamp-1">{group.locationInfo[group.canonical].addresses || 'Alamat tidak diketahui'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {group.variants.map((variant, vIdx) => (
                                    <div key={vIdx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-all gap-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-900">{variant}</div>

                                                {/* Variant Location Info */}
                                                {group.locationInfo?.[variant] && (
                                                    <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-1">
                                                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-slate-400" />
                                                        <span>
                                                            <span className="font-semibold">{group.locationInfo[variant].cities}</span>
                                                            {group.locationInfo[variant].cities && group.locationInfo[variant].addresses && ' • '}
                                                            <span className="text-slate-500">{group.locationInfo[variant].addresses}</span>
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="text-xs text-slate-400">
                                                    Akan digabung ke: <span className="font-bold text-slate-600">{group.canonical}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMerge(group, variant)}
                                            disabled={isMerging}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shrink-0 whitespace-nowrap md:self-center self-end"
                                        >
                                            <Merge className="w-4 h-4" />
                                            Merge
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
