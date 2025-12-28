'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [currentY, setCurrentY] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Refs for mutable state in event listeners
    const startYRef = useRef(0);
    const isPullingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Threshold to trigger refresh (in pixels)
    const PULL_THRESHOLD = 80;
    // Maximum pull distance visual
    const MAX_PULL = 150;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                startYRef.current = e.touches[0].clientY;
                isPullingRef.current = true;
            } else {
                isPullingRef.current = false;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPullingRef.current || window.scrollY > 0) return;

            const y = e.touches[0].clientY;
            const diff = y - startYRef.current;

            if (diff > 0) {
                // Critical: Prevent native pull-to-refresh
                if (e.cancelable) e.preventDefault();

                // Add resistance
                const dampedDiff = Math.min(diff * 0.5, MAX_PULL);
                setCurrentY(dampedDiff);
            }
        };

        const handleTouchEnd = async () => {
            if (!isPullingRef.current) return;
            isPullingRef.current = false;

            // Access currentY from state setter or track it in ref if needed
            // But here we need to read the *rendered* currentY or sync it. 
            // Better to track the calculated value in a ref too for the listener.
        };

        // We need 'handleTouchEnd' to know the final 'currentY'. 
        // Since 'currentY' state is async, let's just re-calculate or use a ref for 'currentY' too.
    }, []);

    // Actually, let's keep it simple and clean:
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let currentPullY = 0; // Local tracking

        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY <= 0) { // <= 0 to be safe
                startYRef.current = e.touches[0].clientY;
                isPullingRef.current = true;
                currentPullY = 0;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPullingRef.current) return;

            // If user scrolls down then up, scrollY > 0, stop pulling
            if (window.scrollY > 0) {
                isPullingRef.current = false;
                setCurrentY(0);
                return;
            }

            const y = e.touches[0].clientY;
            const diff = y - startYRef.current;

            if (diff > 0) {
                if (e.cancelable) e.preventDefault();

                const dampedDiff = Math.min(diff * 0.5, MAX_PULL);
                currentPullY = dampedDiff;
                setCurrentY(dampedDiff);
            }
        };

        const handleTouchEnd = async () => {
            if (!isPullingRef.current) return;
            isPullingRef.current = false;

            if (currentPullY > PULL_THRESHOLD) {
                setRefreshing(true);
                setCurrentY(60);
                try {
                    await onRefresh();
                } finally {
                    setRefreshing(false);
                    setCurrentY(0);
                }
            } else {
                setCurrentY(0);
            }
            currentPullY = 0;
        };

        // Attach non-passive listener for touchmove to allow preventDefault
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onRefresh]); // Re-bind if onRefresh changes

    return (
        <div
            ref={containerRef}
            className="min-h-screen relative"
        >
            {/* Loading Indicator */}
            <div
                className="absolute top-0 left-0 w-full flex items-center justify-center pointer-events-none z-30 transition-transform duration-200 ease-out"
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
                    transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {children}
            </div>
        </div>
    );
}
