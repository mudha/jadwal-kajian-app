'use client';

import { MapPin } from 'lucide-react';
import { useRef } from 'react';

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Sort cities: Selected first (if any), then by count (desc), then alphabetical
    const sortedCities = [...cities].sort((a, b) => {
        if (selectedCity === a.name) return -1;
        if (selectedCity === b.name) return 1;
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-3">
                {/* 'Semua Kota' Option */}
                <button
                    onClick={() => onSelectCity(null)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${selectedCity === null
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                >
                    <div className={`p-1.5 rounded-full ${selectedCity === null ? 'bg-white/20' : 'bg-slate-100'}`}>
                        <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Semua</p>
                        <p className="font-bold text-sm leading-none">Indonesia</p>
                    </div>
                </button>

                {sortedCities.map((city) => (
                    <button
                        key={city.name}
                        onClick={() => onSelectCity(selectedCity === city.name ? null : city.name)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${selectedCity === city.name
                                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                            }`}
                    >
                        <div className="text-left flex-1 min-w-0">
                            <p className="font-bold text-sm truncate leading-tight mb-0.5">{city.name}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                                {city.count} Kajian
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
