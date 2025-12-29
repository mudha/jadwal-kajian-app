'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import PullToRefresh from '@/components/PullToRefresh';
import QuickMenu from '@/components/QuickMenu';
import Link from 'next/link';
import { getKajianStatus, parseIndoDate } from '@/lib/date-utils';
import WidgetRenderer from '@/components/WidgetRenderer';
import SidebarMenuWidget from '@/components/widgets/SidebarMenuWidget';

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

const DEFAULT_LAYOUT = {
  sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'PrayerTimesWidget', 'ContactWidget'],
  main: ['HeroWidget', 'QuickMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'KajianListWidget'],
  mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
  hidden: [],
  hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile']
};

export default function BerandaPage() {
  const [featuredKajian, setFeaturedKajian] = useState<KajianWithId[]>([]);
  const [latestKajian, setLatestKajian] = useState<KajianWithId[]>([]);
  const [sortMode, setSortMode] = useState<'date' | 'distance'>('date');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [layoutLoading, setLayoutLoading] = useState(true); // Optimize flicker if needed

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

              // Sort logic: 
              // 1. If distance difference is small (< 5km), prioritize DATE (Chronological)
              // 2. Otherwise prioritize DISTANCE
              const sortedByDistance = [...withDistance].sort((a: any, b: any) => {
                const distDiff = a.distance - b.distance;
                const timeDiff = (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0);

                if (Math.abs(distDiff) < 5.0) {
                  return timeDiff || distDiff;
                }
                return distDiff || timeDiff;
              });

              setFeaturedKajian(sortedByDistance.slice(0, 25));
              setSortMode('distance');
            },
            (error) => {
              console.warn('Location access denied or error:', error);
              // Fallback: Sort by Date
              const sortedByDate = upcoming.sort((a: any, b: any) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));
              setFeaturedKajian(sortedByDate.slice(0, 25));
            },
            { timeout: 5000 }
          );
        } else {
          // Fallback: Sort by Date
          const sortedByDate = upcoming.sort((a: any, b: any) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));
          setFeaturedKajian(sortedByDate.slice(0, 25));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const [quickMenuItems, setQuickMenuItems] = useState(null);

  useEffect(() => {
    fetchData();
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      // Fetch Layout
      const layoutRes = await fetch('/api/settings/layout');
      const layoutData = await layoutRes.json();
      if (layoutData && (layoutData.sidebar || layoutData.main)) {
        const mobile = layoutData.mobile || DEFAULT_LAYOUT.mobile;
        const hidden_mobile = layoutData.hidden_mobile || DEFAULT_LAYOUT.hidden_mobile;

        // Ensure SidebarBrandWidget is present
        let sidebar = layoutData.sidebar || DEFAULT_LAYOUT.sidebar;
        if (Array.isArray(sidebar) && !sidebar.includes('SidebarBrandWidget')) {
          sidebar = ['SidebarBrandWidget', ...sidebar];
        }

        setLayout({ ...layoutData, sidebar, mobile, hidden_mobile });
      } else {
        // Force update default if no data found
        setLayout(DEFAULT_LAYOUT);
      }
      setLayoutLoading(false);

      // Fetch Quick Menu Settings
      const quickMenuRes = await fetch('/api/settings/quick-menu');
      const quickMenuData = await quickMenuRes.json();
      if (quickMenuData) setQuickMenuItems(quickMenuData);

    } catch (err) {
      console.error("Failed to load settings", err);
      setLayoutLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchData(),
      fetchLayout()
    ]);
  };



  const widgetData = {
    featuredKajian,
    latestKajian,
    sortMode,
    quickMenuItems
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 relative overflow-x-hidden">
      {/* Mobile Sidebar / Drawer */}
      <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
        <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`} onClick={e => e.stopPropagation()}>
          <div className="p-6 bg-teal-600 text-white shrink-0">
            <h2 className="font-bold text-xl mb-1">Menu</h2>
            <p className="text-teal-100 text-xs">PortalKajian.online</p>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {/* Sidebar Mobile is static for now or uses same widget? 
                Ideally mobile sidebar is mostly Menu. We can re-use SidebarMenuWidget.
            */}
            <SidebarMenuWidget />
          </div>
        </div>
      </div>


      {/* Header (Mobile Only) */}
      <header className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between md:hidden sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-lg leading-tight">PortalKajian.online</h1>
            <p className="text-[10px] text-teal-100 uppercase tracking-widest font-medium">Jadwal Kajian Sunnah</p>
          </div>
        </div>
        <Link href="/notifikasi" className="p-2 relative hover:bg-white/10 rounded-full transition-colors">
          <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-teal-600"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </Link>
      </header>
      <PullToRefresh onRefresh={handleRefresh}>
        {/* Quick Menu - Mobile Only */}


        <div className="px-4 py-6 md:py-8 md:px-0 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">

          {/* Left Column (Desktop) - Sidebar & Widgets */}
          <div className="hidden md:block md:col-span-4 space-y-6 order-1">
            <WidgetRenderer widgetIds={layout.sidebar} data={widgetData} />
          </div>

          {/* Right Column (Desktop) - Main Content */}
          {/* Right Column (Desktop) - Main Content */}
          <div className="md:col-span-8 space-y-6 order-2">

            {/* Desktop Main */}
            <div className="hidden md:block space-y-6">
              <WidgetRenderer widgetIds={layout.main || DEFAULT_LAYOUT.main} data={widgetData} />
            </div>

            {/* Mobile Main */}
            <div className="md:hidden space-y-6">
              <WidgetRenderer widgetIds={layout.mobile || DEFAULT_LAYOUT.mobile} data={widgetData} />
            </div>

          </div>
        </div>
      </PullToRefresh>
    </div>
  );
}
