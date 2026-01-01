
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Syarat dan Ketentuan - PortalKajian.online',
    description: 'Syarat dan ketentuan penggunaan layanan PortalKajian.online.',
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 mb-8">
                Syarat dan Ketentuan
            </h1>

            <div className="prose prose-slate lg:prose-lg">
                <p className="lead text-lg text-slate-600 mb-8">
                    Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">1. Ketentuan Umum</h2>
                    <p>
                        Dengan mengakses situs web ini, Anda setuju untuk terikat oleh syarat dan ketentuan penggunaan ini, semua hukum dan peraturan yang berlaku, dan setuju bahwa Anda bertanggung jawab untuk mematuhi hukum setempat yang berlaku.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">2. Lisensi Penggunaan</h2>
                    <p>
                        Izin diberikan untuk mengunduh sementara satu salinan materi (informasi atau perangkat lunak) di situs web PortalKajian.online hanya untuk tampilan pribadi dan non-komersial.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">3. Penafian (Disclaimer)</h2>
                    <p>
                        Materi di situs web PortalKajian.online disediakan "apa adanya". PortalKajian.online tidak memberikan jaminan, tersurat maupun tersirat, dan dengan ini menolak dan meniadakan semua jaminan lainnya.
                    </p>
                    <p className="mt-4">
                        Informasi jadwal kajian dikumpulkan dari berbagai sumber publik. Kami berusaha seakurat mungkin, namun kami tidak menjamin keakuratan jadwal jika terjadi perubahan mendadak dari pihak penyelenggara.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">4. Batasan</h2>
                    <p>
                        Dalam hal apa pun PortalKajian.online atau pemasoknya tidak bertanggung jawab atas kerusakan apa pun (termasuk, tanpa batasan, kerusakan karena hilangnya data atau keuntungan, atau karena gangguan bisnis) yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan materi di situs web ini.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">5. Revisi dan Errata</h2>
                    <p>
                        Materi yang muncul di situs web PortalKajian.online dapat mencakup kesalahan teknis, tipografi, atau fotografi. PortalKajian.online dapat membuat perubahan pada materi yang terdapat di situs webnya kapan saja tanpa pemberitahuan.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">6. Tautan</h2>
                    <p>
                        PortalKajian.online belum meninjau semua situs yang tertaut ke situs webnya dan tidak bertanggung jawab atas isi dari situs tertaut tersebut.
                    </p>
                </section>
            </div>
        </div>
    );
}
