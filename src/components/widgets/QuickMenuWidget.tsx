'use client';

import QuickMenu from '@/components/QuickMenu';

interface WidgetProps {
    data?: any;
}

export default function QuickMenuWidget({ data }: WidgetProps) {
    // Show skeleton grid while data loads to prevent layout shift
    if (!data || data.quickMenuItems === undefined) {
        return <QuickMenuSkeleton />;
    }

    // Only pass customItems if it exists and has items
    const customItems = Array.isArray(data.quickMenuItems) && data.quickMenuItems.length > 0
        ? data.quickMenuItems
        : undefined;

    return <QuickMenu customItems={customItems} />;
}

function QuickMenuSkeleton() {
    return (
        <div className="mb-6">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 min-h-[320px] md:min-h-[280px]">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse border border-slate-100"
                    />
                ))}
            </div>
        </div>
    );
}
