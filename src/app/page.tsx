'use client';
import { useEffect, useState } from 'react';
import { Search, User, Clock, MapPin } from 'lucide-react';
import PrayerTimeWidget from '@/components/PrayerTimeWidget';
import KajianCard from '@/components/KajianCard';
import MenuGrid from '@/components/MenuGrid';
import Link from 'next/link';

import { getKajianStatus, parseIndoDate } from '@/lib/date-utils';

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
  const [sortMode, setSortMode] = useState<'date' | 'distance'>('date');

  useEffect(() => {
    // Fetch featured kajian
    fetch('/api/kajian')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter: Only Today, Tomorrow, Upcoming
          // status 'PAST' is excluded.
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
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      {/* Header (Mobile Only) */}
      <header className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/80">Assalamu'alaikum</p>
            <p className="font-bold">Hamba Allah</p>
          </div>
        </div>
        <Link href="/kajian" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Search className="w-6 h-6" />
        </Link>
      </header>

      <div className="px-4 py-6 md:py-8 md:px-0 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">

        {/* Left Column (Desktop) / Top Section (Mobile) */}
        <div className="md:col-span-8 space-y-6">
          {/* Hero Section on Desktop */}
          <div className="hidden md:block bg-teal-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Selamat Datang di Jadwal Kajian Sunnah App</h1>
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
              <div className="flex md:hidden overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {featuredKajian.map((kajian) => (
                  <KajianCard
                    key={kajian.id}
                    id={kajian.id}
                    date={`${kajian.date} - Jam ${kajian.date.includes('Hari Ini') ? '09:30' : ''}`}
                    location={kajian.distance && kajian.distance < 1000
                      ? `${kajian.masjid} • ${kajian.distance.toFixed(1)} km`
                      : `${kajian.masjid} • ${kajian.city}`}
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
                        {kajian.masjid}, {kajian.city}
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
          {/* Prayer Time Widget */}
          <PrayerTimeWidget />

          {/* LIVE / TODAY KAJIAN WIDGET */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <h3 className="font-bold text-xl text-white">Kajian Hari Ini</h3>
                <p className="text-teal-100 text-xs opacity-80">Jadwal kajian sunnah pilihan</p>
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-teal-700"></span>
              </span>
            </div>

            <div className="space-y-4 relative z-10">
              {featuredKajian
                .slice(0, 5) // Show top 5
                .map(k => (
                  <Link href={`/kajian/${k.id}`} key={k.id} className="block group">
                    <div className="flex gap-3 items-start p-2 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shrink-0 overflow-hidden relative border border-white/10">
                        {k.imageUrl ? (
                          <img src={k.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-teal-100">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                        {k.date.includes('Hari Ini') && (
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-teal-800 translate-x-0.5 -translate-y-0.5 shadow-sm"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-200 mb-0.5 flex flex-wrap items-center gap-1 leading-tight">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{k.waktu ? (k.waktu.trim().match(/^\d/) ? k.waktu.split(' ')[0] : k.waktu) : 'Jadwal'} • {k.city === 'Online' ? 'ONLINE' : k.city}</span>
                        </p>
                        <p className="text-xs font-bold text-white leading-tight line-clamp-2 group-hover:text-teal-200 transition-colors">{k.tema}</p>
                        <p className="text-[10px] text-teal-100/70 mt-0.5 truncate">{k.pemateri}</p>
                      </div>
                    </div>
                  </Link>
                ))
              }
              {featuredKajian.length === 0 && (
                <div className="text-center py-6 text-teal-100/60 text-xs italic bg-white/5 rounded-xl border border-white/5">
                  Belum ada info kajian untuk hari ini.
                </div>
              )}
              <Link href="/kajian?mode=today" className="block text-center text-xs font-bold text-white/90 hover:text-white hover:bg-white/10 py-2 rounded-lg transition-all mt-2">
                Lihat Semua Jadwal Hari Ini →
              </Link>
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
