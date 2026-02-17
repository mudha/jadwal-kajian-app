'use client';

import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    [key: string]: string;
}

interface PrayerState {
    timings: PrayerTimes | null;
    nextPrayer: { name: string; time: string } | null;
    timeLeft: string;
    locationName: string;
    loading: boolean;
    error: string | null;
}

export function usePrayerTimes() {
    const { settings } = useSettings();
    const [state, setState] = useState<PrayerState>({
        timings: null,
        nextPrayer: null,
        timeLeft: '--:--:--',
        locationName: 'Menunggu lokasi...',
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchPrayerTimes = async () => {
            // Use settings location if available, otherwise default/wait
            if (!settings.userLocation) {
                // If no location yet settings provider might be loading or user denied
                // We can wait or show default.
                // Let's rely on settings.userLocation updates.
                // But for initial load if settings is null, we might want to default to Jakarta?
                // Or just show "Menunggu lokasi..."
                // Since HomeContent triggers refreshLocation on mount, this should populate soon.
                return;
            }

            const { lat, lng, address } = settings.userLocation;

            try {
                setState(prev => ({ ...prev, loading: true, error: null }));

                const date = new Date();
                const timestamp = Math.floor(date.getTime() / 1000);
                // Method 20: Kemenag RI
                const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=20`);
                const data = await res.json();

                if (data.code === 200) {
                    const timings = data.data.timings;
                    setState(s => ({
                        ...s,
                        timings: timings,
                        locationName: address || 'Lokasi Terkini',
                        loading: false
                    }));
                } else {
                    throw new Error('Gagal mengambil data jadwal sholat');
                }
            } catch (err) {
                setState(s => ({ ...s, error: 'Gagal memuat jadwal', loading: false }));
            }
        };

        fetchPrayerTimes();
    }, [settings.userLocation]);

    // Timer logic for countdown
    useEffect(() => {
        if (!state.timings) return;

        const interval = setInterval(() => {
            const now = new Date();
            const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const displayNames: { [key: string]: string } = { 'Fajr': 'Subuh', 'Dhuhr': 'Dzuhur', 'Asr': 'Ashar', 'Maghrib': 'Maghrib', 'Isha': 'Isya' };

            let upcomingPrayer = null;
            let minDiff = Infinity;

            // Find next prayer
            for (const name of prayerNames) {
                const timeStr = state.timings![name];
                if (!timeStr) continue;

                const [hours, minutes] = timeStr.split(':').map(Number);
                const prayerDate = new Date();
                prayerDate.setHours(hours, minutes, 0, 0);

                let diff = prayerDate.getTime() - now.getTime();

                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    upcomingPrayer = {
                        name: displayNames[name],
                        time: timeStr
                    };
                }
            }

            // If no upcoming prayer today (after Isya), next is Fajr tomorrow
            if (!upcomingPrayer) {
                const fajrTime = state.timings!['Fajr'];
                const [fHours, fMinutes] = fajrTime.split(':').map(Number);

                const tomorrowFajr = new Date();
                tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
                tomorrowFajr.setHours(fHours, fMinutes, 0, 0);

                minDiff = tomorrowFajr.getTime() - now.getTime();

                upcomingPrayer = { name: 'Subuh', time: fajrTime };
            }

            // Calculate countdown string
            if (minDiff !== Infinity) {
                const hours = Math.floor((minDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((minDiff % (1000 * 60)) / 1000);

                setState(s => ({
                    ...s,
                    nextPrayer: upcomingPrayer,
                    timeLeft: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                }));
            }

        }, 1000);

        return () => clearInterval(interval);
    }, [state.timings]);

    return state;
}
