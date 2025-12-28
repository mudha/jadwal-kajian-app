'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [pulling, setPulling] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Threshold to trigger refresh (in pixels)
    const PULL_THRESHOLD = 80;
    // Maximum pull distance visual
    const MAX_PULL = 150;

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only enable pull if at the top of the scroll
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
            setPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!pulling || window.scrollY > 0) return;

        const y = e.touches[0].clientY;
        const diff = y - startY;

        if (diff > 0) {
            // Prevent default to avoid chrome's native pull-to-refresh if we want to override it
            // usually better to let it be, but for custom UI we might want to control it.
            // e.preventDefault(); 

            // Add resistance
            const dampedDiff = Math.min(diff * 0.5, MAX_PULL);
            setCurrentY(dampedDiff);
        }
    };

    const handleTouchEnd = async () => {
        if (!pulling) return;

        setPulling(false);

        if (currentY > PULL_THRESHOLD) {
            setRefreshing(true);
            setCurrentY(60); // Snap to loading position
            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                setCurrentY(0);
            }
        } else {
            setCurrentY(0);
        }
    };

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="min-h-screen relative"
        >
            {/* Loading Indicator */}
            <div
                className="fixed top-0 left-0 w-full flex items-center justify-center pointer-events-none z-50 transition-transform duration-200 ease-out"
                style={{
                    transform: `translateY(${Math.max(0, currentY - 40)}px)`,
                    opacity: currentY > 0 ? 1 : 0
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-lg border border-slate-100">
                    {refreshing ? (
                        <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                    ) : (
                        <ArrowDown
                            className="w-5 h-5 text-teal-600 transition-transform duration-200"
                            style={{ transform: `rotate(${currentY > PULL_THRESHOLD ? 180 : 0}deg)` }}
                        />
                    )}
                </div>
            </div>

            {/* Content with transform */}
            <div
                style={{
                    transform: `translateY(${refreshing ? 60 : currentY}px)`,
                    transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {children}
            </div>
        </div>
    );
}
