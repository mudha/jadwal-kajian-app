import { Zap } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-teal-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-teal-500 fill-teal-500 animate-pulse" />
                </div>
            </div>
            <p className="mt-4 text-slate-500 text-sm font-medium animate-pulse">
                Memuat data...
            </p>
        </div>
    );
}
