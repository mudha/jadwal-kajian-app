'use client';
import { MapPin, Search, X, ChevronRight, ChevronDown } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface CityData {
    name: string;
    count: number;
}

interface CityCarouselProps {
    cities: CityData[];
    selectedCity: string | null;
    onSelectCity: (city: string | null) => void;
}

export default function CityCarousel({ cities, selectedCity, onSelectCity }: CityCarouselProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Sort cities: Selected first (if any), then by count (desc), then alphabetical
    const sortedCities = useMemo(() => {
        return [...cities].sort((a, b) => {
            if (selectedCity === a.name) return -1;
            if (selectedCity === b.name) return 1;
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
        });
    }, [cities, selectedCity]);

    // Top cities for initial view
    const MOBILE_LIMIT = 10;
    const DESKTOP_LIMIT = 14;

    const mobileCities = sortedCities.slice(0, MOBILE_LIMIT);
    const desktopCities = sortedCities.slice(0, DESKTOP_LIMIT);

    const filteredCitiesInModal = sortedCities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const CityButton = ({ city, isMobile = false }: { city: CityData, isMobile?: boolean }) => (
        <button
            onClick={() => onSelectCity(selectedCity === city.name ? null : city.name)}
            className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
                ${isMobile ? 'min-w-[160px] snap-center' : 'w-full'}
                ${selectedCity === city.name
                    ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200 scale-[1.02]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50 hover:shadow-md'
                }
            `}
        >
            <div className={`
                p-2 rounded-full shrink-0 transition-colors
                ${selectedCity === city.name ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}
            `}>
                <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left flex-1 min-w-0">
                <p className="font-bold text-sm truncate leading-tight mb-0.5">{city.name}</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${selectedCity === city.name ? 'text-teal-100' : 'text-slate-400 group-hover:text-teal-600'}`}>
                    {city.count} Kajian
                </p>
            </div>
        </button>
    );

    return (
        <div className="mb-6 select-none relative z-30">
            {/* Modern Dropdown Trigger */}
            <button
                onClick={() => setIsModalOpen(true)}
                className={`
                    w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 group
                    ${selectedCity
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xl shadow-teal-200 ring-2 ring-teal-500 ring-offset-2'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:shadow-lg'
                    }
                `}
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${selectedCity ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${selectedCity ? 'text-teal-100' : 'text-slate-400'}`}>
                            Lokasi Kajian
                        </p>
                        <p className="text-lg font-black truncate leading-none">
                            {selectedCity || 'Semua Indonesia'}
                        </p>
                    </div>
                </div>
                <div className={`p-2 rounded-full ${selectedCity ? 'bg-white/20 text-teal-100' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>

            {/* Search Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center gap-4 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kota, kabupaten..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 bg-slate-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        onSelectCity(null);
                                        setIsModalOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all
                                        ${selectedCity === null
                                            ? 'bg-teal-600 text-white border-teal-600 ring-4 ring-teal-100'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-[0.98]'
                                        }
                                    `}
                                >
                                    <div className={`p-2.5 rounded-xl ${selectedCity === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-black text-sm">Semua Indonesia</span>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${selectedCity === null ? 'opacity-80' : 'text-slate-400'}`}>
                                            Tampilkan Semua
                                        </span>
                                    </div>
                                </button>

                                {filteredCitiesInModal.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => {
                                            onSelectCity(city.name);
                                            setIsModalOpen(false);
                                        }}
                                        className={`
                                            flex items-center justify-between px-5 py-4 rounded-2xl border transition-all text-left group
                                            ${selectedCity === city.name
                                                ? 'bg-teal-600 text-white border-teal-600 ring-4 ring-teal-100'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`p-2.5 rounded-xl shrink-0 ${selectedCity === city.name ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-teal-50'}`}>
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <span className="font-black text-sm truncate">{city.name}</span>
                                        </div>
                                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${selectedCity === city.name ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                            {city.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {filteredCitiesInModal.length === 0 && (
                                <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="font-black text-lg text-slate-600">Kota tidak ditemukan</p>
                                    <p className="text-sm mt-1">Coba cari dengan kata kunci lain</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
