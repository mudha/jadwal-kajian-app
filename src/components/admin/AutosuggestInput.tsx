'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AutosuggestInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (item: any) => void;
    placeholder?: string;
    type: 'masjid' | 'pemateri';
    className?: string;
}

export default function AutosuggestInput({ value, onChange, onSelect, placeholder, type, className }: AutosuggestInputProps) {
    const [suggestions, setSuggestions] = useState<({ value: string; count: number } & {
        city?: string;
        address?: string;
        gmapsUrl?: string;
        lat?: number;
        lng?: number;
    })[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce checking
    useEffect(() => {
        const timer = setTimeout(() => {
            if (value && value.length >= 2 && showSuggestions) {
                fetchSuggestions(value);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, showSuggestions]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const fetchSuggestions = async (query: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/suggestions?type=${type}&q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFocus = () => {
        // Only fetch if we have some text, or maybe fetch recent/popular if empty? 
        // For now let's just show if there is text.
        if (value.length >= 1) {
            setShowSuggestions(true);
            fetchSuggestions(value);
        }
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (!showSuggestions && e.target.value.length >= 1) {
                        setShowSuggestions(true);
                    }
                }}
                onFocus={handleFocus}
                placeholder={placeholder}
                className={className}
            />

            {/* Loading Indicator inside input */}
            {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
                <div className="absolute left-0 right-0 z-[1000] mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-68 overflow-y-auto ring-1 ring-slate-900/5 transition-all">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold">Mencari...</span>
                        </div>
                    ) : (
                        suggestions.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex justify-between items-center group border-b border-slate-50 last:border-0"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onChange(item.value);
                                    if (onSelect) onSelect(item);
                                    setShowSuggestions(false);
                                }}
                                onTouchStart={(e) => {
                                    // For mobile touch support
                                    e.preventDefault();
                                    onChange(item.value);
                                    if (onSelect) onSelect(item);
                                    setShowSuggestions(false);
                                }}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700">{item.value}</span>
                                    {type === 'masjid' && item.city && (
                                        <span className="text-[10px] text-slate-600 font-medium group-hover:text-blue-500">{item.city}</span>
                                    )}
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 font-black">
                                    {item.count}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
