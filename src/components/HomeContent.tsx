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
import { useSettings } from '@/hooks/useSettings';

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
    is_recurring_instance?: boolean;
    isOnline?: boolean;
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
    const { settings, isLoaded, refreshLocation } = useSettings();
    const [allKajian, setAllKajian] = useState<KajianWithId[]>([]);

    // Derived state
    const [featuredKajian, setFeaturedKajian] = useState<KajianWithId[]>([]);
    const [latestKajian, setLatestKajian] = useState<KajianWithId[]>([]);
    const [sortMode, setSortMode] = useState<'date' | 'distance'>('date');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initialize with server-provided props to avoid flash
    const [layout, setLayout] = useState(initialLayout);
    const [stats, setStats] = useState({ todayCount: 0 });

    const [quickMenuItems, setQuickMenuItems] = useState<any[] | null>(null);

    // Initial Location Check on Mount
    useEffect(() => {
        if (isLoaded && !settings.userLocation) {
            refreshLocation(); // Ask for location if not set yet
        }
    }, [isLoaded, settings.userLocation, refreshLocation]);

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
                setAllKajian(data);

                // Filter out recurring instances for "Latest Info" to prevent flooding
                const nonRecurring = data.filter((k: any) => !k.is_recurring_instance);
                setLatestKajian(nonRecurring.slice(0, 5));

                // Calculate basic stats immediately
                const todayCount = data.filter((k: any) => getKajianStatus(k.date, k.waktu) === 'TODAY').length;
                setStats({ todayCount });
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
        await refreshLocation();
    };

    // Main Processing Effect: Runs when Data or Settings Change
    useEffect(() => {
        if (allKajian.length === 0) return;

        // 1. Parse Dates & Pre-process
        const upcoming = allKajian.map((k: any) => {
            const d = parseIndoDate(k.date);
            if (d && k.waktu) {
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
        }).filter((k: any) => {
            if (k._parsedDate === null) return false;

            // Filter specific strategy for recurring kajian:
            // Only show recurring instances if they occur within the next 6 days.
            // Non-recurring (one-time) events are always shown regardless of how far in the future.
            if (k.is_recurring_instance) {
                const now = new Date();
                const diffTime = k._parsedDate.getTime() - now.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                return diffDays <= 6;
            }

            return true;
        });

        // 2. Sort Logic
        if (settings.userLocation) {
            const userLat = settings.userLocation.lat;
            const userLng = settings.userLocation.lng;

            const withDistance = upcoming.map((k: any) => {
                let distance = 9999999;
                if (k.lat && k.lng) {
                    distance = getDistanceFromLatLonInKm(userLat, userLng, k.lat, k.lng);
                }
                return { ...k, distance };
            });

            // Filter by radius (but always include online kajian)
            const withinRadius = withDistance.filter((k: any) => k.isOnline || k.distance <= settings.radius);

            withinRadius.sort((a: any, b: any) => {
                const dateA = new Date(a._parsedDate);
                const dateB = new Date(b._parsedDate);

                // Primary sort: by time (earliest first)
                const timeDiff = dateA.getTime() - dateB.getTime();

                // If times are very close (within 1 hour), use distance as tiebreaker
                // Treat online kajian as distance = 0 for tiebreaker purposes
                if (Math.abs(timeDiff) < 3600000) {
                    const distA = a.isOnline ? 0 : a.distance;
                    const distB = b.isOnline ? 0 : b.distance;
                    return distA - distB;
                }

                return timeDiff;
            });

            setFeaturedKajian(withinRadius);
            setSortMode('distance');
        } else {
            // Fallback Sort by Date
            upcoming.sort((a: any, b: any) => {
                const timeA = a._parsedDate?.getTime() || 0;
                const timeB = b._parsedDate?.getTime() || 0;
                return timeA - timeB;
            });
            setFeaturedKajian(upcoming);
            setSortMode('date');
        }

    }, [allKajian, settings.userLocation, settings.radius]);

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
                            {/* Mobile Only Contributor Banner */}
                            <Link
                                href="/register/contributor"
                                className="block md:hidden bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white hover:opacity-95 transition-opacity shadow-lg"
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

                            <WidgetRenderer widgetIds={layout.main} data={widgetData} />
                        </div>

                    </div>
                </main>
            </div>
        </PullToRefresh>
    );
}
