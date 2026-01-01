'use client';

import { X, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface ProgressModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    progress?: number;        // 0-100 for progress bar
    currentStep?: number;     // e.g., 15
    totalSteps?: number;      // e.g., 25
    onClose?: () => void;
    showCloseButton?: boolean;
}

export default function ProgressModal({
    isOpen,
    title,
    message,
    progress = 0,
    currentStep,
    totalSteps,
    onClose,
    showCloseButton = true
}: ProgressModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={showCloseButton ? onClose : undefined}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    {showCloseButton && onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="space-y-4">
                    {/* Spinner */}
                    <div className="flex justify-center">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>

                    {/* Message */}
                    <p className="text-center text-slate-700 font-medium">
                        {message}
                    </p>

                    {/* Progress Bar */}
                    {progress > 0 && (
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-center font-semibold">
                                {Math.round(progress)}%
                            </p>
                        </div>
                    )}

                    {/* Step Counter */}
                    {currentStep !== undefined && totalSteps !== undefined && totalSteps > 0 && (
                        <p className="text-sm text-slate-600 text-center font-medium">
                            Progress: <span className="font-bold text-blue-600">{currentStep}/{totalSteps}</span> entries
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
