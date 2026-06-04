import { Metadata } from "next";
import prisma from "@/lib/prisma";
import AnimeCard from "@/components/AnimeCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

function formatStudioName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function studioToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const studioName = formatStudioName(slug);

  return {
    title: `${studioName} Anime - All Series & Movies | AniYume`,
    description: `Browse all anime produced by ${studioName}. Complete list of ${studioName} anime series and movies ranked by popularity.`,
    alternates: { canonical: `/studio/${slug}` },
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(studioName + " Anime")}&subtitle=All+series+and+movies&type=studio`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  try {
    const allAnime = await prisma.anime.findMany({
      select: { studios: true },
      where: { studios: { not: null } },
    });

    const studioSet = new Set<string>();
    for (const anime of allAnime) {
      const studios: string[] = JSON.parse(anime.studios || "[]");
      studios.forEach((s) => studioSet.add(s));
    }

    return Array.from(studioSet)
      .slice(0, 50)
      .map((studio) => ({ slug: studioToSlug(studio) }));
  } catch {
    return [];
  }
}

export default async function StudioPage({ params }: Props) {
  const { slug } = await params;
  const studioName = formatStudioName(slug);

  let allAnime: Awaited<ReturnType<typeof prisma.anime.findMany>> = [];
  try {
    allAnime = await prisma.anime.findMany({
      where: {
        studios: { contains: studioName },
      },
      orderBy: { popularity: "desc" },
    });
  } catch {
    // Graceful degradation
  }

  // If no results with formatted name, try case-insensitive matching
  if (allAnime.length === 0) {
    try {
      const allWithStudios = await prisma.anime.findMany({
        where: { studios: { not: null } },
        orderBy: { popularity: "desc" },
      });

      allAnime = allWithStudios.filter((anime) => {
        const studios: string[] = JSON.parse(anime.studios || "[]");
        return studios.some(
          (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "") === slug.replace(/-/g, "")
        );
      });
    } catch {
      // Graceful degradation
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Studios", href: "/" },
          { label: studioName },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${studioName} Anime`,
            description: `All anime produced by ${studioName} studio.`,
          }),
        }}
      />

      <div className="relative mb-8">
        <div className="absolute inset-0 hero-gradient rounded-xl opacity-50" />
        <div className="relative py-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            {studioName} Anime
          </h1>
          <p className="text-gray-400 text-lg">
            {allAnime.length} anime produced by {studioName}
          </p>
        </div>
      </div>

      <AdBanner className="mb-8" />

      {allAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {allAnime.map((anime, index) => (
            <div key={anime.id} className="relative">
              <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
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
        <div className="bg-anime-card rounded-xl p-8 text-center mb-8 border border-anime-border">
          <p className="text-gray-400">
            No anime found for this studio. The studio name may be spelled differently in our database.
          </p>
        </div>
      )}

      <AdBanner className="mb-8" />
    </div>
  );
}
