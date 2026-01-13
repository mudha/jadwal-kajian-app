'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { KajianEntry, parseKajianBroadcast, splitPemateri, splitWaktu } from '@/lib/parser';
import { parseWithGemini } from '@/lib/ai-parser';
import { Clipboard, Save, Play, CheckCircle, AlertCircle, FileText, Calendar, Clock, MapPin, LogOut, LayoutDashboard, ExternalLink, Database, PlusCircle, History, Info, Trash2, Image as ImageIcon, Loader2, Upload, X, Sparkles, Eye } from 'lucide-react';
import { geocodeAddress, extractCoordsFromUrl } from '@/lib/geocoding';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Tesseract from 'tesseract.js';
import { indonesianCities } from '@/data/cities';
import { parseIndoDate, formatIndoDate, formatYYYYMMDD, formatMasjidName } from '@/lib/date-utils';
import AutosuggestInput from '@/components/admin/AutosuggestInput';
import AIInputSection from '@/components/admin/AIInputSection';
import KajianCard from '@/components/KajianCard';
import './batch-input.css';
import ImageUpload from '@/components/ImageUpload';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import ProgressModal from '@/components/admin/ProgressModal';

function BatchInputPageContent() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [entries, setEntries] = useState<KajianEntry[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [message, setMessage] = useState('');
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);

    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    // State for managing which row has the city dropdown open
    const [activeCityDropdownIndex, setActiveCityDropdownIndex] = useState<number | null>(null);
    const [cityFilter, setCityFilter] = useState('');

    // State for managing which row has the waktu dropdown open
    const [activeWaktuDropdownIndex, setActiveWaktuDropdownIndex] = useState<number | null>(null);

    // Duplicate Check State
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateEntries, setDuplicateEntries] = useState<any[]>([]);
    const [pendingSaveEntries, setPendingSaveEntries] = useState<KajianEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [processingDuplicates, setProcessingDuplicates] = useState<Set<number>>(new Set());

    // Alert Modal State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Progress Modal State
    const [progressModal, setProgressModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        progress: 0,
        currentStep: 0,
        totalSteps: 0
    });

    const stopSignal = useRef(false);

    const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };

    // Common waktu suggestions for kajian
    const waktuSuggestions = [
        "Ba'da Shubuh - Selesai",
        "Ba'da Dhuhur - Selesai",
        "Ba'da Ashar - Selesai",
        "Ba'da Maghrib - Selesai",
        "Ba'da Isya - Selesai",
        "Shubuh - Selesai",
        "Dhuhur - Selesai",
        "Ashar - Selesai",
        "Maghrib - Selesai",
        "Isya - Selesai",
        "Sholat Jumat",
    ];

    // Stats and Recent Data
    const [stats, setStats] = useState({ total: 0, today: 0 });

    useEffect(() => {
        fetchStats();
    }, []);

    const searchParams = useSearchParams();
    const isManualMode = searchParams.get('mode') === 'manual';

    useEffect(() => {
        if (isManualMode && entries.length === 0) {
            handleAddManual();
        }
    }, [isManualMode]);

    // Global paste handler for images
    useEffect(() => {
        const handleGlobalPaste = async (e: ClipboardEvent) => {
            // Only handle if there are entries
            if (entries.length === 0) return;

            // Check if clipboard contains image
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    if (!file) continue;

                    // Upload to the last/active entry
                    const targetIndex = entries.length - 1;

                    try {
                        // Show loading toast
                        setMessage('Mengupload gambar dari clipboard...');

                        const formData = new FormData();
                        formData.append('file', file);

                        // Try Cloudinary first
                        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

                        let url = '';
                        if (cloudName && uploadPreset) {
                            formData.append('upload_preset', uploadPreset);
                            formData.append('folder', 'jadwal-kajian');

                            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.secure_url) {
                                url = data.secure_url;
                            }
                        } else {
                            // Fallback to local API
                            const res = await fetch('/api/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await res.json();
                            if (data.url) {
                                url = data.url;
                            }
                        }

                        if (url) {
                            updateEntry(targetIndex, 'imageUrl', url);
                            setMessage('✅ Gambar berhasil diupload!');
                        } else {
                            throw new Error('Upload gagal');
                        }
                    } catch (error) {
                        console.error('Global paste upload error:', error);
                        showAlert('Gagal', 'Gagal mengupload gambar dari clipboard', 'danger');
                    }

                    break;
                }
            }
        };

        document.addEventListener('paste', handleGlobalPaste);
        return () => document.removeEventListener('paste', handleGlobalPaste);
    }, [entries]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/kajian');
            const data = await res.json();

            if (Array.isArray(data)) {
                setStats({
                    total: data.length,
                    today: data.filter((k: any) => k.date?.toLowerCase().includes('hari ini')).length || 0
                });
            } else {
                console.error('Stats data is not an array:', data);
            }
        } catch (e) {
            console.error('Failed to fetch stats', e);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/login', { method: 'DELETE' });
        router.push('/login');
        router.refresh();
    };

    const handleImageUpload = async (file: File) => {
        setIsOcrLoading(true);
        setOcrProgress(0);
        try {
            // 1. Upload to Cloudinary (Unsigned Preset)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'jadwal_kajian_preset');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (cloudName) {
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.secure_url) {
                    setLastImageUrl(uploadData.secure_url);
                }
            }


            // 2. Tesseract OCR
            const result = await Tesseract.recognize(
                file,
                'ind+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );
            setInputText(prev => prev + (prev ? '\n\n' : '') + result.data.text);
            setMessage('Alhamdulillah, gambar berhasil diupload dan teks berhasil dibaca! Sekarang silakan klik "Ekstrak Jadwal".');
        } catch (e) {
            console.error(e);
            setMessage('Gagal memproses gambar. Pastikan format benar dan konfigurasi Cloudinary sesuai.');
        } finally {
            setIsOcrLoading(false);

        }
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) handleImageUpload(file);
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const handleProcess = async () => {
        try {
            // Use Regex pattern matching for extraction
            setIsGeocoding(true);
            setProgressModal({
                isOpen: true,
                title: 'Proses Ekstraksi',
                message: 'Sedang mengekstrak data dengan Regex...',
                progress: 10,
                currentStep: 0,
                totalSteps: 0
            });

            const parsed = parseKajianBroadcast(inputText);
            const enrichedEntries = parsed.map(entry => {
                const isFriday = entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || entry.tema === '';
                const defaultImg = isFriday ? '/images/khutbah-jumat-cover.png' : undefined;

                // Auto-split waktu and pemateri
                const waktuSplit = splitWaktu(entry.waktu);
                const pemateriSplit = splitPemateri(entry.pemateri);

                return {
                    ...entry,
                    ...waktuSplit,
                    ...pemateriSplit,
                    imageUrl: lastImageUrl || defaultImg
                };
            });
            setEntries(enrichedEntries);
            setSelectedIndices(new Set(enrichedEntries.map((_, i) => i)));
            setProgressModal({
                isOpen: true,
                title: 'Proses Ekstraksi',
                message: `Berhasil mengekstrak ${enrichedEntries.length} jadwal. Memulai pencarian koordinat lokasi...`,
                progress: 20,
                currentStep: 0,
                totalSteps: enrichedEntries.length
            });

            const withCoords = [...enrichedEntries];

            // 1. Geocoding
            for (let i = 0; i < withCoords.length; i++) {
                const entry = withCoords[i];
                const progress = 20 + ((i / withCoords.length) * 40);
                setProgressModal(prev => ({
                    ...prev,
                    progress,
                    currentStep: i + 1,
                    message: `Mencari koordinat lokasi... (${i + 1}/${withCoords.length})`
                }));

                // Prioritize Extraction from URL
                const urlCoords = extractCoordsFromUrl(entry.gmapsUrl);
                if (urlCoords) {
                    withCoords[i] = { ...entry, lat: urlCoords.lat, lng: urlCoords.lng };
                    setEntries([...withCoords]); // Live update UI
                    continue; // Skip geocoding
                }

                // If URL is short, resolve it
                if (entry.gmapsUrl && !entry.gmapsUrl.includes('google.com/maps') && !entry.gmapsUrl.includes('google.co.id/maps')) {
                    try {
                        const resolveRes = await fetch('/api/admin/resolve-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: entry.gmapsUrl })
                        });
                        const resolveData = await resolveRes.json();
                        if (resolveData.resolvedUrl) {
                            const resolvedCoords = extractCoordsFromUrl(resolveData.resolvedUrl);
                            if (resolvedCoords) {
                                withCoords[i] = {
                                    ...entry,
                                    lat: resolvedCoords.lat,
                                    lng: resolvedCoords.lng,
                                    gmapsUrl: resolveData.resolvedUrl // Update to full URL
                                };
                                setEntries([...withCoords]);
                                continue;
                            }
                        }
                    } catch (e) {
                        console.error('Error resolving URL:', e);
                    }
                }

                const coords = await geocodeAddress(entry.masjid, entry.address, entry.city);
                if (coords) {
                    // Generate Google Maps URL from coordinates ONLY if we don't have one
                    const gmapsUrl = entry.gmapsUrl || `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng, gmapsUrl };
                    setEntries([...withCoords]); // Live update UI
                }
            }

            // 2. Normalization (Matching AI settings)
            setProgressModal({
                isOpen: true,
                title: 'Proses Ekstraksi',
                message: 'Menormalisasi nama ustadz...',
                progress: 60,
                currentStep: 0,
                totalSteps: withCoords.length
            });
            const normalized = [...withCoords];

            for (let i = 0; i < normalized.length; i++) {
                const entry = normalized[i];
                const progress = 60 + ((i / normalized.length) * 35);
                setProgressModal(prev => ({
                    ...prev,
                    progress,
                    currentStep: i + 1,
                    message: `Menormalisasi nama... (${i + 1}/${normalized.length})`
                }));

                // Normalize ustadz name
                try {
                    const ustadzResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.pemateri, type: 'ustadz', threshold: 0.8 }),
                    });
                    const ustadzData = await ustadzResponse.json();

                    if (ustadzData.hasExactMatch || (ustadzData.suggestions && ustadzData.suggestions.length > 0)) {
                        const bestMatch = ustadzData.hasExactMatch
                            ? ustadzData.canonicalName
                            : ustadzData.suggestions[0].name;
                        normalized[i] = { ...entry, pemateri: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing ustadz:', e);
                }

                // Normalize masjid name and auto-fill location data
                // DISABLED as requested: "gak usah dinormalisasi aja yg mesjid"
                /*
                try {
                    const masjidResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.masjid, type: 'masjid', threshold: 0.8 }),
                    });
                    const masjidData = await masjidResponse.json();
                    if (masjidData.hasExactMatch || (masjidData.suggestions && masjidData.suggestions.length > 0)) {
                        const bestMatch = masjidData.hasExactMatch
                            ? masjidData.canonicalName
                            : masjidData.suggestions[0].name;

                        // Auto-fill location data if available
                        const updates: any = { masjid: bestMatch };
                        if (masjidData.locationData) {
                            if (masjidData.locationData.address) updates.address = masjidData.locationData.address;
                            if (masjidData.locationData.city) updates.city = masjidData.locationData.city;
                            if (masjidData.locationData.gmapsUrl) updates.gmapsUrl = masjidData.locationData.gmapsUrl;
                            if (masjidData.locationData.lat !== undefined && masjidData.locationData.lat !== null) {
                                updates.lat = masjidData.locationData.lat;
                            }
                            if (masjidData.locationData.lng !== undefined && masjidData.locationData.lng !== null) {
                                updates.lng = masjidData.locationData.lng;
                            }
                        }
                        normalized[i] = { ...normalized[i], ...updates };
                    }
                } catch (e) {
                    console.error('Error normalizing masjid:', e);
                }
                */
                setEntries([...normalized]); // Live update UI
            }

            setLastImageUrl(null); // Reset after processing

            // Completion
            setProgressModal({
                isOpen: true,
                title: 'Ekstraksi Selesai!',
                message: `Alhamdulillah! ${normalized.length} jadwal berhasil diekstrak dan siap disimpan.`,
                progress: 100,
                currentStep: normalized.length,
                totalSteps: normalized.length
            });
            setMessage(`Ekstraksi selesai. Data telah diproses dan dinormalisasi.`);

            // Auto-close modal after 3 seconds
            setTimeout(() => {
                setProgressModal(prev => ({ ...prev, isOpen: false }));
            }, 3000);
        } catch (e: any) {
            setProgressModal(prev => ({ ...prev, isOpen: false }));
            setMessage(`Gagal memproses: ${e.message || 'Kesalahan'}. Pastikan format sesuai.`);
            console.error(e);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleAiProcess = async () => {
        stopSignal.current = false;
        try {
            setIsAiLoading(true);
            setProgressModal({
                isOpen: true,
                title: 'AI Gemini Extraction',
                message: 'Sedang meminta bantuan AI Gemini untuk mengekstrak data... (Mohon tunggu sebentar)',
                progress: 10,
                currentStep: 1,
                totalSteps: 100 // Estimate
            });

            const parsed = await parseWithGemini(inputText);
            if (stopSignal.current) return;

            setProgressModal(prev => ({
                ...prev,
                message: `Alhamdulillah! AI berhasil mengekstrak ${parsed.length} jadwal. Memproses data...`,
                progress: 30
            }));

            const enrichedEntries = parsed.map(entry => {
                const isFriday = entry.waktu?.toLowerCase().includes('jumat') || entry.waktu?.toLowerCase().includes("jum'at") || entry.tema?.toLowerCase().includes('jumat') || entry.tema === '';
                const defaultImg = isFriday ? '/images/khutbah-jumat-cover.png' : undefined;

                // Auto-split waktu and pemateri if AI didn't do it
                const waktuSplit = entry.waktu_mulai ? {} : splitWaktu(entry.waktu);
                const pemateriSplit = entry.pemateri2 ? {} : splitPemateri(entry.pemateri);

                return {
                    ...entry,
                    ...waktuSplit,
                    ...pemateriSplit,
                    imageUrl: lastImageUrl || defaultImg
                };
            });
            setEntries(enrichedEntries);
            setSelectedIndices(new Set(enrichedEntries.map((_, i) => i)));

            setIsGeocoding(true);
            const withCoords = [...enrichedEntries];

            // 1. Geocoding Phase
            for (let i = 0; i < withCoords.length; i++) {
                if (stopSignal.current) break;
                const entry = withCoords[i];
                // Progress from 30% to 70%
                const progress = 30 + Math.round(((i + 1) / withCoords.length) * 40);

                if (stopSignal.current) break;
                setProgressModal(prev => ({
                    ...prev,
                    progress,
                    message: `Mencari koordinat lokasi... (${i + 1}/${withCoords.length})\n${entry.masjid}`,
                    currentStep: i + 1,
                    totalSteps: withCoords.length
                }));

                const urlCoords = extractCoordsFromUrl(entry.gmapsUrl);
                if (urlCoords) {
                    // console.log(`Got coords from URL for ${entry.masjid}:`, urlCoords);
                    withCoords[i] = { ...entry, lat: urlCoords.lat, lng: urlCoords.lng };
                    setEntries([...withCoords]); // Live update UI
                    continue; // Skip geocoding if we got precise coords from URL
                }

                // If URL exists but is short (bit.ly, goo.gl, etc), try to resolve it first
                if (entry.gmapsUrl && !entry.gmapsUrl.includes('google.com/maps') && !entry.gmapsUrl.includes('google.co.id/maps')) {
                    try {
                        const resolveRes = await fetch('/api/admin/resolve-url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: entry.gmapsUrl })
                        });
                        const resolveData = await resolveRes.json();
                        if (resolveData.resolvedUrl) {
                            const resolvedCoords = extractCoordsFromUrl(resolveData.resolvedUrl);
                            if (resolvedCoords) {
                                withCoords[i] = {
                                    ...entry,
                                    lat: resolvedCoords.lat,
                                    lng: resolvedCoords.lng,
                                    gmapsUrl: resolveData.resolvedUrl // Update to full URL
                                };
                                setEntries([...withCoords]);
                                continue;
                            }
                        }
                    } catch (e) {
                        console.error('Error resolving URL:', e);
                    }
                }

                const coords = await geocodeAddress(entry.masjid, entry.address, entry.city);
                if (stopSignal.current) break;
                if (coords) {
                    // Generate Google Maps URL from coordinates ONLY IF we don't have one
                    const gmapsUrl = entry.gmapsUrl || `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
                    withCoords[i] = { ...entry, lat: coords.lat, lng: coords.lng, gmapsUrl };
                    setEntries([...withCoords]); // Live update UI
                }
            }
            if (stopSignal.current) return;

            // 2. Normalization Phase (DISABLED FOR MASJID AS REQUESTED)
            setProgressModal(prev => ({
                ...prev,
                title: 'Normalisasi Data',
                message: 'Menormalisasi nama ustadz...', // Only Ustadz now
                progress: 70
            }));

            const normalized = [...withCoords];

            for (let i = 0; i < normalized.length; i++) {
                if (stopSignal.current) break;
                const entry = normalized[i];
                // Progress from 70% to 95%
                const progress = 70 + Math.round(((i + 1) / normalized.length) * 25);

                if (stopSignal.current) break;
                setProgressModal(prev => ({
                    ...prev,
                    progress,
                    message: `Menormalisasi nama... (${i + 1}/${normalized.length})`
                }));

                // Normalize ustadz name
                if (stopSignal.current) break;
                try {
                    const ustadzResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.pemateri, type: 'ustadz', threshold: 0.8 }),
                    });
                    const ustadzData = await ustadzResponse.json();

                    if (ustadzData.hasExactMatch || (ustadzData.suggestions && ustadzData.suggestions.length > 0)) {
                        const bestMatch = ustadzData.hasExactMatch
                            ? ustadzData.canonicalName
                            : ustadzData.suggestions[0].name;
                        normalized[i] = { ...entry, pemateri: bestMatch };
                    }
                } catch (e) {
                    console.error('Error normalizing ustadz:', e);
                }

                // Normalize masjid name and auto-fill location data
                // DISABLED as per user request: "gak usah dinormalisasi aja yg mesjid"
                /* 
                if (stopSignal.current) break;
                try {
                    const masjidResponse = await fetch('/api/admin/normalize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: entry.masjid, type: 'masjid', threshold: 0.8 }),
                    });
                     // ... existing logic ...
                } catch (e) {
                    console.error('Error normalizing masjid:', e);
                }
                */
                // We still update the entry to ensure changes flow through
                setEntries([...normalized]); // Live update UI
            }

            setLastImageUrl(null); // Reset after processing
            setIsGeocoding(false);

            if (stopSignal.current) {
                setProgressModal(prev => ({ ...prev, isOpen: false }));
                setMessage("Proses dibatalkan oleh pengguna.");
                return;
            }

            // Completion
            setProgressModal({
                isOpen: true,
                title: 'Selesai!',
                message: `Alhamdulillah! ${normalized.length} jadwal berhasil diekstrak dan siap disimpan.`,
                progress: 100,
                currentStep: normalized.length,
                totalSteps: normalized.length
            });
            setMessage(`Ekstraksi AI selesai. Data telah diproses.`);

            // Auto-close modal after 2 seconds
            setTimeout(() => {
                setProgressModal(prev => ({ ...prev, isOpen: false }));
            }, 2000);

        } catch (e: any) {
            setProgressModal(prev => ({ ...prev, isOpen: false }));
            setMessage(`Gagal memproses dengan AI: ${e.message || 'Kesalahan tidak diketahui'}`);
            setIsGeocoding(false);
            console.error(e);
        } finally {
            setIsAiLoading(false);
        }
    };




    const toggleSelection = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
    };

    const toggleAll = () => {
        if (selectedIndices.size === entries.length) {
            setSelectedIndices(new Set());
        } else {
            setSelectedIndices(new Set(entries.map((_, i) => i)));
        }
    };

    const handleSave = async () => {
        const entriesToSave = entries.filter((_, i) => selectedIndices.has(i));

        if (entriesToSave.length === 0) {
            setMessage('Pilih setidaknya satu jadwal untuk disimpan.');
            return;
        }

        try {
            setIsSaving(true);

            // Try to save directly
            const response = await fetch('/api/kajian', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(entriesToSave),
            });

            const data = await response.json();

            // Handle duplicate detection (409 status)
            if (response.status === 409 && data.duplicates) {
                setDuplicateEntries(data.duplicates);
                setPendingSaveEntries(entriesToSave);
                setShowDuplicateModal(true);
                setIsSaving(false);
                return;
            }

            if (!response.ok) {
                setMessage(`Gagal menyimpan: ${data.error || 'Server error'}`);
                setIsSaving(false);
                return;
            }

            setMessage(`Alhamdulillah, ${entriesToSave.length} jadwal berhasil disimpan!`);
            fetchStats();

            // Remove saved entries from list
            const savedIndices = new Set(entriesToSave.map(e => entries.indexOf(e)));
            const remainingEntries = entries.filter((_, i) => !savedIndices.has(i));
            setEntries(remainingEntries);
            setSelectedIndices(new Set(remainingEntries.map((_, i) => i)));

            if (remainingEntries.length === 0) {
                setInputText('');
            }
        } catch (e) {
            setMessage('Kesalahan koneksi atau sistem saat menyimpan.');
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmSave = async (action: 'all' | 'skip') => {
        try {
            setIsSaving(true);
            setShowDuplicateModal(false);
            console.log('handleConfirmSave called with action:', action);

            let finalEntries = [...pendingSaveEntries];

            if (action === 'skip') {
                // Filter out duplicates using new format
                const duplicateSignatures = new Set(duplicateEntries.map(d =>
                    `${d.new.masjid}|${d.new.city}|${d.new.date}|${d.new.waktu}`
                ));

                finalEntries = pendingSaveEntries.filter(e =>
                    !duplicateSignatures.has(`${formatMasjidName(e.masjid)}|${e.city}|${e.date}|${e.waktu}`)
                );
                console.log('Filtered entries (skip mode):', finalEntries.length);
            }

            if (finalEntries.length === 0) {
                // Even if all are skipped, we clear them from the list
                const processedObjects = new Set(pendingSaveEntries);
                const remainingEntries = entries.filter(e => !processedObjects.has(e));
                setEntries(remainingEntries);
                setSelectedIndices(new Set(remainingEntries.map((_, i) => i)));
                if (remainingEntries.length === 0) setInputText('');

                setMessage('Tidak ada data baru untuk disimpan (semua duplikat dilewati).');
                setIsSaving(false);
                setDuplicateEntries([]);
                setPendingSaveEntries([]);
                return;
            }

            try {
                console.log('Saving', finalEntries.length, 'entries...');
                const response = await fetch('/api/kajian', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalEntries),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.error('API error:', data);
                    setMessage(`Gagal menyimpan: ${data.error || 'Server error'}`);
                    setIsSaving(false);
                    return;
                }

                const savedCount = finalEntries.length;
                const skippedCount = pendingSaveEntries.length - finalEntries.length;

                if (action === 'skip' && skippedCount > 0) {
                    setMessage(`Alhamdulillah, ${savedCount} jadwal baru berhasil disimpan! (${skippedCount} duplikat dilewati)`);
                } else {
                    setMessage(`Alhamdulillah, ${savedCount} jadwal berhasil disimpan!`);
                }

                fetchStats();

                // Remove PROCESSED entries from list (both saved and skipped)
                const processedObjects = new Set(pendingSaveEntries);
                const remainingEntries = entries.filter(e => !processedObjects.has(e));

                setEntries(remainingEntries);
                setSelectedIndices(new Set(remainingEntries.map((_, i) => i)));

                if (remainingEntries.length === 0) {
                    setInputText('');
                }

            } catch (e) {
                console.error('Save error:', e);
                setMessage('Gagal menyimpan data.');
            } finally {
                setIsSaving(false);
                setDuplicateEntries([]);
                setPendingSaveEntries([]);
            }
        } catch (error: any) {
            console.error('Outer handleConfirmSave error:', error);
            setMessage(`Error: ${error.message || 'Kesalahan tidak diketahui'}`);
            setIsSaving(false);
        }
    };


    const handleDeleteExisting = async (existingId: number, duplicateIndex: number) => {
        if (!confirm('Yakin ingin menghapus kajian yang sudah ada di database? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        try {
            setIsSaving(true);
            console.log('Deleting existing kajian ID:', existingId);

            const response = await fetch(`/api/kajian/${existingId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            // Remove from duplicateEntries
            const updatedDuplicates = duplicateEntries.filter((_, i) => i !== duplicateIndex);
            setDuplicateEntries(updatedDuplicates);

            setMessage(`Kajian ID ${existingId} berhasil dihapus dari database.`);

            // If no more duplicates, close modal and save remaining
            if (updatedDuplicates.length === 0) {
                setShowDuplicateModal(false);
                // Automatically save the entries now that duplicates are resolved
                await handleConfirmSave('all');
            }
        } catch (error: any) {
            console.error('Delete error:', error);
            setMessage(`Gagal menghapus: ${error.message || 'Kesalahan tidak diketahui'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const updateEntry = (index: number, field: keyof KajianEntry, value: string | number | boolean | undefined) => {
        setEntries(prev => {
            const newEntries = [...prev];
            newEntries[index] = { ...newEntries[index], [field]: value };
            return newEntries;
        });
    };

    // Auto-extract coordinates when Google Maps URL is entered
    const autoExtractCoordinates = async (idx: number, url: string) => {
        // Only proceed if URL looks like a Google Maps link
        if (!url || (!url.includes('maps.google') && !url.includes('maps.app.goo.gl') && !url.includes('goo.gl') && !url.includes('maps'))) {
            return;
        }

        try {
            const res = await fetch('/api/tools/extract-gmaps', {
                method: 'POST',
                body: JSON.stringify({ url }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.success && data.lat && data.lng) {
                // Auto-fill the coordinates
                setEntries(prev => {
                    const updated = [...prev];
                    updated[idx] = {
                        ...updated[idx],
                        lat: data.lat,
                        lng: data.lng,
                        gmapsUrl: data.expandedUrl || url // Use expanded URL if available
                    };
                    return updated;
                });
            }
        } catch (e) {
            console.error('Auto-extract failed:', e);
            // Silently fail - user can still use manual extract button
        }
    };

    // Debounced version to avoid too many API calls
    const debouncedAutoExtract = useRef<NodeJS.Timeout | null>(null);

    const handleGmapsUrlChange = (idx: number, url: string) => {
        // Update the URL immediately
        updateEntry(idx, 'gmapsUrl', url);

        // Clear previous timeout
        if (debouncedAutoExtract.current) {
            clearTimeout(debouncedAutoExtract.current);
        }

        // Set new timeout for auto-extract (1 second after user stops typing)
        if (url && url.trim().length > 10) { // Only try if URL looks substantial
            debouncedAutoExtract.current = setTimeout(() => {
                autoExtractCoordinates(idx, url);
            }, 1000);
        }
    };

    const handleAddManual = () => {
        const newEntry: KajianEntry = {
            region: 'INDONESIA',
            city: 'Jakarta',
            masjid: '',
            address: '',
            pemateri: '',
            tema: '',
            waktu: '',
            date: '',
            cp: '',
            gmapsUrl: ''
        };
        setEntries([newEntry, ...entries]);
        setSelectedIndices(new Set([0, ...Array.from(selectedIndices).map(i => i + 1)]));
        setMessage('Baru: Baris kosong ditambahkan. Silakan isi detailnya.');
    };

    const handleDiscard = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
        const newSelected = new Set<number>();
        selectedIndices.forEach(i => {
            if (i < index) newSelected.add(i);
            else if (i > index) newSelected.add(i - 1);
        });
        setSelectedIndices(newSelected);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="batch-header flex-col md:flex-row items-start md:items-center gap-4">
                <div>
                    <h1 className="batch-title">Input Massal Jadwal Kajian</h1>
                    <p className="batch-subtitle">Ekstrak jadwal dari poster atau broadcast message</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/kajian" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        Lihat Publik
                    </Link>
                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100 flex-1 md:flex-none text-center">
                        <p className="text-xs text-blue-600 font-medium">{stats.total} Jadwal</p>
                    </div>
                </div>
            </div>

            {!isManualMode && (
                <AIInputSection
                    onProcess={handleProcess}
                    onAiProcess={handleAiProcess}
                    onImageUpload={handleImageUpload}
                    inputText={inputText}
                    setInputText={setInputText}
                    lastImageUrl={lastImageUrl}
                    setLastImageUrl={setLastImageUrl}
                    isOcrLoading={isOcrLoading}
                    ocrProgress={ocrProgress}
                    isGeocoding={isGeocoding}
                    isAiLoading={isAiLoading}
                />
            )}

            <div className="w-full">
                <div className="batch-card min-h-[600px]">
                    <div className="batch-card-header batch-card-header-green flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Hasil Ekstraksi</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{entries.length} entri ditemukan</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handleAddManual}
                                className="batch-btn batch-btn-secondary flex-1 md:flex-none"
                            >
                                <PlusCircle className="w-4 h-4" /> Manual
                            </button>
                            {entries.length > 0 && (
                                <button
                                    onClick={handleSave}
                                    className="batch-btn batch-btn-success flex-1 md:flex-none"
                                >
                                    <Save className="w-4 h-4" /> Simpan {selectedIndices.size}
                                </button>
                            )}
                        </div>
                    </div>

                    {entries.length > 0 ? (
                        <div className="overflow-hidden">
                            <div className="hidden md:block">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="p-5 w-16">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.size === entries.length && entries.length > 0}
                                                    onChange={toggleAll}
                                                    className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="p-5 font-black text-slate-400 uppercase tracking-widest text-[11px]">Rincian Jadwal</th>
                                            <th className="p-5 w-16 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {entries.map((entry, idx) => (
                                            <tr key={idx} className={`transition-all group/row ${selectedIndices.has(idx) ? 'bg-white' : 'opacity-40 hover:opacity-100'}`}>
                                                <td className="p-5 align-top">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIndices.has(idx)}
                                                        onChange={() => toggleSelection(idx)}
                                                        className="w-6 h-6 rounded-xl border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                </td>
                                                <td className="p-3 space-y-6 flex gap-6">
                                                    <div className="shrink-0 w-32">
                                                        <ImageUpload
                                                            value={entry.imageUrl}
                                                            onChange={(val) => updateEntry(idx, 'imageUrl', val)}
                                                            label=""
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        {/* SECTION 1: Masjid & Location */}
                                                        <div className="bg-gradient-to-br from-blue-50/50 to-transparent p-5 rounded-2xl border border-blue-100/50">
                                                            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <MapPin className="w-4 h-4" /> Masjid & Lokasi
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Nama Masjid</label>
                                                                    <AutosuggestInput
                                                                        type="masjid"
                                                                        value={entry.masjid}
                                                                        onChange={(val) => updateEntry(idx, 'masjid', val)}
                                                                        onSelect={(item) => {
                                                                            if (item.address) updateEntry(idx, 'address', item.address);
                                                                            if (item.city) updateEntry(idx, 'city', item.city);
                                                                            if (item.gmapsUrl || item.gmapsurl) updateEntry(idx, 'gmapsUrl', item.gmapsUrl || item.gmapsurl);
                                                                            if (item.lat !== undefined) updateEntry(idx, 'lat', item.lat);
                                                                            if (item.lng !== undefined) updateEntry(idx, 'lng', item.lng);
                                                                        }}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900 transition-all"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Kota</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            value={entry.city}
                                                                            onChange={(e) => {
                                                                                updateEntry(idx, 'city', e.target.value);
                                                                                setActiveCityDropdownIndex(idx);
                                                                                setCityFilter(e.target.value);
                                                                            }}
                                                                            onFocus={() => setActiveCityDropdownIndex(idx)}
                                                                            onBlur={() => setTimeout(() => setActiveCityDropdownIndex(null), 200)}
                                                                            className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                        />
                                                                        {activeCityDropdownIndex === idx && cityFilter && (
                                                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-slate-200 rounded-xl shadow-xl">
                                                                                {indonesianCities
                                                                                    .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                                                                                    .slice(0, 10)
                                                                                    .map(city => (
                                                                                        <button
                                                                                            key={city}
                                                                                            type="button"
                                                                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 font-medium text-sm"
                                                                                            onClick={() => {
                                                                                                updateEntry(idx, 'city', city);
                                                                                                setActiveCityDropdownIndex(null);
                                                                                            }}
                                                                                        >
                                                                                            {city}
                                                                                        </button>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Alamat</label>
                                                                    <input
                                                                        type="text"
                                                                        value={entry.address}
                                                                        onChange={(e) => updateEntry(idx, 'address', e.target.value)}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SECTION 2: Kajian Details */}
                                                        <div className="bg-gradient-to-br from-emerald-50/50 to-transparent p-5 rounded-2xl border border-emerald-100/50">
                                                            <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <FileText className="w-4 h-4" /> Detail Kajian
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="md:col-span-2">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pemateri / Ustadz</label>
                                                                        {!entry.pemateri2 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateEntry(idx, 'pemateri2', '')}
                                                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                                            >
                                                                                <PlusCircle className="w-3 h-3" /> Tambah
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <AutosuggestInput
                                                                            type="pemateri"
                                                                            value={entry.pemateri}
                                                                            onChange={(val) => updateEntry(idx, 'pemateri', val)}
                                                                            className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                            placeholder="Pemateri utama..."
                                                                        />
                                                                        {entry.pemateri2 !== undefined && (
                                                                            <div className="relative">
                                                                                <AutosuggestInput
                                                                                    type="pemateri"
                                                                                    value={entry.pemateri2 || ''}
                                                                                    onChange={(val) => updateEntry(idx, 'pemateri2', val)}
                                                                                    className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 pr-10 outline-none font-bold text-slate-900"
                                                                                    placeholder="Pemateri kedua..."
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const { pemateri2, ...rest } = entries[idx];
                                                                                        const newEntries = [...entries];
                                                                                        newEntries[idx] = rest as any;
                                                                                        setEntries(newEntries);
                                                                                    }}
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {entry.pemateri2 && !entry.pemateri3 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateEntry(idx, 'pemateri3', '')}
                                                                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                                                            >
                                                                                <PlusCircle className="w-3 h-3" /> Tambah Ketiga
                                                                            </button>
                                                                        )}
                                                                        {entry.pemateri3 !== undefined && (
                                                                            <div className="relative">
                                                                                <AutosuggestInput
                                                                                    type="pemateri"
                                                                                    value={entry.pemateri3 || ''}
                                                                                    onChange={(val) => updateEntry(idx, 'pemateri3', val)}
                                                                                    className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 pr-10 outline-none font-bold text-slate-900"
                                                                                    placeholder="Pemateri ketiga..."
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        const { pemateri3, ...rest } = entries[idx];
                                                                                        const newEntries = [...entries];
                                                                                        newEntries[idx] = rest as any;
                                                                                        setEntries(newEntries);
                                                                                    }}
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600"
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Tema/Judul Kajian</label>
                                                                    <input
                                                                        type="text"
                                                                        value={entry.tema}
                                                                        onChange={(e) => updateEntry(idx, 'tema', e.target.value)}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SECTION 3: Schedule */}
                                                        <div className="bg-gradient-to-br from-purple-50/50 to-transparent p-5 rounded-2xl border border-purple-100/50">
                                                            <h3 className="text-xs font-black text-purple-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" /> Jadwal
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Tanggal</label>
                                                                    <input
                                                                        type="date"
                                                                        value={(() => {
                                                                            const d = parseIndoDate(entry.date);
                                                                            return d ? formatYYYYMMDD(d) : '';
                                                                        })()}
                                                                        onChange={(e) => {
                                                                            const val = e.target.valueAsDate;
                                                                            if (val) updateEntry(idx, 'date', formatIndoDate(val));
                                                                        }}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Waktu Mulai</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            value={entry.waktu_mulai || ''}
                                                                            onChange={(e) => {
                                                                                updateEntry(idx, 'waktu_mulai', e.target.value);
                                                                                setActiveWaktuDropdownIndex(idx);
                                                                            }}
                                                                            onFocus={() => setActiveWaktuDropdownIndex(idx)}
                                                                            onBlur={() => setTimeout(() => setActiveWaktuDropdownIndex(null), 200)}
                                                                            className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                            placeholder="Ba'da Maghrib / 19.00"
                                                                        />
                                                                        {activeWaktuDropdownIndex === idx && (
                                                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-slate-200 rounded-xl shadow-xl">
                                                                                {['Ba\'da Shubuh', 'Ba\'da Dhuhur', 'Ba\'da Ashar', 'Ba\'da Maghrib', 'Ba\'da Isya', 'Shubuh', 'Dhuhur', 'Ashar', 'Maghrib', 'Isya', 'Sholat Jumat']
                                                                                    .filter(w => w.toLowerCase().includes((entry.waktu_mulai || '').toLowerCase()))
                                                                                    .map(waktu => (
                                                                                        <button
                                                                                            key={waktu}
                                                                                            type="button"
                                                                                            className="w-full text-left px-4 py-2 hover:bg-purple-50 font-medium text-sm"
                                                                                            onClick={() => {
                                                                                                updateEntry(idx, 'waktu_mulai', waktu);
                                                                                                setActiveWaktuDropdownIndex(null);
                                                                                            }}
                                                                                        >
                                                                                            {waktu}
                                                                                        </button>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Waktu Selesai</label>
                                                                    <input
                                                                        type="text"
                                                                        value={entry.waktu_selesai || 'Selesai'}
                                                                        onChange={(e) => updateEntry(idx, 'waktu_selesai', e.target.value)}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-900"
                                                                        placeholder="Selesai / 20.00"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SECTION 4: Contact & Maps */}
                                                        <div className="bg-gradient-to-br from-amber-50/50 to-transparent p-5 rounded-2xl border border-amber-100/50">
                                                            <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <MapPin className="w-4 h-4" /> Kontak & Lokasi Digital
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Contact Person</label>
                                                                        {entry.cp2 === undefined && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateEntry(idx, 'cp2', '')}
                                                                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                                                            >
                                                                                <PlusCircle className="w-3 h-3" /> Tambah
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="CP (Contact Person)"
                                                                            value={entry.cp || ''}
                                                                            onChange={(e) => updateEntry(idx, 'cp', e.target.value)}
                                                                            className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none font-bold text-emerald-700"
                                                                        />
                                                                        {entry.cp2 !== undefined && (
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="CP 2..."
                                                                                    value={entry.cp2}
                                                                                    onChange={(e) => updateEntry(idx, 'cp2', e.target.value)}
                                                                                    className="w-full bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 pr-10 outline-none font-bold text-emerald-700"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => updateEntry(idx, 'cp2', undefined)}
                                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {entry.cp3 !== undefined && (
                                                                            <div className="relative">
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="CP 3..."
                                                                                    value={entry.cp3}
                                                                                    onChange={(e) => updateEntry(idx, 'cp3', e.target.value)}
                                                                                    className="w-full bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 pr-10 outline-none font-bold text-emerald-700"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => updateEntry(idx, 'cp3', undefined)}
                                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        {entry.cp2 !== undefined && entry.cp3 === undefined && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateEntry(idx, 'cp3', '')}
                                                                                className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                                                            >
                                                                                <PlusCircle className="w-3 h-3" /> Tambah CP 3
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div>
                                                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Google Maps URL</label>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                type="text"
                                                                                placeholder="https://maps.google.com/..."
                                                                                value={entry.gmapsUrl || ''}
                                                                                onChange={(e) => handleGmapsUrlChange(idx, e.target.value)}
                                                                                className="flex-1 bg-white border-2 border-slate-200 focus:border-amber-500 rounded-xl px-4 py-2.5 outline-none font-bold text-blue-700 text-sm"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={async () => {
                                                                                    if (!entry.gmapsUrl) return showAlert('Peringatan', 'Masukkan URL Maps terlebih dahulu', 'warning');
                                                                                    setIsGeocoding(true);
                                                                                    try {
                                                                                        const res = await fetch('/api/tools/extract-gmaps', {
                                                                                            method: 'POST',
                                                                                            body: JSON.stringify({ url: entry.gmapsUrl }),
                                                                                            headers: { 'Content-Type': 'application/json' }
                                                                                        });
                                                                                        const data = await res.json();
                                                                                        if (data.success) {
                                                                                            updateEntry(idx, 'lat', data.lat);
                                                                                            updateEntry(idx, 'lng', data.lng);
                                                                                            updateEntry(idx, 'gmapsUrl', data.expandedUrl);
                                                                                            showAlert('Berhasil', `Koordinat berhasil diekstrak!\nLat: ${data.lat}\nLng: ${data.lng}`, 'info');
                                                                                        } else {
                                                                                            showAlert('Gagal', 'Gagal mengekstrak: ' + data.error, 'danger');
                                                                                        }
                                                                                    } catch (e) {
                                                                                        showAlert('Kesalahan', 'Terjadi kesalahan sistem', 'danger');
                                                                                    } finally {
                                                                                        setIsGeocoding(false);
                                                                                    }
                                                                                }}
                                                                                disabled={isGeocoding}
                                                                                className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-bold text-xs whitespace-nowrap"
                                                                                title="Ekstrak Koordinat dari Link"
                                                                            >
                                                                                <MapPin className="w-4 h-4" />
                                                                                {isGeocoding ? 'Memproses...' : 'Ekstrak'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Latitude</label>
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                placeholder="Latitude"
                                                                                value={entry.lat || ''}
                                                                                onChange={(e) => updateEntry(idx, 'lat', e.target.value)}
                                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Longitude</label>
                                                                            <input
                                                                                type="number"
                                                                                step="any"
                                                                                placeholder="Longitude"
                                                                                value={entry.lng || ''}
                                                                                onChange={(e) => updateEntry(idx, 'lng', e.target.value)}
                                                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Link Info/Pendaftaran</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Link Pendaftaran / Info Utama"
                                                                            value={entry.linkInfo || ''}
                                                                            onChange={(e) => updateEntry(idx, 'linkInfo', e.target.value)}
                                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-purple-600"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* SECTION 5: Additional Options */}
                                                        <div className="bg-gradient-to-br from-slate-50 to-transparent p-5 rounded-2xl border border-slate-200">
                                                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                <Info className="w-4 h-4" /> Informasi Tambahan
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {/* Image Upload */}
                                                                <ImageUpload
                                                                    value={entry.imageUrl || ''}
                                                                    onChange={(url) => updateEntry(idx, 'imageUrl', url)}
                                                                    label="Gambar / Poster"
                                                                />

                                                                <div>
                                                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 block">Catatan</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        value={entry.catatan || ''}
                                                                        onChange={(e) => updateEntry(idx, 'catatan', e.target.value)}
                                                                        className="w-full bg-white border-2 border-slate-200 focus:border-slate-400 rounded-xl px-4 py-2.5 outline-none text-slate-900 resize-y"
                                                                        placeholder="Misal: Membawa makanan untuk berbuka, Khusus ikhwan, dll"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all ${entry.khususAkhwat ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-slate-200 text-slate-500 hover:border-pink-200'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={entry.khususAkhwat || false}
                                                                            onChange={(e) => updateEntry(idx, 'khususAkhwat', e.target.checked)}
                                                                            className="hidden"
                                                                        />
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${entry.khususAkhwat ? 'border-pink-500 bg-pink-500' : 'border-slate-300 bg-white'}`}>
                                                                            {entry.khususAkhwat && <CheckCircle className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <span className="text-xs font-black uppercase">🌸 Khusus Akhwat</span>
                                                                    </label>
                                                                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all ${entry.isOnline ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={entry.isOnline || false}
                                                                            onChange={(e) => updateEntry(idx, 'isOnline', e.target.checked)}
                                                                            className="hidden"
                                                                        />
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${entry.isOnline ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}>
                                                                            {entry.isOnline && <CheckCircle className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <span className="text-xs font-black uppercase">💻 Online</span>
                                                                    </label>
                                                                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all ${entry.isKidsFriendly ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-slate-200 text-slate-500 hover:border-orange-200'}`}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={entry.isKidsFriendly || false}
                                                                            onChange={(e) => updateEntry(idx, 'isKidsFriendly', e.target.checked)}
                                                                            className="hidden"
                                                                        />
                                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${entry.isKidsFriendly ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-white'}`}>
                                                                            {entry.isKidsFriendly && <CheckCircle className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <span className="text-xs font-black uppercase">🎈 Kajian Anak</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 align-top text-right">
                                                    <div className="flex flex-col gap-2">
                                                        <button onClick={() => setPreviewIndex(idx)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100" title="Preview Tampilan">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleDiscard(idx)} className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover/row:opacity-100" title="Hapus">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table >
                            </div >

                            {/* Mobile View: Stacked Cards */}
                            < div className="md:hidden divide-y divide-slate-100" >
                                {
                                    entries.map((entry, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group transition-all hover:shadow-md mb-4 last:mb-0">
                                            {/* Header Bar */}
                                            <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex items-start justify-between gap-3">
                                                <div className="flex gap-3 items-center flex-1">
                                                    <button
                                                        onClick={() => toggleSelection(idx)}
                                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIndices.has(idx) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 text-transparent hover:border-blue-400'}`}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Jadwal Kajian</span>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                            <span>{entry.date && parseIndoDate(entry.date) ? formatIndoDate(parseIndoDate(entry.date)!) : '-'}</span>
                                                            <span className="text-slate-300">|</span>
                                                            <Clock className="w-3 h-3 text-slate-400" />
                                                            <span>{entry.waktu}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-1">
                                                    <button onClick={() => setPreviewIndex(idx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDiscard(idx)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="p-4 space-y-6">
                                                {/* Main Info */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Tema Kajian</label>
                                                        <textarea
                                                            rows={2}
                                                            value={entry.tema}
                                                            onChange={(e) => updateEntry(idx, 'tema', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
                                                            placeholder="Judul atau Tema Kajian..."
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <label className={`inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border transition-all ${entry.isKidsFriendly ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-200 hover:text-orange-500'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={entry.isKidsFriendly || false}
                                                                    onChange={(e) => updateEntry(idx, 'isKidsFriendly', e.target.checked)}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${entry.isKidsFriendly ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                                    {entry.isKidsFriendly && <CheckCircle className="w-3 h-3" />}
                                                                </div>
                                                                <span className="text-[10px] font-black uppercase tracking-wider">🎈 Kajian Anak</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Pemateri</label>
                                                        <AutosuggestInput
                                                            type="pemateri"
                                                            value={entry.pemateri}
                                                            onChange={(val) => updateEntry(idx, 'pemateri', val)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                                            placeholder="Nama Ustadz / Pemateri..."
                                                        />
                                                    </div>
                                                </div>

                                                <div className="h-px bg-slate-100" />

                                                {/* Location Info */}
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">
                                                                <MapPin className="w-3 h-3" /> Lokasi Masjid
                                                            </label>
                                                            <AutosuggestInput
                                                                type="masjid"
                                                                value={entry.masjid}
                                                                onChange={(val) => updateEntry(idx, 'masjid', val)}
                                                                onSelect={(item) => {
                                                                    if (item.address) updateEntry(idx, 'address', item.address);
                                                                    if (item.city) updateEntry(idx, 'city', item.city);
                                                                    if (item.gmapsUrl || item.gmapsurl) updateEntry(idx, 'gmapsUrl', item.gmapsUrl || item.gmapsurl);
                                                                    if (item.lat !== undefined) updateEntry(idx, 'lat', item.lat);
                                                                    if (item.lng !== undefined) updateEntry(idx, 'lng', item.lng);
                                                                }}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                                placeholder="Nama Masjid..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Kota / Kabupaten</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={entry.city}
                                                                    onChange={(e) => updateEntry(idx, 'city', e.target.value)} // Fallback
                                                                    onClick={() => {
                                                                        setActiveCityDropdownIndex(activeCityDropdownIndex === idx ? null : idx);
                                                                        setCityFilter('');
                                                                    }}
                                                                    readOnly
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer hover:bg-slate-100 transition-all"
                                                                    placeholder="Pilih Kota..."
                                                                />
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                    <LayoutDashboard className="w-4 h-4 rotate-45" />
                                                                </div>

                                                                {/* Dropdown Kota Mobile */}
                                                                {activeCityDropdownIndex === idx && (
                                                                    <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto left-0 animate-in fade-in zoom-in-95 duration-100">
                                                                        <div className="sticky top-0 bg-white p-2 border-b border-slate-100">
                                                                            <input
                                                                                type="text"
                                                                                value={cityFilter}
                                                                                onChange={(e) => setCityFilter(e.target.value)}
                                                                                placeholder="Cari kota..."
                                                                                className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
                                                                                autoFocus
                                                                            />
                                                                        </div>
                                                                        {indonesianCities
                                                                            .filter(c => c.toLowerCase().includes(cityFilter.toLowerCase()))
                                                                            .map(city => (
                                                                                <button
                                                                                    key={city}
                                                                                    onClick={() => {
                                                                                        updateEntry(idx, 'city', city);
                                                                                        setActiveCityDropdownIndex(null);
                                                                                    }}
                                                                                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-none"
                                                                                >
                                                                                    {city}
                                                                                </button>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-slate-100" />

                                                {/* Geolocation Section (Mobile Only) */}
                                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-4 h-4 text-blue-500" />
                                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Detail Lokasi & Maps</span>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Link Google Maps</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="https://maps.app.goo.gl/..."
                                                                value={entry.gmapsUrl || ''}
                                                                onChange={(e) => updateEntry(idx, 'gmapsUrl', e.target.value)}
                                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                                                            />
                                                            <button
                                                                onClick={async () => {
                                                                    if (!entry.gmapsUrl) return showAlert('Peringatan', 'Masukkan URL Maps terlebih dahulu', 'warning');
                                                                    setIsGeocoding(true);
                                                                    try {
                                                                        const res = await fetch('/api/tools/extract-gmaps', {
                                                                            method: 'POST',
                                                                            body: JSON.stringify({ url: entry.gmapsUrl }),
                                                                            headers: { 'Content-Type': 'application/json' }
                                                                        });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            updateEntry(idx, 'lat', data.lat);
                                                                            updateEntry(idx, 'lng', data.lng);
                                                                            updateEntry(idx, 'gmapsUrl', data.expandedUrl);
                                                                            showAlert('Berhasil', `Koordinat berhasil diekstrak!\nLat: ${data.lat}\nLng: ${data.lng}`, 'info');
                                                                        } else {
                                                                            showAlert('Gagal', 'Gagal mengekstrak: ' + data.error, 'danger');
                                                                        }
                                                                    } catch (e) {
                                                                        showAlert('Kesalahan', 'Terjadi kesalahan sistem', 'danger');
                                                                    } finally {
                                                                        setIsGeocoding(false);
                                                                    }
                                                                }}
                                                                className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center shrink-0"
                                                                title="Ekstrak Koordinat"
                                                            >
                                                                <MapPin className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Latitude</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={entry.lat || ''}
                                                                onChange={(e) => updateEntry(idx, 'lat', e.target.value)}
                                                                placeholder="-6.123"
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-700 outline-none transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Longitude</label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={entry.lng || ''}
                                                                onChange={(e) => updateEntry(idx, 'lng', e.target.value)}
                                                                placeholder="106.123"
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-700 outline-none transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Link Pendaftaran / Info Utama</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Link pendaftaran (https://...)"
                                                            value={entry.linkInfo || ''}
                                                            onChange={(e) => updateEntry(idx, 'linkInfo', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="h-px bg-slate-100" />

                                                {/* Details & Options */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Narahubung (CP)</label>
                                                            {entry.cp2 === undefined && (
                                                                <button
                                                                    onClick={() => updateEntry(idx, 'cp2', '')}
                                                                    className="text-[10px] text-blue-500 font-bold hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                                >
                                                                    <PlusCircle className="w-3 h-3" /> Tambah
                                                                </button>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={entry.cp || ''}
                                                            onChange={(e) => updateEntry(idx, 'cp', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                            placeholder="CP Utama (08...)"
                                                        />

                                                        {entry.cp2 !== undefined && (
                                                            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                                                <input
                                                                    type="text"
                                                                    value={entry.cp2}
                                                                    onChange={(e) => updateEntry(idx, 'cp2', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                                    placeholder="CP Kedua..."
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        // Remove cp2 logic: set explicitly to undefined or empty, 
                                                                        // but here updateEntry handles 'key': undefined fine.
                                                                        updateEntry(idx, 'cp2', undefined);
                                                                        if (entry.cp3) {
                                                                            // Shift cp3 to cp2 if needed? Or just keep cp3?
                                                                            // Simpler to just delete cp2.
                                                                        }
                                                                    }}
                                                                    className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                                {entry.cp3 === undefined && (
                                                                    <button
                                                                        onClick={() => updateEntry(idx, 'cp3', '')}
                                                                        className="p-3 text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                                                                        title="Tambah CP 3"
                                                                    >
                                                                        <PlusCircle className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {entry.cp3 !== undefined && (
                                                            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                                                                <input
                                                                    type="text"
                                                                    value={entry.cp3}
                                                                    onChange={(e) => updateEntry(idx, 'cp3', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                                    placeholder="CP Ketiga..."
                                                                />
                                                                <button
                                                                    onClick={() => updateEntry(idx, 'cp3', undefined)}
                                                                    className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block tracking-widest">Catatan (Optional)</label>
                                                        <textarea
                                                            value={entry.catatan || ''}
                                                            onChange={(e) => updateEntry(idx, 'catatan', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y min-h-[80px]"
                                                            placeholder="Info tambahan, pengumuman, dsb..."
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div className="col-span-2 grid grid-cols-2 gap-3">
                                                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${entry.khususAkhwat ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={entry.khususAkhwat || false}
                                                                onChange={(e) => updateEntry(idx, 'khususAkhwat', e.target.checked)}
                                                                className="hidden"
                                                            />
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${entry.khususAkhwat ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-300'}`}>
                                                                {entry.khususAkhwat && <CheckCircle className="w-3 h-3" />}
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-wide">Akhwat</span>
                                                        </label>

                                                        <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${entry.isOnline ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={entry.isOnline || false}
                                                                onChange={(e) => updateEntry(idx, 'isOnline', e.target.checked)}
                                                                className="hidden"
                                                            />
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${entry.isOnline ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'}`}>
                                                                {entry.isOnline && <CheckCircle className="w-3 h-3" />}
                                                            </div>
                                                            <span className="text-xs font-bold uppercase tracking-wide">Online</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="h-px bg-slate-100" />

                                                {/* Media Upload */}
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Poster Kajian</label>
                                                    <ImageUpload
                                                        label=""
                                                        value={entry.imageUrl || ''}
                                                        onChange={(url) => updateEntry(idx, 'imageUrl', url)}
                                                        className="w-full"
                                                    />
                                                </div>

                                            </div>
                                        </div>
                                    ))
                                }
                                <div className="h-40" aria-hidden="true" /> {/* Spacer for keyboard */}
                            </div>
                        </div>
                    ) : (
                        <div className="batch-empty-state">
                            <div className="batch-empty-icon">
                                <Database className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="batch-empty-title">Siap Menunggu Data</p>
                            <p className="batch-empty-text">Belum ada jadwal yang diekstrak. Silakan tempel teks atau scan poster.</p>
                        </div>
                    )
                    }

                    {
                        message && (
                            <div className={`mt-10 batch-message ${message.includes('Gagal') ? 'batch-message-error' : 'batch-message-success'} flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500`}>
                                <div className={`p-2 rounded-xl ${message.includes('Gagal') ? 'bg-red-100' : 'bg-blue-100'}`}>
                                    <Info className="w-5 h-5" />
                                </div>
                                <span className="font-bold">{message}</span>
                            </div>
                        )
                    }
                </div >
            </div >
            {/* Duplicate Warning Modal */}
            {
                showDuplicateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-gradient-to-r from-amber-50 to-orange-50">
                                <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Peringatan Duplikat</h3>
                                    <p className="text-sm text-slate-600">Ditemukan {duplicateEntries.length} jadwal yang mungkin sudah ada.</p>
                                </div>
                            </div>

                            <div className="p-6 max-h-[65vh] overflow-y-auto bg-slate-50">
                                <div className="space-y-4">
                                    {duplicateEntries.map((d, i) => (
                                        <div key={i} className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-sm">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="mt-1">
                                                    <AlertCircle className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-amber-700 text-sm mb-1">Duplikat #{i + 1}</h4>
                                                    <p className="text-xs text-slate-500">Masjid, kota, tanggal, dan waktu yang sama sudah ada</p>
                                                </div>
                                            </div>

                                            {/* Comparison Grid */}
                                            <div className="grid md:grid-cols-2 gap-3 mb-4">
                                                {/* New Entry */}
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                                                    <p className="text-xs font-black text-blue-700 mb-3 uppercase tracking-wider flex items-center gap-1">
                                                        ✨ Data Baru
                                                    </p>
                                                    <div className="text-xs text-slate-700 space-y-1.5">
                                                        <p className="font-bold text-sm text-slate-900">{d.new.tema}</p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">👤</span> {d.new.pemateri}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">🕌</span> {d.new.masjid}
                                                        </p>
                                                        {d.new.city && (
                                                            <p className="flex items-center gap-1">
                                                                <span className="opacity-60">📍</span> {d.new.city}
                                                            </p>
                                                        )}
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">📅</span> {d.new.date}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">⏰</span> {d.new.waktu}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Existing Entry */}
                                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border-2 border-slate-300">
                                                    <p className="text-xs font-black text-slate-600 mb-3 uppercase tracking-wider flex items-center gap-1">
                                                        📊 Data Database (ID: {d.existing.id})
                                                    </p>
                                                    <div className="text-xs text-slate-700 space-y-1.5">
                                                        <p className="font-bold text-sm text-slate-900">{d.existing.tema}</p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">👤</span> {d.existing.pemateri}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">🕌</span> {d.existing.masjid}
                                                        </p>
                                                        {d.existing.city && (
                                                            <p className="flex items-center gap-1">
                                                                <span className="opacity-60">📍</span> {d.existing.city}
                                                            </p>
                                                        )}
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">📅</span> {d.existing.date}
                                                        </p>
                                                        <p className="flex items-center gap-1">
                                                            <span className="opacity-60">⏰</span> {d.existing.waktu}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => {
                                                        // Skip this duplicate - remove from list
                                                        const updatedDuplicates = duplicateEntries.filter((_, idx) => idx !== i);
                                                        setDuplicateEntries(updatedDuplicates);

                                                        if (updatedDuplicates.length === 0) {
                                                            setShowDuplicateModal(false);
                                                            setMessage('Semua duplikat dilewati. Data lama di database dipertahankan.');
                                                        } else {
                                                            setMessage(`Duplikat dilewati. Masih ada ${updatedDuplicates.length} duplikat lagi.`);
                                                        }
                                                    }}
                                                    disabled={isSaving}
                                                    className={`px-3 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 border-2 border-slate-200 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Gunakan data yang sudah ada di database, abaikan data baru"
                                                >
                                                    <span>⏭️</span>
                                                    <span className="hidden sm:inline">Lewati</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (isSaving) return;
                                                        setIsSaving(true);
                                                        try {
                                                            // Replace: Update existing with new data
                                                            const res = await fetch(`/api/kajian/${d.existing.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify(d.new)
                                                            });

                                                            if (res.ok) {
                                                                // Remove this duplicate from the list
                                                                const updatedDuplicates = duplicateEntries.filter((_, idx) => idx !== i);
                                                                setDuplicateEntries(updatedDuplicates);

                                                                if (updatedDuplicates.length === 0) {
                                                                    setShowDuplicateModal(false);
                                                                    setMessage('Data berhasil ditimpa!');
                                                                    fetchStats();
                                                                }
                                                            } else {
                                                                const data = await res.json();
                                                                showAlert('Gagal', `Gagal menimpa data: ${data.error}`, 'danger');
                                                            }
                                                        } catch (e) {
                                                            console.error('Replace error:', e);
                                                            showAlert('Kesalahan', 'Terjadi kesalahan saat menimpa data', 'danger');
                                                        } finally {
                                                            setIsSaving(false);
                                                        }
                                                    }}
                                                    disabled={isSaving}
                                                    className={`px-3 py-2.5 bg-blue-500 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 border-2 border-blue-600 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Timpa data lama dengan data baru (Update)"
                                                >
                                                    <span>🔄</span>
                                                    <span className="hidden sm:inline">Timpa</span>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (isSaving) return;

                                                        // Confirm deletion
                                                        if (!window.confirm('Yakin ingin menghapus kajian yang sudah ada di database? Data baru akan disimpan sebagai gantinya.')) {
                                                            return;
                                                        }

                                                        setIsSaving(true);
                                                        try {
                                                            const response = await fetch(`/api/kajian/${d.existing.id}`, {
                                                                method: 'DELETE'
                                                            });

                                                            if (!response.ok) {
                                                                const data = await response.json();
                                                                throw new Error(data.error || 'Gagal menghapus');
                                                            }

                                                            // Remove from duplicateEntries
                                                            const updatedDuplicates = duplicateEntries.filter((_, idx) => idx !== i);
                                                            setDuplicateEntries(updatedDuplicates);

                                                            if (updatedDuplicates.length === 0) {
                                                                setShowDuplicateModal(false);
                                                                // Save the new data automatically
                                                                await handleConfirmSave('all');
                                                                setMessage(`Kajian ID ${d.existing.id} berhasil dihapus dan data baru disimpan.`);
                                                            } else {
                                                                setMessage(`Kajian ID ${d.existing.id} berhasil dihapus. Masih ada ${updatedDuplicates.length} duplikat lagi.`);
                                                                fetchStats();
                                                            }
                                                        } catch (error: any) {
                                                            console.error('Delete error:', error);
                                                            showAlert('Gagal', `Gagal menghapus: ${error.message}`, 'danger');
                                                        } finally {
                                                            setIsSaving(false);
                                                        }
                                                    }}
                                                    disabled={processingDuplicates.has(i) || isSaving}
                                                    className={`px-3 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5 border-2 border-red-600 ${(processingDuplicates.has(i) || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title="Hapus data lama dari database, data baru akan disimpan"
                                                >
                                                    {processingDuplicates.has(i) ? (
                                                        <>
                                                            <span className="animate-spin">⏳</span>
                                                            <span className="hidden sm:inline">Proses...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>🗑️</span>
                                                            <span className="hidden sm:inline">Hapus</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 text-sm text-center text-slate-600 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="font-bold text-slate-800 mb-2">💡 Pilihan Aksi:</p>
                                    <div className="text-xs text-left space-y-1">
                                        <p>• <strong>Lewati:</strong> Gunakan data lama, abaikan data baru</p>
                                        <p>• <strong>Timpa:</strong> Ganti data lama dengan data baru</p>
                                        <p>• <strong>Hapus:</strong> Hapus data lama, simpan data baru</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDuplicateModal(false);
                                        setPendingSaveEntries([]);
                                        setDuplicateEntries([]);
                                        setMessage('Penyimpanan dibatalkan.');
                                    }}
                                    disabled={isSaving}
                                    className={`px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={() => handleConfirmSave('skip')}
                                    disabled={isSaving}
                                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all shadow-lg ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSaving ? '⏳ Memproses...' : 'Proses Semua'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Preview Modal */}
            {
                previewIndex !== null && entries[previewIndex] && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900">Preview Tampilan</h3>
                                <button
                                    onClick={() => setPreviewIndex(null)}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <div className="p-8 flex justify-center bg-slate-50">
                                <KajianCard
                                    id={0}
                                    title={entries[previewIndex].tema}
                                    ustadz={entries[previewIndex].pemateri}
                                    date={entries[previewIndex].date}
                                    location={entries[previewIndex].masjid}
                                    imageUrl={entries[previewIndex].imageUrl}
                                    khususAkhwat={entries[previewIndex].khususAkhwat}
                                    isOnline={entries[previewIndex].isOnline}
                                    waktu={entries[previewIndex].waktu}
                                    className="w-full max-w-[280px] shadow-xl"
                                />
                            </div>
                            <div className="p-4 bg-white text-center">
                                <p className="text-[10px] text-slate-400 font-medium">Ini adalah tampilan kartu kajian yang akan muncul di halaman depan.</p>
                            </div>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText="OK"
                showCancel={false}
                type={alertConfig.type}
            />

            <ProgressModal
                isOpen={progressModal.isOpen}
                title={progressModal.title}
                message={progressModal.message}
                progress={progressModal.progress}
                currentStep={progressModal.currentStep}
                totalSteps={progressModal.totalSteps}
                onClose={() => setProgressModal(prev => ({ ...prev, isOpen: false }))}
                showCloseButton={progressModal.progress === 100}
                onCancel={progressModal.progress < 100 ? () => {
                    stopSignal.current = true;
                    setProgressModal(prev => ({ ...prev, isOpen: false }));
                    setMessage("Proses ekstraksi dibatalkan.");
                } : undefined}
            />
        </div >
    );
}

export default function BatchInputPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat data...</div>}>
            <BatchInputPageContent />
        </Suspense>
    );
}
