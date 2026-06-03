import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import {
  generateGenrePageContent,
  generateMetaTitle,
  generateMetaDescription,
} from "@/lib/content-generator";

export const revalidate = 86400;

interface Props {
  params: Promise<{ genre: string }>;
}

function formatGenreName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { genre } = await params;
  const genreName = formatGenreName(genre);

  return {
    title: generateMetaTitle("genre", undefined, genreName),
    description: generateMetaDescription("genre", undefined, genreName),
  };
}

export async function generateStaticParams() {
  const genres = [
    "action", "adventure", "comedy", "drama", "fantasy",
    "horror", "mystery", "romance", "sci-fi", "thriller",
    "sports", "supernatural", "slice-of-life", "mecha",
  ];
  return genres.map((genre) => ({ genre }));
}

export default async function GenrePage({ params }: Props) {
  const { genre } = await params;
  const genreName = formatGenreName(genre);

  // Find anime that contain this genre
  const allAnime = await prisma.anime.findMany({
    where: {
      genres: { contains: genreName },
    },
    orderBy: { popularity: "desc" },
    take: 50,
  });

  const content = generateGenrePageContent(genreName, allAnime.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Genres", href: "/" },
          { label: `${genreName} Anime` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Best ${genreName} Anime`,
            description: `Top ${genreName.toLowerCase()} anime series ranked by popularity.`,
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        Best {genreName} Anime
      </h1>
      <p className="text-gray-400 text-lg mb-8">
        Top {allAnime.length} {genreName.toLowerCase()} anime series ranked by
        popularity
      </p>

      {/* Content */}
      <article className="prose prose-invert max-w-none mb-8">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }}
        />
      </article>

      <AdBanner className="mb-8" />

      {/* Anime Grid */}
      {allAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {allAnime.map((anime, index) => (
            <div key={anime.id} className="relative">
              <span className="absolute top-2 left-2 z-10 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                #{index + 1}
              </span>
              <AnimeCard
                title={anime.title}
                titleEnglish={anime.titleEnglish}
                slug={anime.slug}
                coverImage={anime.coverImage}
                genres={JSON.parse(anime.genres || "[]")}
                totalEpisodes={anime.totalEpisodes}
                averageScore={anime.averageScore}
                status={anime.status}
                seasonYear={anime.seasonYear}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
          <p className="text-gray-400">
            No anime found for this genre yet. Check back after running the seed
            script.
          </p>
        </div>
      )}

      <AdBanner className="mb-8" />

      {/* Related Genres */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Explore More Genres
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Action", "Adventure", "Comedy", "Drama", "Fantasy",
            "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
            "Sports", "Supernatural",
          ]
            .filter((g) => g.toLowerCase() !== genreName.toLowerCase())
            .map((g) => (
              <a
                key={g}
                href={`/genre/${g.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 text-sm transition-colors"
              >
                {g}
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
