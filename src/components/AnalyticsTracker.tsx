'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent tracking in dev mode double-fire, or if just navigating repeatedly
        // For real analytics, we usually track every page view.

        const track = async () => {
            // Avoid tracking admin pages to keep data clean?
            if (pathname?.startsWith('/admin')) return;

            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: pathname })
                });
            } catch (e) {
                console.error('Tracking failed', e);
            }
        };

        track();
    }, [pathname]);

    return null;
}
