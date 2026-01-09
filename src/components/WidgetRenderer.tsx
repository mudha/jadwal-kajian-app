'use client';

import React from 'react';
import SidebarMenuWidget from './widgets/SidebarMenuWidget';
import ContactWidget from './widgets/ContactWidget';
import PrayerTimesWidget from './widgets/PrayerTimesWidget';
import HeroWidget from './widgets/HeroWidget';
import QuickMenuWidget from './widgets/QuickMenuWidget';
import OngoingWidget from './widgets/OngoingWidget';
import LatestKajianWidget from './widgets/LatestKajianWidget';
import KajianListWidget from './widgets/KajianListWidget';
import SidebarBrandWidget from './widgets/SidebarBrandWidget';

const WIDGET_MAP: Record<string, React.FC<any>> = {
    'SidebarMenuWidget': SidebarMenuWidget,
    'ContactWidget': ContactWidget,
    'PrayerTimesWidget': PrayerTimesWidget,
    'HeroWidget': HeroWidget,
    'QuickMenuWidget': QuickMenuWidget,
    'OngoingWidget': OngoingWidget,
    'LatestKajianWidget': LatestKajianWidget,
    'KajianListWidget': KajianListWidget,
    'SidebarBrandWidget': SidebarBrandWidget,
};

interface WidgetRendererProps {
    widgetIds: string[];
    data?: any;
}

export default function WidgetRenderer({ widgetIds = [], data }: WidgetRendererProps) {
    return (
        <>
            {widgetIds.map((id) => {
                // Support suffixed IDs (e.g. "HeroWidget:mobile") for unique keys in DnD
                const widgetName = id.split(':')[0];
                const WidgetComponent = WIDGET_MAP[widgetName];
                if (!WidgetComponent) return null;
                return <WidgetComponent key={id} data={data} />;
            })}
        </>
    );
}
