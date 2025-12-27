import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import AnalyticsTracker from "@/components/AnalyticsTracker";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AnalyticsTracker />
        <Navbar />
        <div className="mx-auto min-h-screen bg-white md:bg-transparent shadow-xl md:shadow-none max-w-md md:max-w-7xl md:px-0">
          <main className="md:container md:mx-auto">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
