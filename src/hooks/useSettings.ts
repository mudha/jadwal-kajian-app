'use client';

import { useState, useEffect } from 'react';

interface UserLocation {
    lat: number;
    lng: number;
    timestamp: number;
    address?: string;
}

interface AppSettings {
    radius: number;
    userLocation: UserLocation | null;
    notifications: {
        adzan: boolean;
        kajian: boolean;
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    radius: 15,
    userLocation: null,
    notifications: {
        adzan: true,
        kajian: true,
    },
};

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('app-settings');
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever settings change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('app-settings', JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    const updateRadius = (radius: number) => {
        setSettings(prev => ({ ...prev, radius }));
    };

    const updateLocation = (location: UserLocation) => {
        setSettings(prev => ({ ...prev, userLocation: location }));
    };

    const toggleNotification = (type: 'adzan' | 'kajian') => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
    };

    // Helper to trigger geolocation update
    const refreshLocation = async (): Promise<boolean> => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung browser ini');
            return false;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;

                    // Optional: Reverse geocoding to get address name
                    let address = '';
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        address = data.display_name?.split(',')[0] || 'Lokasi Terkini';
                    } catch (e) {
                        address = 'Lokasi Terkini';
                    }

                    updateLocation({
                        lat: latitude,
                        lng: longitude,
                        timestamp: Date.now(),
                        address
                    });
                    resolve(true);
                },
                (err) => {
                    console.error('Geo error', err);
                    alert('Gagal mengambil lokasi. Pastikan GPS aktif.');
                    resolve(false);
                }
            );
        });
    };

    return {
        settings,
        isLoaded,
        updateRadius,
        updateLocation,
        refreshLocation,
        toggleNotification
    };
}
