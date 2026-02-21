import { Metadata } from 'next';
import db from '@/lib/db';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;

        const result = await db.execute({
            sql: `SELECT nama, kota, jenjang, deskripsi FROM sekolah WHERE slug = ?`,
            args: [slug]
        });

        if (result.rows.length === 0) {
            return {
                title: 'Sekolah Tidak Ditemukan - PortalKajian.online',
            };
        }

        const school = result.rows[0];
        const { nama, kota, jenjang, deskripsi } = school;
        const descText = deskripsi ? (deskripsi as string).substring(0, 160) : `Informasi sekolah ${jenjang} ${nama} di kota ${kota}. Temukan jadwal kajian dan info lengkap di PortalKajian.online.`;

        return {
            title: `${jenjang} ${nama} - ${kota} | PortalKajian.online`,
            description: descText,
            openGraph: {
                title: `${jenjang} ${nama} - ${kota}`,
                description: descText,
                url: `https://portalkajian.online/sekolah-sunnah/${slug}`,
                siteName: 'PortalKajian.online',
                locale: 'id_ID',
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${jenjang} ${nama} - ${kota}`,
                description: descText,
            },
        };
    } catch (error) {
        console.error('Error fetching metadata for sekolah:', error);
        return {
            title: 'Sekolah Sunnah - PortalKajian.online',
        };
    }
}

export default function SekolahDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
