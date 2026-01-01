
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kebijakan Privasi - PortalKajian.online',
    description: 'Kebijakan privasi PortalKajian.online mengenai pengumpulan, penggunaan, dan perlindungan data pengguna.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600 mb-8">
                Kebijakan Privasi
            </h1>

            <div className="prose prose-slate lg:prose-lg">
                <p className="lead text-lg text-slate-600 mb-8">
                    Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">1. Pendahuluan</h2>
                    <p>
                        PortalKajian.online ("kami") menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan situs web kami.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">2. Informasi yang Kami Kumpulkan</h2>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600">
                        <li>
                            <strong>Informasi Perangkat:</strong> Kami secara otomatis mengumpulkan informasi tentang perangkat Anda, seperti alamat IP, jenis browser, dan sistem operasi untuk keperluan analitik anonim.
                        </li>
                        <li>
                            <strong>Data Lokasi:</strong> Jika Anda mengizinkan akses lokasi, kami menggunakan data tersebut hanya untuk menampilkan kajian terdekat dan arah kiblat. Data ini tidak disimpan di server kami.
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">3. Penggunaan Informasi</h2>
                    <p>Kami menggunakan informasi yang dikumpulkan untuk:</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                        <li>Menyediakan dan memelihara layanan kami.</li>
                        <li>Meningkatkan pengalaman pengguna.</li>
                        <li>Memantau penggunaan situs web kami untuk tujuan teknis.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">4. Cookies dan Penyimpanan Lokal</h2>
                    <p>
                        Kami menggunakan cookies dan Local Storage untuk menyimpan preferensi Anda (seperti filter pencarian atau mode tampilan). Anda dapat menginstruksikan browser Anda untuk menolak semua cookie.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">5. Keamanan Data</h2>
                    <p>
                        Keamanan data Anda penting bagi kami, namun perlu diingat bahwa tidak ada metode transmisi melalui Internet atau metode penyimpanan elektronik yang 100% aman.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">6. Tautan ke Situs Lain</h2>
                    <p>
                        Layanan kami mungkin berisi tautan ke situs lain yang tidak dioperasikan oleh kami (misalnya sumber peta Google Maps atau tautan YouTube). Kami menyarankan Anda untuk meninjau Kebijakan Privasi setiap situs yang Anda kunjungi.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">7. Hubungi Kami</h2>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman <a href="/hubungi-kami" className="text-teal-600 hover:underline">Hubungi Kami</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
