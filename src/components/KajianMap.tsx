'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { KajianEntry } from '@/lib/parser';

// Fix Leaflet marker icon issue
const customIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

interface KajianMapProps {
    items: (KajianEntry & { id: number })[];
}

export default function KajianMap({ items }: KajianMapProps) {
    // Center on Indonesia by default
    const defaultCenter: [number, number] = [-6.200000, 106.816666]; // Jakarta

    // Filter only items with coordinates
    const markers = items.filter(item => item.lat && item.lng);

    return (
        <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm z-0">
            <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map(kajian => (
                    <Marker
                        key={kajian.id}
                        position={[kajian.lat!, kajian.lng!]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="p-1 font-sans">
                                <p className="font-black text-slate-900 m-0">{kajian.masjid}</p>
                                <p className="text-xs text-slate-500 m-0 mb-2">{kajian.pemateri}</p>
                                <p className="text-[10px] font-bold text-blue-600 m-0 uppercase tracking-tighter">{kajian.tema}</p>
                                <a
                                    href={kajian.gmapsUrl}
                                    target="_blank"
                                    className="text-[10px] text-blue-500 underline block mt-2"
                                >
                                    Buka di Google Maps
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
