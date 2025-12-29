'use client';

import { usePathname, useRouter } from 'next/navigation';
import PullToRefresh from '@/components/PullToRefresh';
import { ReactNode } from 'react';

export default function GlobalPullToRefresh({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Use Next.js soft refresh
    const handleRefresh = async () => {
        return new Promise<void>((resolve) => {
            // Trigger server re-fetch
            router.refresh();

            // Wait a minimum time for visual feedback (since router.refresh might be fast or slow)
            setTimeout(() => {
                resolve();
            }, 800);
        });
    };

    // Disable PullToRefresh on Admin pages as it might conflict with forms/tables scroll
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            {children}
        </PullToRefresh>
    );
}
