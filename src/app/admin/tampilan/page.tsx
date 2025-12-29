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
                    {WIDGET_LABELS[id] || id}
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
    const [layout, setLayout] = useState({
        sidebar: [],
        main: [],
        hidden: []
    });
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        fetch('/api/settings/layout')
            .then(res => res.json())
            .then(data => {
                setLayout(data);
                setLoading(false);
            });
    }, []);

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

    const saveLayout = async () => {
        await fetch('/api/settings/layout', {
            method: 'POST',
            body: JSON.stringify(layout)
        });
        alert('Tampilan berhasil disimpan!');
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kelola Tampilan Depan</h1>
                    <p className="text-slate-500">Atur posisi dan visibilitas widget di halaman depan.</p>
                </div>
                <button onClick={saveLayout} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-teal-700">
                    Simpan Perubahan
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Column */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold mb-4 text-slate-700 flex items-center justify-between">
                            Sidebar (Kiri)
                            <span className="text-xs bg-slate-200 px-2 py-1 rounded-md text-slate-600">Desktop Only</span>
                        </h3>
                        <SortableContext items={layout.sidebar} strategy={verticalListSortingStrategy}>
                            {layout.sidebar.map((id: string) => (
                                <SortableItem key={id} id={id} />
                            ))}
                        </SortableContext>
                    </div>

                    {/* Main Content Column */}
                    <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold mb-4 text-slate-700">Konten Utama</h3>
                        <SortableContext items={layout.main} strategy={verticalListSortingStrategy}>
                            {layout.main.map((id: string) => (
                                <SortableItem key={id} id={id} />
                            ))}
                        </SortableContext>
                    </div>

                    {/* Hidden / Disabled */}
                    <div className="md:col-span-3 bg-red-50 p-6 rounded-2xl border border-red-100 mt-4">
                        <h3 className="font-bold mb-4 text-red-800">Widget Disembunyikan</h3>
                        <SortableContext items={layout.hidden} strategy={verticalListSortingStrategy}>
                            {layout.hidden.map((id: string) => (
                                <SortableItem key={id} id={id} hidden />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? <div className="p-4 bg-white border border-teal-500 rounded-xl shadow-xl">{WIDGET_LABELS[activeId] || activeId}</div> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
