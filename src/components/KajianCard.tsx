'use client';

interface KajianCardProps {
    id: number;
    date: string;
    location: string;
    title: string;
    ustadz: string;
    imageUrl?: string;
}

import Link from 'next/link';

export default function KajianCard({ id, date, location, title, ustadz, imageUrl }: KajianCardProps) {
    return (
        <Link href={`/kajian/${id}`} className="flex-shrink-0 w-80 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 block hover:shadow-md transition-shadow">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-32 object-cover"
                />
            )}
            <div className="p-4">
                <p className="text-xs text-teal-600 font-bold mb-1">{date}</p>
                <p className="text-xs text-slate-500 mb-3">{location}</p>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{title}</h3>
                <p className="text-sm text-slate-600">{ustadz}</p>
            </div>
        </Link>
    );
}
