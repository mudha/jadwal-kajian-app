import Link from "next/link";
import { Calendar, LayoutDashboard, Database, Search, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left Column: Hero Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase animate-in fade-in slide-in-from-left-4 duration-700">
              <Zap className="w-4 h-4" />
              Platform Jadwal Kajian #1 di Indonesia
            </div>

            <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white animate-in fade-in slide-in-from-top-6 duration-1000">
              Dakwah Digital <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Lebih Mudah & Modern</span>
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Kelola jadwal kajian sunnah se-Indonesia dengan bantuan AI. Otomatisasi pendaftaran, pemetaan lokasi, dan sebar kebaikan dengan satu klik.
            </p>

            <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in zoom-in-95 duration-1000 delay-500">
              <Link
                href="/kajian"
                className="px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 flex items-center gap-3"
              >
                Cari Jadwal Kajian <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/admin/batch-input"
                className="px-8 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-lg transition-all backdrop-blur-sm hover:-translate-y-1 flex items-center gap-3"
              >
                Panel Kontributor
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-8 text-slate-500 text-sm font-medium animate-in fade-in delay-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Source Terpercaya
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> Fast AI Extraction
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview / Cards */}
          <div className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
            {/* Glassmorphism Card Stack */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>

            <div className="relative space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl hover:bg-white/[0.12] transition-all transform hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Batch Input</h3>
                    <p className="text-slate-400 text-sm">Automasi Ekstraksi Broadcast WA</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Cukup paste teks broadcast kajian yang panjang, AI Gemini kami akan memilah ustadz, tema, lokasi, dan tanggal secara presisi hanya dalam hitungan detik.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl hover:bg-white/[0.12] transition-all transform hover:scale-[1.02] translate-x-12 translate-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/50">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Public Dashboard</h3>
                    <p className="text-slate-400 text-sm">Tampilan Jadwal & Peta Interaktif</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Mudahkan jamaah menemukan kajian sunnah terdekat dengan visualisasi peta interaktif dan filter kota yang sangat intuitif.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 text-white font-black text-xl tracking-tighter">
          <Calendar className="w-6 h-6 text-blue-500" /> JADWAL KAJIAN
        </div>
        <div className="text-slate-500 text-sm">
          &copy; 2025 Jadwal Kajian Indonesia. Built for Ummat with excellence.
        </div>
        <div className="flex gap-6 text-slate-400 text-sm font-bold">
          <Link href="/kajian" className="hover:text-blue-400 transition-colors">Daftar Jadwal</Link>
          <Link href="/admin/batch-input" className="hover:text-blue-400 transition-colors">Admin Panel</Link>
        </div>
      </footer>
    </div>
  );
}
