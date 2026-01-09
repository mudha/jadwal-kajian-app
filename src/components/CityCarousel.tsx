'use client';
import { MapPin, Search, X, ChevronRight } from 'lucide-react';
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
        <div className="mb-8 select-none">
            {/* Mobile View: Horizontal Scroll */}
            <div className="md:hidden">
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                    {/* 'Semua Kota' Option */}
                    <button
                        onClick={() => onSelectCity(null)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all min-w-[160px] snap-center
                            ${selectedCity === null
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200'
                                : 'bg-white text-slate-600 border-slate-200'
                            }
                        `}
                    >
                        <div className={`p-2 rounded-full ${selectedCity === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm leading-none mb-1">Semua</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Indonesia</p>
                        </div>
                    </button>

                    {mobileCities.map((city) => (
                        <CityButton key={city.name} city={city} isMobile />
                    ))}

                    {/* 'Lainnya' Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 min-w-[100px] snap-center hover:bg-slate-100 hover:border-slate-400 transition-all"
                    >
                        <div className="p-2 bg-white rounded-full border border-slate-200">
                            <Search className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">Lainnya</span>
                    </button>
                </div>
            </div>

            {/* Desktop View: Grid */}
            <div className="hidden md:block">
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    <button
                        onClick={() => onSelectCity(null)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
                            ${selectedCity === null
                                ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                            }
                        `}
                    >
                        <div className={`p-2 rounded-full ${selectedCity === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                            <MapPin className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-sm leading-none mb-1">Semua</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Indonesia</p>
                        </div>
                    </button>

                    {desktopCities.map((city) => (
                        <CityButton key={city.name} city={city} />
                    ))}

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-400 transition-all font-bold text-sm group"
                    >
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Lihat Semua Kota
                    </button>
                </div>
            </div>

            {/* Search Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari kota..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        onSelectCity(null);
                                        setIsModalOpen(false);
                                    }}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
                                        ${selectedCity === null
                                            ? 'bg-teal-600 text-white border-teal-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className={`p-2 rounded-full ${selectedCity === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-sm">Semua Indonesia</span>
                                </button>

                                {filteredCitiesInModal.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => {
                                            onSelectCity(city.name);
                                            setIsModalOpen(false);
                                        }}
                                        className={`
                                            flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left
                                            ${selectedCity === city.name
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`p-2 rounded-full shrink-0 ${selectedCity === city.name ? 'bg-white/20' : 'bg-slate-100'}`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-sm truncate">{city.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${selectedCity === city.name ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                            {city.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {filteredCitiesInModal.length === 0 && (
                                <div className="text-center py-12 text-slate-400">
                                    <p className="font-bold">Kota tidak ditemukan</p>
                                    <p className="text-xs mt-1">Coba kata kunci lain</p>
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
