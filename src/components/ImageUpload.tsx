'use client';
import { useState, useRef } from 'react';
import { Upload, Eye, Pencil, Trash2, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export default function ImageUpload({ value, onChange, label = "Gambar / Poster", className = "" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Harap upload file gambar.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB.');
            return;
        }

        setIsUploading(true);

        try {
            // 1. Get Auth Parameters from our API
            const authRes = await fetch('/api/imagekit-auth');
            const authData = await authRes.json();

            if (!authData.token) {
                throw new Error('Gagal mendapatkan parameter autentikasi ImageKit');
            }

            // 2. Upload directly to ImageKit
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', `flyer-${Date.now()}`);
            formData.append('publicKey', authData.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '');
            formData.append('signature', authData.signature);
            formData.append('expire', authData.expire.toString());
            formData.append('token', authData.token);
            formData.append('folder', '/flyers');

            const uploadRes = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await uploadRes.json();

            if (data.url) {
                onChange(data.url);
            } else {
                throw new Error(data.message || 'Upload ke ImageKit gagal');
            }
        } catch (e: any) {
            console.error('Upload error:', e);
            alert(`Gagal mengupload gambar: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        // Cari data gambar di clipboard
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    handleUpload(file);
                }
                break;
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleUpload(file);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">{label}</label>

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video w-full relative bg-slate-100 flex items-center justify-center overflow-hidden">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <a
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            title="Lihat Gambar"
                        >
                            <Eye className="w-5 h-5" />
                        </a>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    ref={containerRef}
                    onPaste={handlePaste}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                        // Fokuskan element agar bisa paste
                        containerRef.current?.focus();
                        fileInputRef.current?.click();
                    }}
                    tabIndex={0} // Agar div bisa menerima fokus untuk paste
                    className={`
                        relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all outline-none
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                        focus:border-primary focus:ring-2 focus:ring-primary/20
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-xs font-bold text-slate-500">Mengupload ke ImageKit...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:bg-white group-hover:text-primary transition-colors">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-600">Klik / Paste Gambar di sini</p>
                                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
            />
        </div>
    );
}
