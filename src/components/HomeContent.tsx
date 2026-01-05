'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';
import QuickMenu from '@/components/QuickMenu';
import Link from 'next/link';
import { getKajianStatus, parseIndoDate } from '@/lib/date-utils';
import WidgetRenderer from '@/components/WidgetRenderer';
import SidebarMenuWidget from '@/components/widgets/SidebarMenuWidget';
import MobileHeader from '@/components/MobileHeader';

interface KajianWithId {
    id: number;
    masjid: string;
    city: string;
    date: string;
    waktu?: string;
    tema: string;
    pemateri: string;
    imageUrl?: string;
    attendanceCount?: number;
    lat?: number;
    lng?: number;
    distance?: number;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

interface HomeContentProps {
    initialLayout: any;
    initialQuickMenu: any[] | null;
}

export default function HomeContent({ initialLayout, initialQuickMenu }: HomeContentProps) {
    const [featuredKajian, setFeaturedKajian] = useState<KajianWithId[]>([]);
    const [latestKajian, setLatestKajian] = useState<KajianWithId[]>([]);
    // Use "distance" as default if mostly local app, or "date". 
    // Let's keep "date" as existing default or switch if user wants nearby.
    const [sortMode, setSortMode] = useState<'date' | 'distance'>('date');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize with server-provided props to avoid flash
    const [layout, setLayout] = useState(initialLayout);

    // NOTE: We might not need state for quickMenuItems if it never changes on client without refresh,
    // but keeping it consistent with previous logic.
    // Actually previous logic filtered items based on layout.hidden_menu.
    // We should do that filtering here too.
    const [quickMenuItems, setQuickMenuItems] = useState<any[] | null>(null);

    useEffect(() => {
        // Apply filtering logic identical to previous useEffect
        if (initialQuickMenu && Array.isArray(initialQuickMenu)) {
            const hiddenMenuIds = layout.hidden_menu || [];
            const visibleMenuItems = initialQuickMenu.filter(
                (item: any) => !hiddenMenuIds.includes(item.id)
            );
            setQuickMenuItems(visibleMenuItems.length > 0 ? visibleMenuItems : null);
        } else {
            setQuickMenuItems(null);
        }
    }, [initialQuickMenu, layout.hidden_menu]);


    const fetchData = async () => {
        try {
            const res = await fetch('/api/kajian');
            const data = await res.json();

            if (Array.isArray(data)) {
                // 1. Set Latest Input Kajian (API returns ORDER BY id DESC by default)
                setLatestKajian(data.slice(0, 5));

                // 2. Filter & Sort for "Featured" (Upcoming events)
                const upcoming = data.map((k: any) => {
                    const d = parseIndoDate(k.date);
                    if (d && k.waktu) {
                        // Try to add hours/minutes for better sorting
                        const timeMatch = k.waktu.match(/(\d{1,2})[:.](\d{2})/);
                        if (timeMatch) {
                            d.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
                        } else if (k.waktu.toLowerCase().includes('maghrib')) {
                            d.setHours(18, 15);
                        } else if (k.waktu.toLowerCase().includes('isya')) {
                            d.setHours(19, 30);
                        } else if (k.waktu.toLowerCase().includes('subuh') || k.waktu.toLowerCase().includes('shubuh')) {
                            d.setHours(4, 45);
                        }
                    }
                    return {
                        ...k,
                        _parsedDate: getKajianStatus(k.date, k.waktu) === 'PAST' ? null : d
                    };
                }).filter((k: any) => k._parsedDate !== null);

                // Try to sort by location if available
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userLat = position.coords.latitude;
                            const userLng = position.coords.longitude;

                            const withDistance = upcoming.map((k: any) => {
                                let distance = 9999999;
                                if (k.lat && k.lng) {
                                    distance = getDistanceFromLatLonInKm(userLat, userLng, k.lat, k.lng);
                                }
                                return { ...k, distance };
                            });

                            withDistance.sort((a: any, b: any) => {
                                // 1. Sort by Day primarily
                                const dateA = new Date(a._parsedDate).setHours(0, 0, 0, 0);
                                const dateB = new Date(b._parsedDate).setHours(0, 0, 0, 0);
                                if (dateA !== dateB) return dateA - dateB;

                                // 2. Within same day, sort by distance
                                return a.distance - b.distance;
                            });
                            setFeaturedKajian(withDistance);
                            setSortMode('distance');
                        },
                        (error) => {
                            // Create fallback sort by date
                            upcoming.sort((a: any, b: any) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));
                            setFeaturedKajian(upcoming);
                        }
                    );
                } else {
                    upcoming.sort((a: any, b: any) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));
                    setFeaturedKajian(upcoming);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        await fetchData();
    };

    const widgetData = {
        featuredKajian,
        latestKajian,
        sortMode,
        quickMenuItems
    };

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="min-h-screen bg-slate-50 pb-20 relative overflow-x-hidden">

                {/* Mobile Header */}
                <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

                {/* Mobile Sidebar / Drawer */}
                <div className={`fixed inset-0 z-[100] bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
                    <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`} onClick={e => e.stopPropagation()}>
                        <div className="p-6 bg-teal-600 text-white shrink-0">
                            <h2 className="font-bold text-xl mb-1">Menu</h2>
                            <p className="text-teal-100 text-xs">PortalKajian.online</p>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            {/* Render Mobile Items from Widget Config if possible, else default */}
                            {/* Using SidebarMenuWidget for consistent mobile menu */}
                            <SidebarMenuWidget />
                        </div>
                    </div>
                </div>


                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="md:grid md:grid-cols-12 md:gap-8">

                        {/* Left Column (Desktop Sidebar) */}
                        <aside className="md:col-span-4 space-y-6 hidden md:block">
                            <WidgetRenderer widgetIds={layout.sidebar} data={widgetData} />
                        </aside>

                        {/* Right Column (Main Content) */}
                        <div className="md:col-span-8 space-y-6">
                            <WidgetRenderer widgetIds={layout.main} data={widgetData} />
                        </div>

                    </div>
                </main>
            </div>
        </PullToRefresh>
    );
}
