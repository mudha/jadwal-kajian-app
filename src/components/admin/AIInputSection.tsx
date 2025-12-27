import { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon, PlusCircle, Play, Sparkles, X, FileText } from 'lucide-react';

interface AIInputSectionProps {
    onProcess: () => void;
    onAiProcess: () => void;
    onImageUpload: (file: File) => void;
    inputText: string;
    setInputText: (text: string) => void;
    lastImageUrl: string | null;
    setLastImageUrl: (url: string | null) => void;
    isOcrLoading: boolean;
    ocrProgress: number;
    isGeocoding: boolean;
    isAiLoading: boolean;
}

export default function AIInputSection({
    onProcess,
    onAiProcess,
    onImageUpload,
    inputText,
    setInputText,
    lastImageUrl,
    setLastImageUrl,
    isOcrLoading,
    ocrProgress,
    isGeocoding,
    isAiLoading
}: AIInputSectionProps) {
    return (
        <div className="flex flex-col gap-10 w-full">
            <div className="w-full">
                <div className="batch-card">
                    <div className="batch-card-header flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-slate-900">Alat Ekstraksi Cerdas</h3>
                        </div>
                    </div>
                    <div className="batch-card-body">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Image Upload */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                                        <ImageIcon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-lg tracking-tight text-slate-900">Scan Poster</h3>
                                </div>

                                <div
                                    onClick={() => document.getElementById('poster-upload')?.click()}
                                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-64 ${isOcrLoading ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'}`}
                                >
                                    <input
                                        id="poster-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                                    />

                                    {isOcrLoading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-12 h-12 mb-3">
                                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                    {ocrProgress}%
                                                </div>
                                            </div>
                                            <p className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">Membaca...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                            <p className="text-slate-900 font-bold text-xs text-center">Tap untuk Upload Poster</p>
                                            <p className="text-slate-400 font-medium text-[9px] text-center mt-1 uppercase tracking-widest">Format: JPG, PNG, WEBP</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Text Input */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-lg tracking-tight text-slate-900">Input Broadcast</h3>
                                </div>

                                <div className="relative">
                                    <textarea
                                        className="batch-textarea h-44"
                                        placeholder="Paste pesan broadcast di sini..."
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    {lastImageUrl && (
                                        <div className="absolute top-4 right-4 group">
                                            <div className="relative">
                                                <img src={lastImageUrl} className="w-16 h-16 object-cover rounded-xl border-4 border-white shadow-lg animate-in zoom-in-50 duration-300" />
                                                <button
                                                    onClick={() => setLastImageUrl(null)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onProcess}
                                        disabled={!inputText || isGeocoding}
                                        className="batch-btn batch-btn-primary py-3"
                                    >
                                        {isGeocoding ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        )}
                                        {isGeocoding ? 'Proses...' : 'Regex'}
                                    </button>

                                    <button
                                        onClick={onAiProcess}
                                        disabled={!inputText || isGeocoding || isAiLoading}
                                        className="batch-btn batch-btn-gradient py-3"
                                    >
                                        {isAiLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform text-yellow-300" />
                                        )}
                                        {isAiLoading ? 'AI...' : 'AI Gemini'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
