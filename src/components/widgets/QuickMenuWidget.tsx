'use client';

import QuickMenu from '@/components/QuickMenu';

interface WidgetProps {
    data?: any;
}

export default function QuickMenuWidget({ data }: WidgetProps) {
    return <QuickMenu customItems={data?.quickMenuItems} />;
}
