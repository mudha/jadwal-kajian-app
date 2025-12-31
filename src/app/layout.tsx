import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import AnalyticsTracker from "@/components/AnalyticsTracker";
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
  title: "PortalKajian.online - Info Kajian Sunnah Indonesia",
  description: "Portal lengkap jadwal kajian islami se-Indonesia. Cari kajian di sekitarmu dengan mudah melalui PortalKajian.online, lengkap dengan peta lokasi dan kontak admin.",
  keywords: ["kajian sunnah", "jadwal kajian", "kajian indonesia", "islam", "ustadz", "masjid"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
        suppressHydrationWarning
      >
        <AnalyticsTracker />
        <Navbar />
        <div className="mx-auto min-h-screen bg-white md:bg-transparent shadow-xl md:shadow-none max-w-md md:max-w-7xl md:px-0">
          <main className="md:container md:mx-auto">
            <GlobalPullToRefresh>
              {children}
            </GlobalPullToRefresh>
          </main>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
