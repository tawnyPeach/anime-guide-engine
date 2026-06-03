import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://animeguideengine.com'),
  title: {
    default: "Anime Guide Engine - Filler Lists, Watch Orders & Episode Guides",
    template: "%s | Anime Guide Engine",
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
  authors: [{ name: "Anime Guide Engine" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Anime Guide Engine",
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
      <body className={`${inter.className} bg-[#0a0a1a] text-gray-100 min-h-screen flex flex-col`}>
        {/* Background gradient mesh */}
        <div className="fixed inset-0 gradient-mesh-bg -z-10" aria-hidden="true" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
