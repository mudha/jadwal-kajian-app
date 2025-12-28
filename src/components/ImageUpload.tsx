'use client';
import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';

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

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        // Use Cloudinary if configured, otherwise fallback to local API
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        try {
            let url = '';

            if (cloudName && uploadPreset) {
                // Upload to Cloudinary
                formData.append('upload_preset', uploadPreset);
                formData.append('folder', 'jadwal-kajian');

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (data.secure_url) {
                    url = data.secure_url;
                } else {
                    throw new Error(data.error?.message || 'Upload ke Cloudinary gagal');
                }
            } else {
                // Fallback to local API (legacy)
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.url) {
                    url = data.url;
                } else {
                    throw new Error('Upload lokal gagal');
                }
            }

            onChange(url);
        } catch (e: any) {
            console.error('Upload error:', e);
            alert(`Gagal mengupload gambar: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) handleUpload(file);
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
                            title="Lihat Gambar Full"
                        >
                            <Eye className="w-5 h-5" />
                        </a>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            title="Ganti Gambar"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all transform hover:scale-110"
                            title="Hapus Gambar"
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
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-xs font-bold text-slate-500">Mengupload...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-slate-100 rounded-full text-slate-400 group-hover:bg-white group-hover:text-blue-500 transition-colors">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-600">Klik Upload atau Paste (Ctrl+V)</p>
                                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Max 2MB)</p>
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
