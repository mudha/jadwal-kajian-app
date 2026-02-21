import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sekolah Sunnah',
    description: 'Daftar sekolah sunnah, pesantren, dan madrasah bermanhaj salaf di seluruh Indonesia. Temukan sekolah sunnah terdekat di kota Anda.',
    openGraph: {
        title: 'Sekolah Sunnah - PortalKajian.online',
        description: 'Daftar sekolah sunnah, pesantren, dan madrasah bermanhaj salaf di seluruh Indonesia. Temukan sekolah sunnah terdekat di kota Anda.',
        url: 'https://portalkajian.online/sekolah-sunnah',
        siteName: 'PortalKajian.online',
        locale: 'id_ID',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sekolah Sunnah - PortalKajian.online',
        description: 'Daftar sekolah sunnah, pesantren, dan madrasah bermanhaj salaf di seluruh Indonesia.',
    },
};

export default function SekolahSunnahLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
