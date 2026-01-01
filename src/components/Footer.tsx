import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="mt-auto py-8 px-6 bg-slate-50 border-t border-slate-100/50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:items-start items-center text-center md:text-left gap-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-teal-600 p-1.5 rounded-lg text-white">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">PortalKajian.online</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-[250px]">
                        Platform informasi kajian sunnah terlengkap di Indonesia. Semoga bermanfaat untuk umat.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                    <Link href="/privacy-policy" className="hover:text-teal-600 transition-colors">
                        Kebijakan Privasi
                    </Link>
                    <Link href="/terms" className="hover:text-teal-600 transition-colors">
                        Syarat & Ketentuan
                    </Link>
                    <Link href="/hubungi-kami" className="hover:text-teal-600 transition-colors">
                        Hubungi Kami
                    </Link>
                    <a href="https://wa.me/6281392135904" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">
                        Kontak Admin
                    </a>
                </div>

                <div className="text-[10px] text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} PortalKajian. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
