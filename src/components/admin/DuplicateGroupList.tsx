'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, MapPin, ArrowRight, Loader2 } from 'lucide-react';

export interface DuplicateGroup {
    canonical: string;
    variants: string[];
    count: number;
    type: 'masjid' | 'ustadz';
    locationInfo?: { [key: string]: { cities: string; addresses: string } };
}

interface DuplicateGroupListProps {
    type: 'masjid' | 'ustadz';
    onSelectGroup: (items: string[]) => void;
}

export default function DuplicateGroupList({ type, onSelectGroup }: DuplicateGroupListProps) {
    const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDuplicates();
    }, [type]);

    const fetchDuplicates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/detect-duplicates');
            const data = await res.json();
            if (data.success && data.duplicates) {
                // Filter by type
                setDuplicates(data.duplicates.filter((d: DuplicateGroup) => d.type === type));
            }
        } catch (error) {
            console.error('Error fetching duplicates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p>Memindai database untuk mencari duplikat...</p>
            </div>
        );
    }

    if (duplicates.length === 0) {
        return (
            <div className="text-center py-12 px-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Bersih! Tidak Ada Duplikat</h3>
                <p className="text-slate-500 mt-2">
                    Alhamdulillah, belum ditemukan indikasi duplikat untuk data {type}.
                </p>
                <button
                    onClick={fetchDuplicates}
                    className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-bold underline"
                >
                    Scan Ulang
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-orange-800">Ditemukan {duplicates.length} Potensi Duplikat</h3>
                    <p className="text-sm text-orange-600 mt-1">
                        Sistem mendeteksi kemiripan nama. Silakan tinjau dan gabungkan jika perlu.
                    </p>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {duplicates.map((group, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">{group.canonical}</h4>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    + {group.variants.length} Varian Mirip
                                </p>
                            </div>
                            <button
                                onClick={() => onSelectGroup([group.canonical, ...group.variants])}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-200"
                            >
                                Tinjau & Gabung
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Variants List */}
                        <div className="space-y-2 bg-slate-50 rounded-lg p-3">
                            {group.variants.map((variant, vIdx) => (
                                <div key={vIdx} className="flex flex-col text-sm border-l-2 border-orange-300 pl-3">
                                    <span className="font-bold text-slate-700">{variant}</span>
                                    {group.locationInfo?.[variant] && (
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <MapPin className="w-3 h-3" />
                                            {group.locationInfo[variant].cities}
                                            {group.locationInfo[variant].addresses && ` • ${group.locationInfo[variant].addresses}`}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
