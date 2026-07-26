import { Metadata } from "next";
import ReviewsPageClient from "./ReviewsPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anime Reviews",
  description: "Browse and read user reviews for your favorite anime series. Share your thoughts and discover what others think.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Anime Reviews | AniYume",
    description: "Browse and read user reviews for your favorite anime series.",
    images: [{ url: "/api/og?title=Anime+Reviews&subtitle=User+Reviews+for+Your+Favorite+Anime" }],
  },
};

export default function ReviewsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          <span className="text-brand-teal">Anime</span> <span className="text-brand-orange">Reviews</span>
        </h1>
        <p className="text-muted-foreground">
          Browse community reviews or share your own thoughts on anime you&apos;ve watched.
        </p>
      </div>
      <ReviewsPageClient />
    </div>
  );
}
