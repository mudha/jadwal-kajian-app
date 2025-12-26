'use client';

import { useState, useEffect } from 'react';

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
    const [state, setState] = useState<PrayerState>({
        timings: null,
        nextPrayer: null,
        timeLeft: '--:--:--',
        locationName: 'Mendeteksi lokasi...',
        loading: true,
        error: null,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, error: 'Geolocation tidak didukung browser ini', loading: false }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Fetch from Aladhan API
                    const date = new Date();
                    const timestamp = Math.floor(date.getTime() / 1000);
                    // Use method 20 (Kemenag RI) or 11 (Majlis Ugama Islam Singapura) usually good for ID
                    const res = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=20`);
                    const data = await res.json();

                    if (data.code === 200) {
                        const timings = data.data.timings;
                        const meta = data.data.meta;

                        setState(s => ({
                            ...s,
                            timings: timings,
                            locationName: meta.timezone, // Simplification, usually returns Asia/Jakarta
                            loading: false
                        }));
                    } else {
                        throw new Error('Gagal mengambil data jadwal sholat');
                    }
                } catch (err) {
                    setState(s => ({ ...s, error: 'Gagal memuat jadwal', loading: false }));
                }
            },
            (err) => {
                // Default to Jakarta if denied
                setState(s => ({ ...s, error: 'Izin lokasi ditolak, menggunakan default (Jakarta)', locationName: 'Jakarta (Default)', loading: false }));
                // Ideally fetch Jakarta times here as fallback
            }
        );
    }, []);

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

                // If diff < 0, it means prayer passed today. Check if it's the *next* day's Fajr?
                // Simple logic: find strict positive diff first
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
