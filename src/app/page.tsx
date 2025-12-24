'use client';
import { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import PrayerTimeWidget from '@/components/PrayerTimeWidget';
import KajianCard from '@/components/KajianCard';
import MenuGrid from '@/components/MenuGrid';
import Link from 'next/link';

interface KajianWithId {
  id: number;
  masjid: string;
  city: string;
  date: string;
  tema: string;
  pemateri: string;
  imageUrl?: string;
}

export default function BerandaPage() {
  const [featuredKajian, setFeaturedKajian] = useState<KajianWithId[]>([]);

  useEffect(() => {
    // Fetch featured kajian (latest 5)
    fetch('/api/kajian')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedKajian(data.slice(0, 5));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-teal-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/80">Assalamu'alaikum</p>
            <p className="font-bold">Hanif</p>
          </div>
        </div>
        <Link href="/kajian" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Search className="w-6 h-6" />
        </Link>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Featured Kajian Cards */}
        {featuredKajian.length > 0 && (
          <section>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {featuredKajian.map((kajian) => (
                <KajianCard
                  key={kajian.id}
                  date={`${kajian.date} - Jam ${kajian.date.includes('Hari Ini') ? '09:30' : ''}`}
                  location={`${kajian.masjid} - Kota ${kajian.city}`}
                  title={kajian.tema}
                  ustadz={kajian.pemateri}
                  imageUrl={kajian.imageUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* Prayer Time Widget */}
        <PrayerTimeWidget />

        {/* Kitab Referensi Banner */}
        <Link
          href="#"
          className="block bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">Kitab Referensi Belajar Islam</p>
              <p className="text-sm text-white/90">Pelajari lebih lanjut</p>
            </div>
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors">
              Klik di sini
            </button>
          </div>
        </Link>

        {/* Menu Grid */}
        <MenuGrid />
      </div>
    </div>
  );
}
