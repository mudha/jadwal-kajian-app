'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    UniqueIdentifier,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

const WIDGET_LABELS: Record<string, string> = {
    'SidebarMenuWidget': 'Menu Sidebar',
    'PrayerTimesWidget': 'Jadwal Sholat (Sidebar)',
    'ContactWidget': 'Kontak Admin',
    'HeroWidget': 'Hero Section (Selamat Datang)',
    'QuickMenuWidget': 'Menu Cepat (Grid)',
    'OngoingWidget': 'Kajian Berlangsung',
    'LatestKajianWidget': 'Info Kajian Terbaru',
    'KajianListWidget': 'Kajian Pilihan / Terdekat',
};

function SortableItem({ id, hidden, onToggle }: { id: string, hidden?: boolean, onToggle?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between p-4 mb-2 bg-white rounded-xl border ${hidden ? 'border-slate-100 bg-slate-50' : 'border-slate-200 shadow-sm'} group`}>
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600">
                    <GripVertical className="w-5 h-5" />
                </div>
                <span className={`font-medium ${hidden ? 'text-slate-400' : 'text-slate-700'}`}>
                    {WIDGET_LABELS[id.split(':')[0]] || id.split(':')[0]}
                </span>
            </div>
            {onToggle && (
                <button onClick={onToggle} className={`p-2 rounded-lg ${hidden ? 'text-slate-400 hover:bg-slate-200' : 'text-teal-600 hover:bg-teal-50'}`}>
                    {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            )}
        </div>
    );
}

export default function AdminTampilanPage() {
    const [layout, setLayout] = useState<{
        sidebar: string[];
        main: string[];
        mobile: string[];
        hidden_menu: string[];
        hidden: string[];
        hidden_mobile: string[];
    }>({
        sidebar: [],
        main: [],
        mobile: [],
        hidden_menu: [],
        hidden: [],
        hidden_mobile: []
    });

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

    const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' = 'info') => {
        setAlertConfig({ isOpen: true, title, message, type });
    };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const isFirstRender = useRef(true);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const DEFAULT_MOBILE_LAYOUT = {
        mobile: ['HeroWidget:mobile', 'QuickMenuWidget:mobile', 'OngoingWidget:mobile', 'LatestKajianWidget:mobile', 'KajianListWidget:mobile'],
        hidden_mobile: ['SidebarMenuWidget:mobile', 'PrayerTimesWidget:mobile', 'ContactWidget:mobile']
    };

    const DEFAULT_DESKTOP_LAYOUT = {
        sidebar: ['SidebarBrandWidget', 'SidebarMenuWidget', 'PrayerTimesWidget', 'ContactWidget'],
        main: ['HeroWidget', 'QuickMenuWidget', 'OngoingWidget', 'LatestKajianWidget', 'KajianListWidget'],
        hidden: []
    };



    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setLayout((prev: any) => {
                const activeContainer = findContainer(active.id, prev);
                const overContainer = findContainer(over.id, prev);

                if (!activeContainer || !overContainer) return prev;

                if (activeContainer === overContainer) {
                    const oldIndex = prev[activeContainer].indexOf(active.id);
                    // If over.id is the container layout, we might be dropping on the container itself 
                    // which usually means move to end, but since it's the same container, it might just be a small shift or no-op if reordering logic isn't precise.
                    // But usually over.id is an item id when reordering.
                    // If over.id IS the container ID, we shouldn't use indexOf(over.id).

                    if (over.id === overContainer) {
                        // Dropped on itself (the container background).
                        // If it's the same container, we probably don't need to do anything or move to end?
                        // Let's just return prev to avoid weird jumps.
                        return prev;
                    }

                    const newIndex = prev[overContainer].indexOf(over.id);
                    return {
                        ...prev,
                        [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex)
                    };
                } else {
                    // Moving between containers
                    let newIndex;
                    if (over.id === overContainer) {
                        // We're over a container directly (e.g. empty container or background)
                        newIndex = prev[overContainer].length + 1;
                    } else {
                        const isBelowOverItem =
                            over &&
                            active.rect.current.translated &&
                            active.rect.current.translated.top >
                            over.rect.top + over.rect.height;

                        const modifier = isBelowOverItem ? 1 : 0;
                        const overItems = prev[overContainer];
                        const overIndex = overItems.indexOf(over.id);
                        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                    }

                    return {
                        ...prev,
                        [activeContainer]: [
                            ...prev[activeContainer].filter((item: any) => item !== active.id)
                        ],
                        [overContainer]: [
                            ...prev[overContainer].slice(0, newIndex),
                            active.id,
                            ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                        ]
                    };
                }
            });
        }
        setActiveId(null);
    };

    const findContainer = (id: string, currentLayout: any) => {
        if (['sidebar', 'main', 'hidden', 'mobile', 'hidden_mobile'].includes(id)) return id;
        if (id in currentLayout) return id;
        return Object.keys(currentLayout).find(key => Array.isArray(currentLayout[key]) && currentLayout[key].includes(id));
    };

    // Custom logic to handle strict separation? 
    // Maybe just allow simple reordering for now and assume users know where widgets belong?
    // Actually, separating "Sidebar Widgets" and "Main Widgets" is crucial because they have different widths.
    // SidebarMenuWidget triggers a full sidebar rendering, usually fits in narrow column.
    // HeroWidget needs wide column.
    // So restricted zones are better. Sidebar Widgets in Sidebar, Main Widgets in Main.
    // BUT user asked: "geser/drag/remove widget samping, mau di kanan atau kiri, atau atas atau ke bawah".

    // Let's implement simplified lists.
    // Sidebar List
    // Main Content List
    // Hidden List

    // Dragging between Sidebar and Main might break UI (e.g. Hero in Sidebar).
    // I will allow it but maybe warn? Or just let it be and user sees the mess.
    // Let's trust the user for now.


    // Use :mobile suffix for mobile widgets to maintain unique IDs in the system
    // but we display them cleanly in the UI.

    const [menuItems, setMenuItems] = useState<any[]>([]);

    const DEFAULT_MENU_ITEMS = [
        { id: 'sekolah-sunnah', label: 'Sekolah Sunnah', iconName: 'GraduationCap', href: '/sekolah-sunnah', gradient: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
        { id: 'loker', label: 'Lowongan Kerja', iconName: 'Briefcase', href: '#', gradient: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-50', iconColor: 'text-orange-600', badge: 'SOON' },
        { id: 'dzikir', label: 'Dzikir', iconName: 'BookText', href: '/dzikir', gradient: 'from-teal-500 to-teal-600', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
        { id: 'jadwal-sholat', label: 'Jadwal Sholat', iconName: 'Clock', href: '/jadwal-sholat', gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { id: 'kajian-online', label: 'Kajian Online', iconName: 'Video', href: '/kajian?online=true', gradient: 'from-violet-500 to-violet-600', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
        { id: 'kajian-muslimah', label: 'Kajian Muslimah', iconName: 'Flower2', href: '/kajian?muslimah=true', gradient: 'from-pink-500 to-pink-600', iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
        { id: 'kajian-anak', label: 'Kajian Anak', iconName: 'Puzzle', href: '/kajian?mode=anak', gradient: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
        { id: 'kajian-terdekat', label: 'Kajian Terdekat', iconName: 'MapPin', href: '/kajian?nearby=true', gradient: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
        { id: 'hubungi-kami', label: 'Hubungi Kami', iconName: 'MessageCircle', href: '/hubungi-kami', gradient: 'from-slate-500 to-slate-600', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' },
        { id: 'catatan-kajian', label: 'Catatan Kajian', iconName: 'FileText', href: '/catatan-kajian', gradient: 'from-indigo-500 to-indigo-600', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { id: 'kalender-puasa', label: 'Kalender Puasa', iconName: 'Calendar', href: '/kalender-puasa', gradient: 'from-green-500 to-green-600', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { id: 'cari-masjid', label: 'Cari Masjid', iconName: 'Home', href: '/masjid', gradient: 'from-red-500 to-red-600', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
    ];

    useEffect(() => {
        setLoading(true);
        console.log('[Admin/Tampilan] Fetching initial settings...');
        Promise.all([
            fetch('/api/settings/layout').then(res => res.json()),
            fetch('/api/settings/quick-menu').then(res => res.json())
        ])
            .then(([layoutData, menuData]) => {
                console.log('[Admin/Tampilan] Fetched layoutData:', JSON.stringify(layoutData, null, 2));
                console.log('[Admin/Tampilan] Fetched menuData:', menuData);

                // 1. Handle Layout Data
                let currentHiddenMenu: string[] = [];

                if (layoutData && (layoutData.sidebar || layoutData.main)) {
                    const mobile = layoutData.mobile || DEFAULT_MOBILE_LAYOUT.mobile;
                    const hidden_mobile = layoutData.hidden_mobile || DEFAULT_MOBILE_LAYOUT.hidden_mobile;
                    const hidden_menu = layoutData.hidden_menu || [];
                    currentHiddenMenu = hidden_menu;

                    let sidebar = layoutData.sidebar || DEFAULT_DESKTOP_LAYOUT.sidebar;
                    const main = layoutData.main || DEFAULT_DESKTOP_LAYOUT.main;
                    const hidden = layoutData.hidden || DEFAULT_DESKTOP_LAYOUT.hidden;

                    // Ensure SidebarBrandWidget is present in Admin too (only if not hidden)
                    if (Array.isArray(sidebar) && !sidebar.includes('SidebarBrandWidget') && !hidden.includes('SidebarBrandWidget')) {
                        sidebar = ['SidebarBrandWidget', ...sidebar];
                    }

                    // Explicitly set each field to avoid spread issues
                    const finalLayout = {
                        sidebar,
                        main,
                        hidden,
                        mobile,
                        hidden_mobile,
                        hidden_menu
                    };

                    console.log('[Admin/Tampilan] Setting layout to:', JSON.stringify(finalLayout, null, 2));
                    setLayout(finalLayout);
                } else {
                    // No saved layout, use defaults
                    const defaultLayout = {
                        sidebar: DEFAULT_DESKTOP_LAYOUT.sidebar,
                        main: DEFAULT_DESKTOP_LAYOUT.main,
                        hidden: DEFAULT_DESKTOP_LAYOUT.hidden,
                        mobile: DEFAULT_MOBILE_LAYOUT.mobile,
                        hidden_mobile: DEFAULT_MOBILE_LAYOUT.hidden_mobile,
                        hidden_menu: []
                    };

                    console.log('[Admin/Tampilan] No saved layout, using defaults:', JSON.stringify(defaultLayout, null, 2));
                    setLayout(defaultLayout);
                }

                // 2. Handle Quick Menu Data
                if (menuData && Array.isArray(menuData) && menuData.length > 0) {
                    const hiddenIds = new Set(currentHiddenMenu);

                    // Filter out items from saved menu that are actually in hidden list
                    const visibleSavedMenu = menuData.filter((item: any) => !hiddenIds.has(item.id));

                    // Merge logic: Add default items that are missing from saved data AND not in hidden list
                    const savedIds = new Set(visibleSavedMenu.map((item: any) => item.id));

                    const missingDefaults = DEFAULT_MENU_ITEMS.filter(item =>
                        !savedIds.has(item.id) && !hiddenIds.has(item.id)
                    );

                    setMenuItems([...visibleSavedMenu, ...missingDefaults]);
                } else {
                    // If no saved menu data, use default but exclude hidden if any (though usually hidden implies saved layout)
                    if (currentHiddenMenu.length > 0) {
                        const visibleDefaults = DEFAULT_MENU_ITEMS.filter(item => !currentHiddenMenu.includes(item.id));
                        setMenuItems(visibleDefaults);
                    } else {
                        setMenuItems(DEFAULT_MENU_ITEMS);
                    }
                }
            })
            .catch(err => {
                console.error('[Admin/Tampilan] Failed to fetch settings:', err);
                // Fallback
                const fallbackLayout = {
                    sidebar: DEFAULT_DESKTOP_LAYOUT.sidebar,
                    main: DEFAULT_DESKTOP_LAYOUT.main,
                    hidden: DEFAULT_DESKTOP_LAYOUT.hidden,
                    mobile: DEFAULT_MOBILE_LAYOUT.mobile,
                    hidden_mobile: DEFAULT_MOBILE_LAYOUT.hidden_mobile,
                    hidden_menu: []
                };
                setLayout(fallbackLayout);
                setMenuItems(DEFAULT_MENU_ITEMS);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // ... existing handleDragEnd for widgets ...

    const findMenuContainer = (id: string) => {
        if (id === 'menu_items') return 'menu_items';
        if (id === 'hidden_menu') return 'hidden_menu';
        if (menuItems.find(i => i.id === id)) return 'menu_items';
        if (layout.hidden_menu.includes(id)) return 'hidden_menu';
        return undefined;
    };

    const handleMenuDragEnd = (event: any) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) {
            setActiveId(null);
            return;
        }

        const activeIdStr = String(active.id);
        const overIdStr = String(overId);

        // Determine containers
        // If we drop on a SortableItem, overId is the item ID.
        // If we drop on the empty container placeholder (which we haven't strictly defined as droppable, 
        // but SortableContext acts as one if empty?), actually dnd-kit handles this better if we check items.

        const activeContainer = findMenuContainer(activeIdStr);
        let overContainer = findMenuContainer(overIdStr);

        // Fallback: if overId is the container ID itself (if we made them droppable, which we haven't strictly)
        // But since we didn't use useDroppable on the container div, overId will always be an item ID unless
        // the list is empty? Wait, if list is empty, we can't drop?
        // We need to make the Container Droppable or ensure we can drop into empty lists.
        // For now, let's assume we drop onto an item.
        // If we move from Active to Hidden, but Hidden is empty... we can't drop on it?
        // We need to implement useDroppable for the containers to handle empty states effectively.
        // However, let's try to infer if overId is one of our context IDs? No dnd-kit doesn't do that by default.

        if (!activeContainer || !overContainer) {
            // Simplified logic: Check if we are over the other list's area?
            // Without useDroppable, we rely on items. If a list is empty, we are stuck?
            // Actually, let's just make it robust:
            // If dragging from active, and over is in hidden list => move.
            // But if hidden list is empty, we need a way.

            // Allow dropping anywhere for now if we can't find container?
            // Let's rely on what we found.
            if (!activeContainer) return;
        }

        if (activeContainer && overContainer) {
            const activeItems = activeContainer === 'menu_items' ? menuItems.map(i => i.id) : layout.hidden_menu;
            const overItems = overContainer === 'menu_items' ? menuItems.map(i => i.id) : layout.hidden_menu;

            const activeIndex = activeItems.indexOf(activeIdStr);
            const overIndex = overItems.indexOf(overIdStr);

            if (activeContainer === overContainer) {
                // Reorder within same list
                if (overIdStr === overContainer) return; // Dropped on background of same container

                if (activeContainer === 'menu_items') {
                    setMenuItems(items => arrayMove(items, activeIndex, overIndex));
                } else {
                    setLayout(prev => ({
                        ...prev,
                        hidden_menu: arrayMove(prev.hidden_menu, activeIndex, overIndex)
                    }));
                }
            } else {
                // Move between lists
                // Calculate target index if dropped on item, else end of list
                let targetIndex = overItems.length;
                if (overIdStr !== overContainer) {
                    targetIndex = overIndex;
                    // Logic for insert before/after could be added here similar to widgets, 
                    // but simple index usage is usually fine for grid items.
                }

                if (activeContainer === 'menu_items') {
                    // Active -> Hidden
                    const itemToMove = activeItems[activeIndex]; // ID string
                    setMenuItems(items => items.filter(i => i.id !== activeIdStr));

                    const newHidden = [...layout.hidden_menu];
                    // Insert at targetIndex
                    newHidden.splice(targetIndex, 0, activeIdStr);

                    setLayout(prev => ({
                        ...prev,
                        hidden_menu: newHidden
                    }));
                } else {
                    // Hidden -> Active
                    const itemObj = DEFAULT_MENU_ITEMS.find(i => i.id === activeIdStr);
                    if (itemObj) {
                        const newActive = [...menuItems];
                        // Insert at targetIndex
                        // Wait, menuItems is array of objects.
                        newActive.splice(targetIndex, 0, itemObj);

                        setMenuItems(newActive);
                        setLayout(prev => ({
                            ...prev,
                            hidden_menu: prev.hidden_menu.filter(id => id !== activeIdStr)
                        }));
                    }
                }
            }
        }

        setActiveId(null);
    };

    const handleMenuDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        const activeContainer = findContainer(activeIdStr, layout);
        const overContainer = findContainer(overIdStr, layout);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        // If they are between menu_items and hidden_menu, we can allow the visual swap if we want
        // But dnd-kit-sortable handleDragEnd is usually enough for simple cases.
    };

    // Auto-save logic
    useEffect(() => {
        if (loading) return;

        // Skip the first render (fetching initial data)
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(async () => {
            setSaving(true);
            console.log('[Admin/Tampilan/AutoSave] Saving layout:', JSON.stringify(layout, null, 2));
            console.log('[Admin/Tampilan/AutoSave] Saving menuItems:', menuItems);
            try {
                // Save Layout
                await fetch('/api/settings/layout', {
                    method: 'POST',
                    body: JSON.stringify(layout)
                });

                // Save Menu
                await fetch('/api/settings/quick-menu', {
                    method: 'POST',
                    body: JSON.stringify(menuItems)
                });

                console.log('[Admin/Tampilan/AutoSave] Save successful');
                setLastSaved(new Date());
            } catch (error) {
                console.error('[Admin/Tampilan/AutoSave] Failed to auto-save:', error);
                // Optionally show error toast here
            } finally {
                setSaving(false);
            }
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [layout, menuItems, loading]);

    const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

    if (loading) return <div>Loading...</div>;

    // Helper to get clean label
    const getLabel = (id: string) => {
        const cleanId = id.split(':')[0];
        return WIDGET_LABELS[cleanId] || cleanId;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Tampilan Depan</h1>
                    <p className="text-slate-500">Atur posisi dan visibilitas widget di halaman depan.</p>
                </div>
                <div className="flex items-center gap-3">
                    {saving ? (
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Menyimpan...</span>
                        </div>
                    ) : lastSaved ? (
                        <div className="flex items-center gap-2 text-teal-600 bg-teal-50 px-4 py-2 rounded-xl border border-teal-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Tersimpan otomatis</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('desktop')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'desktop' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Tampilan Desktop
                </button>
                <button
                    onClick={() => setActiveTab('mobile')}
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'mobile' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Tampilan Mobile
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {activeTab === 'desktop' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Sidebar Column */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold mb-4 text-slate-700 flex items-center justify-between">
                                Sidebar (Kiri)
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded-md text-slate-600">30%</span>
                            </h3>
                            <DroppableContainer id="sidebar">
                                <SortableContext items={layout.sidebar || []} strategy={verticalListSortingStrategy}>
                                    {layout.sidebar?.map((id: string) => (
                                        <SortableItem key={id} id={id} />
                                    ))}
                                    {(!layout.sidebar || layout.sidebar.length === 0) && (
                                        <div className="text-center py-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">Kosong</div>
                                    )}
                                </SortableContext>
                            </DroppableContainer>
                        </div>

                        {/* Main Content Column */}
                        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold mb-4 text-slate-700 flex items-center justify-between">
                                Konten Utama
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded-md text-slate-600">70%</span>
                            </h3>
                            <DroppableContainer id="main">
                                <SortableContext items={layout.main || []} strategy={verticalListSortingStrategy}>
                                    {layout.main?.map((id: string) => (
                                        <SortableItem key={id} id={id} />
                                    ))}
                                    {(!layout.main || layout.main.length === 0) && (
                                        <div className="text-center py-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">Kosong</div>
                                    )}
                                </SortableContext>
                            </DroppableContainer>
                        </div>

                        {/* Hidden / Disabled */}
                        <div className="md:col-span-3 bg-red-50 p-6 rounded-2xl border border-red-100 mt-4">
                            <h3 className="font-bold mb-4 text-red-800">Widget Disembunyikan (Desktop)</h3>
                            <DroppableContainer id="hidden">
                                <SortableContext items={layout.hidden || []} strategy={verticalListSortingStrategy}>
                                    {layout.hidden?.map((id: string) => (
                                        <SortableItem key={id} id={id} hidden />
                                    ))}
                                    {(!layout.hidden || layout.hidden.length === 0) && (
                                        <div className="text-center py-4 text-red-300 border-2 border-dashed border-red-200 rounded-xl">Geser widget ke sini untuk menyembunyikan</div>
                                    )}
                                </SortableContext>
                            </DroppableContainer>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        {/* Mobile Preview Column */}
                        <div className="bg-white p-4 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl min-h-[600px] relative overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>

                            <div className="pt-8 px-2 pb-4 h-full overflow-y-auto scrollbar-hide">
                                <h3 className="text-center font-bold mb-6 text-slate-400 text-sm uppercase tracking-widest">Mobile View</h3>

                                <SortableContext items={layout.mobile || []} strategy={verticalListSortingStrategy}>
                                    <DroppableContainer id="mobile">
                                        {layout.mobile?.map((id: string) => (
                                            <SortableItem key={id} id={id} />
                                        ))}
                                        {(!layout.mobile || layout.mobile.length === 0) && (
                                            <div className="text-center py-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl my-2">Kosong</div>
                                        )}
                                    </DroppableContainer>
                                </SortableContext>

                                <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
                                    <h3 className="text-center font-bold mb-4 text-slate-400 text-xs uppercase">Widget Disembunyikan</h3>
                                    <SortableContext items={layout.hidden_mobile || []} strategy={verticalListSortingStrategy}>
                                        <DroppableContainer id="hidden_mobile">
                                            {layout.hidden_mobile?.map((id: string) => (
                                                <SortableItem key={id} id={id} hidden />
                                            ))}
                                            {(!layout.hidden_mobile || layout.hidden_mobile.length === 0) && (
                                                <div className="text-center py-4 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl my-2">Kosong</div>
                                            )}
                                        </DroppableContainer>
                                    </SortableContext>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DragOverlay>
                    {activeId ? <div className="p-4 bg-white border border-teal-500 rounded-xl shadow-xl">{getLabel(String(activeId))}</div> : null}
                </DragOverlay>
            </DndContext>

            {/* Quick Menu Configuration Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Konfigurasi Menu Cepat</h2>
                        <p className="text-slate-500">Atur urutan item pada widget Menu Cepat (Grid).</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={(e) => setActiveId(e.active.id)}
                        onDragEnd={handleMenuDragEnd}
                    >
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">Menu Aktif</h3>
                            <DroppableContainer id="menu_items">
                                <SortableContext items={menuItems.map(i => i.id)} strategy={verticalListSortingStrategy} id="menu_items">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[100px] p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                        {menuItems.map((item) => (
                                            <SortableMenuItem key={item.id} item={item} />
                                        ))}
                                        {menuItems.length === 0 && <div className="col-span-full text-center text-slate-400 py-4">Tidak ada menu aktif. Geser ke sini untuk mengaktifkan.</div>}
                                    </div>
                                </SortableContext>
                            </DroppableContainer>
                        </div>

                        <div className="mt-8 bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="text-sm font-bold text-red-800 mb-4 uppercase tracking-widest">Menu Disembunyikan</h3>
                            <DroppableContainer id="hidden_menu">
                                <SortableContext items={layout.hidden_menu || []} strategy={verticalListSortingStrategy} id="hidden_menu">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[100px] p-4 bg-white/50 rounded-xl border-2 border-dashed border-red-200">
                                        {layout.hidden_menu.map((id) => {
                                            const item = DEFAULT_MENU_ITEMS.find(i => i.id === id);
                                            if (!item) return null;
                                            return <SortableMenuItem key={id} item={item} hidden />;
                                        })}
                                        {layout.hidden_menu.length === 0 && <div className="col-span-full text-center text-red-300 py-4 text-sm">Geser item ke sini untuk menyembunyikan.</div>}
                                    </div>
                                </SortableContext>
                            </DroppableContainer>
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <div className="p-3 bg-white border-2 border-teal-500 rounded-lg shadow-xl font-bold text-slate-800 flex items-center gap-3">
                                    {(() => {
                                        const item = menuItems.find(i => i.id === activeId) || DEFAULT_MENU_ITEMS.find(i => i.id === activeId);
                                        return (
                                            <>
                                                <div className={`w-6 h-6 rounded flex items-center justify-center ${item?.iconBg || 'bg-slate-100'}`}>
                                                    <span className={`text-[10px] ${item?.iconColor || 'text-slate-500'}`}>
                                                        {item?.label.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                {item?.label}
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

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
        </div>
    );
}

// Helper Component for Menu Item
function SortableMenuItem({ item, hidden }: { item: any, hidden?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 rounded-xl border flex items-center gap-3 cursor-grab hover:bg-slate-50 transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : hidden ? 'border-red-100 bg-white/80 opacity-70' : 'border-slate-200 bg-white'}`}
        >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg || 'bg-slate-100'}`}>
                <span className={`text-xs font-bold ${item.iconColor || 'text-slate-500'}`}>
                    {item.label.substring(0, 2).toUpperCase()}
                </span>
            </div>
            <span className="font-medium text-slate-700 text-sm">{item.label}</span>
        </div>
    );
}

function DroppableContainer({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}
