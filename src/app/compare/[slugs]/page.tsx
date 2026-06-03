import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";

export const revalidate = 86400;

interface Props {
  params: Promise<{ slugs: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parts = slugs.split("-vs-");
  if (parts.length !== 2) return { title: "Compare Anime" };

  const [slug1, slug2] = parts;
  let anime1, anime2;
  try {
    anime1 = await prisma.anime.findUnique({ where: { slug: slug1 } });
    anime2 = await prisma.anime.findUnique({ where: { slug: slug2 } });
  } catch {
    return { title: "Compare Anime" };
  }

  const title1 = anime1?.titleEnglish || anime1?.title || slug1;
  const title2 = anime2?.titleEnglish || anime2?.title || slug2;

  return {
    title: `${title1} vs ${title2} - Anime Comparison | Anime Guide Engine`,
    description: `Compare ${title1} and ${title2} side by side. See differences in score, episodes, genres, studios, and more.`,
    alternates: { canonical: `/compare/${slugs}` },
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title1 + " vs " + title2)}&subtitle=Anime+Comparison&type=compare`,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  try {
    const topAnime = await prisma.anime.findMany({
      select: { slug: true, genres: true },
      orderBy: { popularity: "desc" },
      take: 30,
    });

    const params: { slugs: string }[] = [];
    for (const anime of topAnime) {
      const genres: string[] = JSON.parse(anime.genres || "[]");
      if (genres.length === 0) continue;

      // Find the first similar anime (shares a genre)
      const similar = topAnime.find(
        (a) =>
          a.slug !== anime.slug &&
          JSON.parse(a.genres || "[]").some((g: string) => genres.includes(g))
      );

      if (similar) {
        const slugsStr = `${anime.slug}-vs-${similar.slug}`;
        if (!params.some((p) => p.slugs === slugsStr)) {
          params.push({ slugs: slugsStr });
        }
      }

      if (params.length >= 30) break;
    }

    return params;
  } catch {
    return [];
  }
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parts = slugs.split("-vs-");

  if (parts.length !== 2) notFound();
  const [slug1, slug2] = parts;

  let anime1, anime2;
  try {
    anime1 = await prisma.anime.findUnique({ where: { slug: slug1 } });
    anime2 = await prisma.anime.findUnique({ where: { slug: slug2 } });
  } catch {
    notFound();
  }

  if (!anime1 || !anime2) notFound();

  const genres1: string[] = JSON.parse(anime1.genres || "[]");
  const genres2: string[] = JSON.parse(anime2.genres || "[]");
  const studios1: string[] = JSON.parse(anime1.studios || "[]");
  const studios2: string[] = JSON.parse(anime2.studios || "[]");

  const sharedGenres = genres1.filter((g) => genres2.includes(g));
  const title1 = anime1.titleEnglish || anime1.title;
  const title2 = anime2.titleEnglish || anime2.title;

  const comparisonRows = [
    {
      label: "Score",
      val1: anime1.averageScore ? `${(anime1.averageScore / 10).toFixed(1)}/10` : "N/A",
      val2: anime2.averageScore ? `${(anime2.averageScore / 10).toFixed(1)}/10` : "N/A",
      winner: (anime1.averageScore || 0) > (anime2.averageScore || 0) ? 1 : (anime2.averageScore || 0) > (anime1.averageScore || 0) ? 2 : 0,
    },
    {
      label: "Episodes",
      val1: anime1.totalEpisodes > 0 ? String(anime1.totalEpisodes) : "N/A",
      val2: anime2.totalEpisodes > 0 ? String(anime2.totalEpisodes) : "N/A",
      winner: 0,
    },
    {
      label: "Popularity",
      val1: anime1.popularity ? `#${anime1.popularity.toLocaleString()}` : "N/A",
      val2: anime2.popularity ? `#${anime2.popularity.toLocaleString()}` : "N/A",
      winner: (anime1.popularity || Infinity) < (anime2.popularity || Infinity) ? 1 : (anime2.popularity || Infinity) < (anime1.popularity || Infinity) ? 2 : 0,
    },
    {
      label: "Year",
      val1: anime1.seasonYear ? String(anime1.seasonYear) : "N/A",
      val2: anime2.seasonYear ? String(anime2.seasonYear) : "N/A",
      winner: 0,
    },
    {
      label: "Format",
      val1: anime1.format || "N/A",
      val2: anime2.format || "N/A",
      winner: 0,
    },
    {
      label: "Status",
      val1: anime1.status?.toLowerCase().replace(/_/g, " ") || "N/A",
      val2: anime2.status?.toLowerCase().replace(/_/g, " ") || "N/A",
      winner: 0,
    },
    {
      label: "Studio",
      val1: studios1[0] || "N/A",
      val2: studios2[0] || "N/A",
      winner: 0,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Compare", href: "/" },
          { label: `${title1} vs ${title2}` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${title1} vs ${title2} - Anime Comparison`,
            description: `Side-by-side comparison of ${title1} and ${title2}.`,
          }),
        }}
      />

      <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-8 text-center">
        {title1} vs {title2}
      </h1>

      {/* Cover Images */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Link href={`/anime/${anime1.slug}`} className="group">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-anime-card border border-anime-border group-hover:border-purple-700/40 transition-all">
            {anime1.coverImage ? (
              <Image
                src={anime1.coverImage}
                alt={title1}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>
          <h2 className="text-white font-bold text-lg mt-3 text-center group-hover:text-purple-300 transition-colors">
            {title1}
          </h2>
        </Link>
        <Link href={`/anime/${anime2.slug}`} className="group">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-anime-card border border-anime-border group-hover:border-blue-700/40 transition-all">
            {anime2.coverImage ? (
              <Image
                src={anime2.coverImage}
                alt={title2}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>
          <h2 className="text-white font-bold text-lg mt-3 text-center group-hover:text-blue-300 transition-colors">
            {title2}
          </h2>
        </Link>
      </div>

      <AdBanner className="mb-8" />

      {/* Comparison Table */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Side-by-Side Comparison</h2>
        <div className="bg-anime-card rounded-xl border border-anime-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-anime-border">
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Stat</th>
                <th className="px-4 py-3 text-center text-purple-300 text-sm font-medium">{title1}</th>
                <th className="px-4 py-3 text-center text-blue-300 text-sm font-medium">{title2}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b border-anime-border/50 last:border-0">
                  <td className="px-4 py-3 text-gray-400 text-sm">{row.label}</td>
                  <td className={`px-4 py-3 text-center text-sm font-medium ${row.winner === 1 ? "text-green-400" : "text-white"}`}>
                    {row.val1}
                    {row.winner === 1 && " ✓"}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-medium ${row.winner === 2 ? "text-green-400" : "text-white"}`}>
                    {row.val2}
                    {row.winner === 2 && " ✓"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Genre Overlap */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Genre Comparison</h2>
        <div className="bg-anime-card rounded-xl border border-anime-border p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-purple-300 text-sm font-medium mb-2">Only in {title1}</h3>
              <div className="flex flex-wrap gap-1">
                {genres1
                  .filter((g) => !sharedGenres.includes(g))
                  .map((g) => (
                    <span key={g} className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded-md border border-purple-800/30">
                      {g}
                    </span>
                  ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-green-300 text-sm font-medium mb-2">Shared</h3>
              <div className="flex flex-wrap gap-1 justify-center">
                {sharedGenres.map((g) => (
                  <span key={g} className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded-md border border-green-800/30">
                    {g}
                  </span>
                ))}
                {sharedGenres.length === 0 && (
                  <span className="text-gray-500 text-xs">No shared genres</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-blue-300 text-sm font-medium mb-2">Only in {title2}</h3>
              <div className="flex flex-wrap gap-1 justify-end">
                {genres2
                  .filter((g) => !sharedGenres.includes(g))
                  .map((g) => (
                    <span key={g} className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded-md border border-blue-800/30">
                      {g}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdBanner className="mb-8" />

      {/* Links */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime1.slug}`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-purple-700/40 hover:text-purple-300 text-sm transition-all duration-200"
          >
            View {title1}
          </Link>
          <Link
            href={`/anime/${anime2.slug}`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-blue-700/40 hover:text-blue-300 text-sm transition-all duration-200"
          >
            View {title2}
          </Link>
          <Link
            href={`/anime-like/${anime1.slug}`}
            className="bg-anime-card text-gray-300 px-4 py-2 rounded-xl border border-anime-border hover:border-pink-700/40 hover:text-pink-300 text-sm transition-all duration-200"
          >
            More Like {title1}
          </Link>
        </div>
      </section>
    </div>
  );
}
