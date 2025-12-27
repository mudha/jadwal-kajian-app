'use client';
import { useEffect, useState } from 'react';
import { Search, User, Clock, MapPin, HandHeart } from 'lucide-react';
import PrayerTimeWidget from '@/components/PrayerTimeWidget';
import KajianCard from '@/components/KajianCard';
import MenuGrid from '@/components/MenuGrid';
import OngoingKajianWidget from '@/components/OngoingKajianWidget';
import Link from 'next/link';

import { getKajianStatus, parseIndoDate, formatMasjidName } from '@/lib/date-utils';

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

export default function BerandaPage() {
  const [featuredKajian, setFeaturedKajian] = useState<KajianWithId[]>([]);
  const [latestKajian, setLatestKajian] = useState<KajianWithId[]>([]);
  const [sortMode, setSortMode] = useState<'date' | 'distance'>('date');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch featured kajian
    fetch('/api/kajian')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // 1. Set Latest Input Kajian (API returns ORDER BY id DESC by default)
          setLatestKajian(data.slice(0, 5));

          // 2. Filter & Sort for "Featured" (Upcoming events)
          // Filter: Only Future events
          const upcoming = data.map((k: any) => ({
            ...k,
            _parsedDate: getKajianStatus(k.date, k.waktu) === 'PAST' ? null : parseIndoDate(k.date)
          })).filter((k: any) => k._parsedDate !== null);

          // Try to sort by location if available
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const sortedByDistance = upcoming.map((k: any) => {
                  let distance = 9999999; // Default infinite distance
                  if (k.lat && k.lng) {
                    distance = getDistanceFromLatLonInKm(userLat, userLng, k.lat, k.lng);
                  }
                  return { ...k, distance };
                }).sort((a: any, b: any) => {
                  // Primary Sort: Distance
                  if (Math.abs(a.distance - b.distance) > 0.1) {
                    return a.distance - b.distance;
                  }
                  // Secondary Sort: Date
                  return (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0);
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
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 relative overflow-x-hidden">
      {/* Mobile Sidebar / Drawer */}
      <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}>
        <div className={`absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="p-6 bg-teal-600 text-white">
            <h2 className="font-bold text-xl mb-1">Menu</h2>
            <p className="text-teal-100 text-xs">PortalKajian.online</p>
          </div>
          <div className="p-4 space-y-2">
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <MapPin className="w-4 h-4" />
              </div>
              Beranda
            </Link>
            <Link href="/kajian" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Search className="w-4 h-4" />
              </div>
              Cari Kajian
            </Link>
            <Link href="/favorit" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl font-medium">
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                <HandHeart className="w-4 h-4" />
              </div>
              Favorit Saya
            </Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium text-sm">
              Login Admin
            </Link>
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
            <p className="text-[10px] text-teal-100 uppercase tracking-widest font-medium">Sunnah Indonesia</p>
          </div>
        </div>
        <Link href="/notifikasi" className="p-2 relative hover:bg-white/10 rounded-full transition-colors">
          <div className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-teal-600"></div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </Link>
      </header>

      <div className="px-4 py-6 md:py-8 md:px-0 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">

        {/* Left Column (Desktop) / Top Section (Mobile) */}
        <div className="md:col-span-8 space-y-6">
          {/* Hero Section on Desktop */}
          <div className="hidden md:block bg-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Selamat Datang di PortalKajian.online</h1>
              <p className="text-teal-100 max-w-lg mb-6">Temukan jadwal kajian sunnah terdekat, artikel islami, dan fitur ibadah lainnya dalam satu aplikasi.</p>
              <Link href="/kajian" className="inline-block bg-white text-teal-600 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors">
                Cari Kajian Sekarang
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10">
              <Search className="w-64 h-64 -mb-12 -mr-12" />
            </div>
          </div>

          {/* Featured Kajian Cards */}
          {featuredKajian.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="font-bold text-lg text-slate-800">
                  {sortMode === 'distance' ? 'Kajian Pilihan Terdekat' : 'Kajian Pilihan'}
                </h2>
                <Link href="/kajian" className="text-sm text-teal-600 font-medium hover:text-teal-700">Lihat Semua</Link>
              </div>

              {/* Mobile: Horizontal Scroll */}
              <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-4 px-4">
                {featuredKajian.map((kajian) => (
                  <KajianCard
                    key={kajian.id}
                    id={kajian.id}
                    date={`${kajian.date} - Jam ${kajian.date.includes('Hari Ini') ? '09:30' : ''}`}
                    location={kajian.distance && kajian.distance < 1000
                      ? `${formatMasjidName(kajian.masjid)} • ${kajian.distance.toFixed(1)} km`
                      : `${formatMasjidName(kajian.masjid)} • ${kajian.city}`}
                    title={kajian.tema}
                    ustadz={kajian.pemateri}
                    imageUrl={kajian.imageUrl}
                    attendanceCount={kajian.attendanceCount}
                  />
                ))}
              </div>

              {/* Desktop: Grid View */}
              <div className="hidden md:grid grid-cols-2 gap-6">
                {featuredKajian.map((kajian) => (
                  <Link href={`/kajian/${kajian.id}`} key={kajian.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-4 block">
                    <div className="w-24 h-24 bg-slate-200 rounded-xl shrink-0 overflow-hidden">
                      <img src={kajian.imageUrl || '/images/default-kajian.png'} alt={kajian.tema} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-600 mb-1">{kajian.date}</p>
                      <h3 className="font-bold text-slate-900 line-clamp-2 mb-1">{kajian.tema}</h3>
                      <p className="text-xs text-slate-500 mb-2">{kajian.pemateri}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {formatMasjidName(kajian.masjid)}, {kajian.city}
                        {kajian.distance && kajian.distance < 1000 && (
                          <span className="flex items-center gap-0.5 text-teal-600 font-bold ml-1 bg-teal-50 px-1.5 py-0.5 rounded-md">
                            <MapPin className="w-2.5 h-2.5" /> {kajian.distance.toFixed(1)} km
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column (Desktop) / Bottom Section (Mobile) */}
        <div className="md:col-span-4 space-y-6">
          {/* Ongoing Kajian Widget */}
          <OngoingKajianWidget />

          {/* Prayer Time Widget */}
          <PrayerTimeWidget />

          {/* NEW: LATEST / RECENTLY ADDED KAJIAN WIDGET */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <h3 className="font-bold text-xl text-white">Info Kajian Terbaru</h3>
                <p className="text-teal-100 text-xs opacity-80">Baru saja diupdate admin</p>
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-700"></span>
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {latestKajian.map((k) => (
                <Link href={`/kajian/${k.id}`} key={k.id} className="block group">
                  <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-12 h-16 bg-white/20 backdrop-blur-sm rounded-lg shrink-0 overflow-hidden relative border border-white/10">
                      {k.imageUrl ? (
                        <img src={k.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-100">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-br-lg">NEW</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-0.5 flex flex-wrap items-center gap-1 leading-tight">
                        {k.city === 'Online' ? 'ONLINE' : k.city}
                      </p>
                      <p className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-teal-200 transition-colors mb-0.5">{k.tema}</p>
                      <p className="text-[9px] text-teal-100/70 truncate mb-1">Oleh: {k.pemateri}</p>
                      <p className="text-[9px] text-white/50 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {k.date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
              }
              {latestKajian.length === 0 && (
                <div className="text-center py-6 text-teal-100/60 text-xs italic bg-white/5 rounded-xl border border-white/5">
                  Belum ada data terbaru.
                </div>
              )}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Menu Utama</h3>
            <MenuGrid />
          </div>
        </div>

      </div>
    </div>
  );
}
