'use client';

import { ShieldCheck } from 'lucide-react';

export default function SidebarBrandWidget() {
    return (
        <div className="hidden lg:block bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
                <div className="bg-teal-600 p-2 rounded-xl text-white shadow-lg shadow-teal-100">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-black text-lg text-slate-900 leading-tight">PortalKajian</h1>
                    <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Online</p>
                </div>
            </div>
        </div>
    );
}
