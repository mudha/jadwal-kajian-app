'use client';

import { Phone } from 'lucide-react';

export default function ContactWidget() {
    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-100 group cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform" />
            <div className="relative z-10 flex flex-col gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Phone className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-black text-lg">Butuh Bantuan?</h4>
                    <p className="text-blue-100 text-xs font-medium">Hubungi admin via WhatsApp untuk info kajian.</p>
                </div>
                <a href="https://wa.me/6281392135904" target="_blank" className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-black text-xs text-center hover:bg-blue-50 transition-colors shadow-sm">
                    Chat Admin
                </a>
            </div>
        </div>
    );
}
