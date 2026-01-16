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
    const [radius, setRadius] = useState(50); // Default radius 50km
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize with server-provided props to avoid flash
    const [layout, setLayout] = useState(initialLayout);
    const [stats, setStats] = useState({ todayCount: 0 });

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
                        } else if (k.waktu.toLowerCase().includes('ashar') || k.waktu.toLowerCase().includes('asar')) {
                            d.setHours(15, 45);
                        } else if (k.waktu.toLowerCase().includes('dhuhur') || k.waktu.toLowerCase().includes('dzuhur') || k.waktu.toLowerCase().includes('zuhur')) {
                            d.setHours(12, 15);
                        } else if (k.waktu.toLowerCase().includes('subuh') || k.waktu.toLowerCase().includes('shubuh')) {
                            d.setHours(4, 45);
                        } else if (k.waktu.toLowerCase().includes('jumat') || k.waktu.toLowerCase().includes("jum'at") || k.waktu.toLowerCase().includes('khutbah')) {
                            d.setHours(12, 0);
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

                            // Filter by radius (only show kajian within radius)
                            const withinRadius = withDistance.filter((k: any) => k.distance <= radius);

                            withinRadius.sort((a: any, b: any) => {
                                // Get dates
                                const now = new Date();
                                const dateA = new Date(a._parsedDate);
                                const dateB = new Date(b._parsedDate);

                                // Check if kajian is today
                                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                const todayEnd = new Date(todayStart);
                                todayEnd.setDate(todayEnd.getDate() + 1);

                                const isAToday = dateA >= todayStart && dateA < todayEnd;
                                const isBToday = dateB >= todayStart && dateB < todayEnd;

                                // Prioritize TODAY kajian first
                                if (isAToday && !isBToday) return -1;
                                if (!isAToday && isBToday) return 1;

                                // Both today OR both not today - use weighted scoring
                                const hoursUntilA = (dateA.getTime() - now.getTime()) / (1000 * 60 * 60);
                                const hoursUntilB = (dateB.getTime() - now.getTime()) / (1000 * 60 * 60);

                                // Normalize distance (0-1 range, assuming max 50km)
                                const normalizedDistanceA = Math.min(a.distance / 50, 1);
                                const normalizedDistanceB = Math.min(b.distance / 50, 1);

                                // Normalize time (0-1 range, assuming max 168 hours = 7 days)
                                const normalizedTimeA = Math.min(Math.max(hoursUntilA, 0) / 168, 1);
                                const normalizedTimeB = Math.min(Math.max(hoursUntilB, 0) / 168, 1);

                                // Weighted score: 60% time + 40% distance
                                // Lower score = better (sooner + closer)
                                const scoreA = (normalizedTimeA * 0.6) + (normalizedDistanceA * 0.4);
                                const scoreB = (normalizedTimeB * 0.6) + (normalizedDistanceB * 0.4);

                                return scoreA - scoreB;
                            });

                            // Calculate Stats
                            const todayCount = data.filter((k: any) => getKajianStatus(k.date, k.waktu) === 'TODAY').length;
                            setStats({ todayCount });

                            setFeaturedKajian(withinRadius);
                            setSortMode('distance');
                        },
                        (error) => {
                            // Create fallback sort by date + time
                            upcoming.sort((a: any, b: any) => {
                                const timeA = a._parsedDate?.getTime() || 0;
                                const timeB = b._parsedDate?.getTime() || 0;
                                return timeA - timeB;
                            });

                            // Calculate Stats (Fallback)
                            const todayCount = data.filter((k: any) => getKajianStatus(k.date, k.waktu) === 'TODAY').length;
                            setStats({ todayCount });

                            setFeaturedKajian(upcoming);
                        }
                    );
                } else {
                    upcoming.sort((a: any, b: any) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));

                    // Calculate Stats (No Geo)
                    const todayCount = data.filter((k: any) => getKajianStatus(k.date, k.waktu) === 'TODAY').length;
                    setStats({ todayCount });

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
        quickMenuItems,
        stats
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

                            {/* Contributor Recruitment Banner */}
                            <Link
                                href="/register/contributor"
                                className="block bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white hover:opacity-95 transition-opacity shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-lg">Jadi Kontributor</p>
                                        <p className="text-sm text-white/90">Bantu update kajian di daerahmu!</p>
                                    </div>
                                    <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
                                        Daftar
                                    </button>
                                </div>
                            </Link>
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
