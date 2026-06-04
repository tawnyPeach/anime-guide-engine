import { Metadata } from "next";
import SearchPageClient from "@/components/SearchPageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.aniyume.net";

export const metadata: Metadata = {
  title: "Search Anime",
  description:
    "Search and discover anime with advanced filters. Filter by genre, year, score, format, and airing status to find your perfect anime.",
  alternates: {
    canonical: `${SITE_URL}/search`,
  },
  openGraph: {
    title: "Search Anime - Find Your Next Watch | AniYume",
    description:
      "Search and discover anime with advanced filters. Filter by genre, year, score, format, and airing status.",
    url: `${SITE_URL}/search`,
  },
};

export default function SearchPage() {
  return (
    <section className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Search Anime
        </h1>
        <p className="text-muted-foreground mt-1">
          Find your next watch with filters and real-time search
        </p>
      </div>
      <SearchPageClient />
    </section>
  );
}
