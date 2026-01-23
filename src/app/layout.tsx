import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import Footer from "@/components/Footer";
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://portalkajian.online'),
  title: {
    default: "PortalKajian.online - Info Kajian Sunnah Indonesia",
    template: "%s | PortalKajian.online"
  },
  description: "Portal lengkap jadwal kajian islami se-Indonesia. Cari kajian di sekitarmu dengan mudah melalui PortalKajian.online, lengkap dengan peta lokasi dan kontak admin.",
  keywords: ["kajian sunnah", "jadwal kajian", "kajian indonesia", "islam", "ustadz", "masjid", "kajian terdekat", "dakwah sunnah"],
  authors: [{ name: "PortalKajian Team" }],
  creator: "PortalKajian",
  publisher: "PortalKajian",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://portalkajian.online",
    siteName: "PortalKajian.online",
    title: "PortalKajian.online - Info Kajian Sunnah Indonesia",
    description: "Portal lengkap jadwal kajian islami se-Indonesia. Cari kajian di sekitarmu dengan mudah melalui PortalKajian.online.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "PortalKajian.online Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortalKajian.online - Info Kajian Sunnah Indonesia",
    description: "Portal lengkap jadwal kajian islami se-Indonesia. Cari kajian di sekitarmu.",
    images: ["/icon-512.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PortalKajian",
  },
  icons: {
    apple: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

import GlobalPullToRefresh from "@/components/GlobalPullToRefresh";

// ... existing imports ...

import { ThemeProvider } from "@/components/ThemeProvider";
import { useSettings, SettingsProvider } from '@/hooks/useSettings';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PortalKajian.online",
              "url": "https://portalkajian.online",
              "logo": "https://portalkajian.online/icon-512.png",
              "description": "Portal lengkap jadwal kajian islami se-Indonesia.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "url": "https://portalkajian.online/hubungi-kami"
              }
            })
          }}
        />
        <ThemeProvider>
          <SettingsProvider>
            <AnalyticsTracker />
            <Navbar />
            <div className="mx-auto min-h-screen bg-white dark:bg-slate-900 md:bg-transparent shadow-xl md:shadow-none max-w-md md:max-w-7xl md:px-0">
              <main className="md:container md:mx-auto">
                <GlobalPullToRefresh>
                  {children}
                </GlobalPullToRefresh>
                <Footer />
              </main>
              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
            </div>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
