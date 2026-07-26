import { Metadata } from "next";
import CompareClient from "./CompareClient";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aniyume.net";

export const metadata: Metadata = {
  title: "Compare Anime - Side by Side Comparison Tool",
  description:
    "Compare two anime side by side. See differences in score, episodes, genres, studios, format, and more with visual comparison charts.",
  alternates: {
    canonical: `${SITE_URL}/compare`,
  },
  openGraph: {
    title: "Compare Anime - Side by Side | AniYume",
    description:
      "Compare two anime side by side. Score, episodes, genres, studios, format, and more.",
    url: `${SITE_URL}/compare`,
    images: [
      {
        url: "/api/og?title=Compare+Anime&subtitle=Side+by+Side+Comparison+Tool",
      },
    ],
  },
};

export default function ComparePage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Compare Anime - Side by Side Comparison Tool",
            description:
              "Compare two anime side by side. Score, episodes, genres, studios, format, and more.",
          }),
        }}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-brand-teal">Compare</span>{" "}
          <span className="text-brand-orange">Anime</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pick two anime and see how they stack up against each other. Search,
          select, and compare scores, episodes, genres, and more.
        </p>
      </div>

      <CompareClient />
    </div>
  );
}
