import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import BackToTop from "@/components/BackToTop";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://aniyume.com'),
  title: {
    default: "AniYume - Anime Filler Lists, Watch Orders & Episode Guides",
    template: "%s | AniYume",
  },
  description:
    "Your ultimate resource for anime filler guides, watch orders, and episode lists. Skip the filler, watch what matters.",
  keywords: [
    "anime filler list",
    "anime watch order",
    "anime episode guide",
    "skip filler episodes",
    "anime guide",
  ],
  authors: [{ name: "AniYume" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AniYume",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="dark">
      <head>
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider>
          <Header />
          <Sidebar />
          <main className="flex-1 md:ml-[68px] pt-14 md:pt-16 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
