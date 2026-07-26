import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import WatchTimeCalculator from "./WatchTimeCalculator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How Long to Watch? - Anime Watch Time Calculator ",
  description:
    "Calculate how long it takes to watch any anime. Enter a single anime or paste your full watchlist to see total hours, days, and fun comparisons.",
  alternates: { canonical: "/watch-time" },
  openGraph: {
    images: [
      {
        url: `/api/og?title=How+Long+to+Watch%3F&subtitle=Anime+watch+time+calculator&type=tool`,
      },
    ],
  },
};

export default function WatchTimePage() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Tools", href: "/" },
          { label: "How Long to Watch?" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "How Long to Watch? - Anime Calculator",
            description:
              "Calculate how long it takes to watch anime. Enter a single anime or paste a watchlist to see total hours and fun comparisons.",
            url: "/watch-time",
            applicationCategory: "UtilitiesApplication",
          }),
        }}
      />

      <WatchTimeCalculator />

      <AdBanner className="mt-8 mb-8" />
    </div>
  );
}
