import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ambulans Muslim Indonesia - PortalKajian.online',
    description: 'Layanan ambulans gratis, jemput pasien & pengurusan jenazah. Temukan layanan ambulance gratis terdekat untuk umat muslim.',
    openGraph: {
        title: 'Ambulans Muslim Indonesia - GRATIS',
        description: 'Jemput Pasien Rumah Sakit & Pengurusan Jenazah. Temukan layanan ambulance gratis terdekat untuk umat muslim.',
        type: 'website',
        images: ['https://portalkajian.online/icon-512.png'],
    },
};

export default function AmbulanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
