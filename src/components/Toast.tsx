'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        info: 'bg-blue-600'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-100" />,
        error: <XCircle className="w-5 h-5 text-red-100" />,
        info: <AlertCircle className="w-5 h-5 text-blue-100" />
    };

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl shadow-slate-900/20 animate-in slide-in-from-top-4 fade-in duration-300 ${bgColors[type]}`}>
            <div className="shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-bold text-white tracking-wide">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white ml-2"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
