'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';

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
        hidden: string[];
        hidden_mobile: string[];
    }>({
        sidebar: [],
        main: [],
        mobile: [],
        hidden: [],
        hidden_mobile: []
    });
    const [loading, setLoading] = useState(true);
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
                    const newIndex = prev[overContainer].indexOf(over.id);
                    return {
                        ...prev,
                        [activeContainer]: arrayMove(prev[activeContainer], oldIndex, newIndex)
                    };
                } else {
                    // Moving between containers logic (simplified for now to just reordering within same list)
                    // For simplicity, we might only allow reordering within the same section for MVP
                    // Or we implement full drag between lists.
                    // Let's implement full drag between lists.
                    const activeItems = prev[activeContainer];
                    const overItems = prev[overContainer];
                    const activeIndex = activeItems.indexOf(active.id);
                    const overIndex = overItems.indexOf(over.id);

                    let newIndex;
                    if (over.id in prev) {
                        // We're over a container
                        newIndex = overItems.length + 1;
                    } else {
                        const isBelowOverItem =
                            over &&
                            active.rect.current.translated &&
                            active.rect.current.translated.top >
                            over.rect.top + over.rect.height;

                        const modifier = isBelowOverItem ? 1 : 0;

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
        if (id in currentLayout) return id;
        return Object.keys(currentLayout).find(key => currentLayout[key].includes(id));
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
        { id: 'dzikir', label: 'Dzikir', iconName: 'BookText', href: '/dzikir', gradient: 'from-teal-500 to-teal-600', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
        { id: 'jadwal-sholat', label: 'Jadwal Sholat', iconName: 'Clock', href: '/jadwal-sholat', gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
        { id: 'kajian-online', label: 'Kajian Online', iconName: 'Video', href: '/kajian?online=true', gradient: 'from-violet-500 to-violet-600', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
        { id: 'kajian-muslimah', label: 'Kajian Muslimah', iconName: 'Flower2', href: '/kajian?muslimah=true', gradient: 'from-pink-500 to-pink-600', iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
        { id: 'kajian-terdekat', label: 'Kajian Terdekat', iconName: 'MapPin', href: '/kajian?nearby=true', gradient: 'from-amber-500 to-amber-600', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
        { id: 'hubungi-kami', label: 'Hubungi Kami', iconName: 'MessageCircle', href: '/hubungi-kami', gradient: 'from-slate-500 to-slate-600', iconBg: 'bg-slate-50', iconColor: 'text-slate-600' },
        { id: 'catatan-kajian', label: 'Catatan Kajian', iconName: 'FileText', href: '/catatan-kajian', gradient: 'from-indigo-500 to-indigo-600', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
        { id: 'kalender-puasa', label: 'Kalender Puasa', iconName: 'Calendar', href: '/kalender-puasa', gradient: 'from-green-500 to-green-600', iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { id: 'cari-masjid', label: 'Cari Masjid', iconName: 'Home', href: '/masjid', gradient: 'from-red-500 to-red-600', iconBg: 'bg-red-50', iconColor: 'text-red-600' },
    ];

    useEffect(() => {
        // Fetch Layout
        fetch('/api/settings/layout')
            .then(res => res.json())
            .then(data => {
                if (data && (data.sidebar || data.main)) {
                    const mobile = data.mobile || DEFAULT_MOBILE_LAYOUT.mobile;
                    const hidden_mobile = data.hidden_mobile || DEFAULT_MOBILE_LAYOUT.hidden_mobile;

                    let sidebar = data.sidebar || DEFAULT_DESKTOP_LAYOUT.sidebar;
                    const main = data.main || DEFAULT_DESKTOP_LAYOUT.main;
                    const hidden = data.hidden || DEFAULT_DESKTOP_LAYOUT.hidden;

                    // Ensure SidebarBrandWidget is present in Admin too
                    if (Array.isArray(sidebar) && !sidebar.includes('SidebarBrandWidget')) {
                        sidebar = ['SidebarBrandWidget', ...sidebar];
                    }

                    setLayout({ ...data, sidebar, main, hidden, mobile, hidden_mobile });
                } else {
                    setLayout({
                        ...DEFAULT_DESKTOP_LAYOUT,
                        ...DEFAULT_MOBILE_LAYOUT
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch layout:', err);
                setLayout({
                    ...DEFAULT_DESKTOP_LAYOUT,
                    ...DEFAULT_MOBILE_LAYOUT
                });
                setLoading(false);
            });

        // Fetch Quick Menu
        fetch('/api/settings/quick-menu')
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data) && data.length > 0) {
                    setMenuItems(data);
                } else {
                    setMenuItems(DEFAULT_MENU_ITEMS);
                }
                setLoading(false);
            });
    }, []);

    // ... existing handleDragEnd for widgets ...

    const handleMenuDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setMenuItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const saveLayout = async () => {
        // Save Layout
        await fetch('/api/settings/layout', {
            method: 'POST',
            body: JSON.stringify(layout)
        });

        // Save Menu
        // We need to ensure we save the full object structure expected by frontend
        // Currently menuItems in state only has minimal props? 
        // Wait, if we pull from default, we might miss properties if we used a simplified DEFAULT list in Admin.
        // I used simplified DEFAULT_MENU_ITEMS above. 
        // IMPORTANT: The admin needs the FULL object to save back, otherwise we lose icons/hrefs.
        // I should update DEFAULT_MENU_ITEMS in Admin to match `QuickMenu.tsx` defaults fully or at least fetch the full object structure.
        // Actually, easiest way: 
        // 1. Initial load gets full object.
        // 2. If default, use full default object.
        // 3. Save sends back whatever is in state.

        // Let's ensure my DEFAULT_MENU_ITEMS here has all fields needed.
        // See updated replacement block below for full fields.

        await fetch('/api/settings/quick-menu', {
            method: 'POST',
            body: JSON.stringify(menuItems)
        });

        alert('Tampilan dan Menu berhasil disimpan!');
    };

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
                <button onClick={saveLayout} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700">
                    Simpan Perubahan
                </button>
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
                            <SortableContext items={layout.sidebar || []} strategy={verticalListSortingStrategy}>
                                {layout.sidebar?.map((id: string) => (
                                    <SortableItem key={id} id={id} />
                                ))}
                            </SortableContext>
                        </div>

                        {/* Main Content Column */}
                        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <h3 className="font-bold mb-4 text-slate-700 flex items-center justify-between">
                                Konten Utama
                                <span className="text-xs bg-slate-200 px-2 py-1 rounded-md text-slate-600">70%</span>
                            </h3>
                            <SortableContext items={layout.main || []} strategy={verticalListSortingStrategy}>
                                {layout.main?.map((id: string) => (
                                    <SortableItem key={id} id={id} />
                                ))}
                            </SortableContext>
                        </div>

                        {/* Hidden / Disabled */}
                        <div className="md:col-span-3 bg-red-50 p-6 rounded-2xl border border-red-100 mt-4">
                            <h3 className="font-bold mb-4 text-red-800">Widget Disembunyikan (Desktop)</h3>
                            <SortableContext items={layout.hidden || []} strategy={verticalListSortingStrategy}>
                                {layout.hidden?.map((id: string) => (
                                    <SortableItem key={id} id={id} hidden />
                                ))}
                            </SortableContext>
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
                                    {layout.mobile?.map((id: string) => (
                                        <SortableItem key={id} id={id} />
                                    ))}
                                </SortableContext>

                                <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
                                    <h3 className="text-center font-bold mb-4 text-slate-400 text-xs uppercase">Widget Disembunyikan</h3>
                                    <SortableContext items={layout.hidden_mobile || []} strategy={verticalListSortingStrategy}>
                                        {layout.hidden_mobile?.map((id: string) => (
                                            <SortableItem key={id} id={id} hidden />
                                        ))}
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
                        <SortableContext items={menuItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {menuItems.map((item) => (
                                    <SortableMenuItem key={item.id} item={item} />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {activeId && menuItems.find(i => i.id === activeId) ? (
                                <div className="p-3 bg-white border-2 border-teal-500 rounded-lg shadow-xl font-bold text-slate-800">
                                    {menuItems.find(i => i.id === activeId)?.label}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}

// Helper Component for Menu Item
function SortableMenuItem({ item }: { item: any }) {
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
            className={`p-4 rounded-xl border flex items-center gap-3 cursor-grab hover:bg-slate-50 transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}
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
