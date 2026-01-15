import { Metadata, ResolvingMetadata } from 'next';
import db from '@/lib/db';
import KajianDetailClient from './KajianDetailClient';
import { formatMasjidName } from '@/lib/date-utils';

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM kajian WHERE id = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return {
                title: 'Kajian Tidak Ditemukan - PortalKajian.online',
            }
        }

        const kajian = result.rows[0];
        const tema = (kajian.tema as string) || 'Kajian Sunnah';
        const pemateri = (kajian.pemateri as string) || 'Ustadz';
        const masjid = formatMasjidName((kajian.masjid as string) || '');
        const date = (kajian.date as string) || '';
        const city = (kajian.city as string) || '';
        const waktu = (kajian.waktu as string) || '';

        // Create a compelling title (Limit length carefully)
        let title = `${tema} - ${pemateri}`;
        if (title.length > 60) title = title.substring(0, 57) + '...';

        // Create a detailed description
        const description = `Insyaallah Hadirilah! Kajian ${tema} bersama ${pemateri} di ${masjid}, ${city}. \n📅 ${date}\n⏰ ${waktu}\nKlik untuk detail lengkap.`;

        // Image handling: Use absolute URL if possible or specific default
        let imageUrl = (kajian.imageUrl as string);
        if (!imageUrl) {
            // Fallback logic similar to parser
            const isFriday = tema.toLowerCase().includes('jumat') || waktu.toLowerCase().includes('jumat');
            imageUrl = isFriday
                ? 'https://portalkajian.online/images/khutbah-jumat-cover.png'
                : 'https://portalkajian.online/images/default-kajian.png';
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [{
                    url: imageUrl,
                    width: 800,
                    height: 600,
                    alt: tema
                }],
                type: 'article',
                siteName: 'PortalKajian.online',
                locale: 'id_ID',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            }
        }

    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Detail Kajian - PortalKajian.online',
            description: 'Info Kajian Sunnah Indonesia Lengkap'
        }
    }
}

export default function Page() {
    return <KajianDetailClient />
}
