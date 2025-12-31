'use client';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle className="w-6 h-6 text-red-600" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            case 'info': return <Info className="w-6 h-6 text-blue-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger': return { bg: 'bg-red-50', iconBg: 'bg-red-100', confirmBtn: 'bg-red-600 hover:bg-red-700' };
            case 'warning': return { bg: 'bg-amber-50', iconBg: 'bg-amber-100', confirmBtn: 'bg-amber-600 hover:bg-amber-700' };
            case 'info': return { bg: 'bg-blue-50', iconBg: 'bg-blue-100', confirmBtn: 'bg-blue-600 hover:bg-blue-700' };
        }
    };

    const colors = getColors();

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Modal */}
            <div className={`bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden transition-all duration-200 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <div className={`p-6 border-b border-slate-100 flex items-center gap-4 ${colors.bg}`}>
                    <div className={`p-3 rounded-full ${colors.iconBg}`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-tight">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-white">
                    <p className="text-slate-600 font-medium leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200 ${colors.confirmBtn} disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
