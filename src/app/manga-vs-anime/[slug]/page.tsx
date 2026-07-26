import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdBanner from "@/components/AdBanner";
import ComparisonTable from "../ComparisonTable";
import { generateMangaVsAnimeContent } from "@/lib/content-generator";

export const dynamic = "force-dynamic";

const BLUR_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0RckiXeZJAAAAAElFTkSuQmCC";

interface Props {
  params: Promise<{ slug: string }>;
}

function generateComparisonData(anime: {
  title: string;
  titleEnglish: string | null;
  genres: string;
  totalEpisodes: number;
  averageScore: number | null;
  source: string | null;
  popularity: number | null;
  description: string | null;
}) {
  const name = anime.titleEnglish || anime.title;
  const isHighRated = (anime.averageScore || 0) >= 80;
  const isPopular = (anime.popularity || 0) > 500000;

  const category = isHighRated
    ? "Both are Great"
    : isPopular
      ? "Major Differences"
      : (anime.averageScore || 0) >= 70
        ? "Better in Anime"
        : "Better in Manga";

  const baseStoryScore = isHighRated ? 5 : (anime.averageScore || 0) >= 70 ? 4 : 3;
  const baseArtScore = anime.totalEpisodes > 50 ? 4 : 3;

  return {
    category,
    comparisonRows: [
      {
        category: "Story",
        mangaScore: baseStoryScore,
        animeScore: baseStoryScore - (isHighRated ? 0 : 1),
        mangaNote: "Full narrative",
        animeNote: isHighRated ? "Faithful adaptation" : "Some changes",
      },
      {
        category: "Art / Animation",
        mangaScore: 3,
        animeScore: baseArtScore,
        mangaNote: "Static panels",
        animeNote: "Moving visuals",
      },
      {
        category: "Characters",
        mangaScore: baseStoryScore,
        animeScore: baseStoryScore,
        mangaNote: "Inner thoughts",
        animeNote: "Voice acting",
      },
      {
        category: "Pacing",
        mangaScore: 4,
        animeScore: isPopular ? 3 : 4,
        mangaNote: "Self-paced",
        animeNote: isPopular ? "Some filler" : "Tight pacing",
      },
      {
        category: "Filler",
        mangaScore: 5,
        animeScore: isPopular ? 2 : 4,
        mangaNote: "No filler",
        animeNote: isPopular ? "Has filler" : "Minimal filler",
      },
      {
        category: "Sound / Music",
        mangaScore: 0,
        animeScore: 4,
        mangaNote: "No audio",
        animeNote: "Original OST",
      },
    ],
    storyDiff: isHighRated
      ? `Both the manga and anime of ${name} are highly regarded for their storytelling. The manga provides a complete, detailed narrative with the author's full vision intact, while the anime adapts the story with added audiovisual elements that enhance key moments. Fans of either version will find a satisfying experience, though each has its own strengths in how it delivers the narrative.`
      : `The manga version of ${name} tends to follow the original story more closely, with some adaptations making changes for the anime format. These changes can range from reorganized arc order to expanded or condensed storylines. The core plot remains recognizable, but specific details and scene ordering may differ between the two versions.`,
    artQuality: `The manga showcases the original artist's detailed illustrations and panel compositions, giving readers direct access to the creator's visual storytelling. The anime adaptation brings these visuals to life through animation, voice acting, and movement — though animation quality can vary by episode and studio budget. Key action sequences and emotional scenes often receive extra attention from animators, creating memorable moments that static panels cannot replicate.`,
    characterDev: `Character development in the manga often includes more internal monologue and backstory that can be difficult to convey in animation. The anime compensates with voice performances that add emotional depth through delivery and inflection. Side characters may receive different levels of focus between versions, with the manga sometimes providing more depth to supporting cast while the anime concentrates on the main cast.`,
    pacing: `The manga allows readers to move at their own pace, spending as much time as they want on detailed panels or speeding through action sequences. The anime follows a fixed episode structure that sometimes means padding or condensing material. ${name} pacing${anime.totalEpisodes > 100 ? " is a particular consideration given its episode count" : ""}, and the experience differs significantly between reading at your own pace and watching the broadcast runtime.`,
    fillerNote: `As a manga adaptation, ${name} may contain anime-original content not found in the source material. Filler episodes can be entertaining standalone stories but do not advance the main plot. The manga, by contrast, contains only the author's intended story without any padding or side content. This is one of the clearest structural differences between the two versions.`,
    soundMusic: `This is one area where the anime clearly stands apart. The original soundtrack, opening and ending themes, and sound design add an entirely new dimension to the story. Iconic voice performances and memorable music tracks become inseparable from the viewing experience. The manga offers no audio component, relying entirely on visual storytelling to convey mood and atmosphere.`,
    verdict: isHighRated
      ? `Both the manga and anime of ${name} are excellent experiences and rank among the best in their respective categories. Choosing between them comes down to personal preference: do you want to read at your own pace with the complete source material, or experience the story brought to life with animation and sound?`
      : `The manga of ${name} generally provides a more complete and faithful experience of the original story, while the anime offers the added dimension of animation and sound that can elevate key moments. For the fullest understanding of the series, experiencing both versions is recommended.`,
    recommendation: isHighRated
      ? `For ${name}, either version is a great starting point. If you prefer reading, start with the manga for the complete story. If you prefer watching, the anime is a well-regarded adaptation that stands on its own. Experiencing both gives the fullest picture.`
      : isPopular
        ? `For ${name}, we recommend starting with the manga to experience the original story without filler or changes. The anime is worth watching afterward for its animation highlights and soundtrack, but be aware that some content differs from the source material.`
        : `For ${name}, the manga is the recommended starting point as it contains the most complete version of the story. The anime adaptation is still worth watching for its visual and audio presentation, but the manga offers a more focused narrative experience.`,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });
  if (!anime) return { title: "Not Found" };

  const displayTitle = anime.titleEnglish || anime.title;

  return {
    title: `${displayTitle} - Manga vs Anime Comparison`,
    description: `Compare the manga and anime versions of ${displayTitle}. Story differences, art quality, character development, pacing, and overall verdict.`,
    alternates: { canonical: `/manga-vs-anime/${slug}` },
    openGraph: {
      title: `${displayTitle} - Manga vs Anime`,
      description: `Compare the manga and anime versions of ${displayTitle} side by side.`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(displayTitle + " Manga vs Anime")}&subtitle=${encodeURIComponent("Which version is better?")}&type=manga-vs-anime`,
        },
      ],
    },
  };
}

export default async function MangaVsAnimePage({ params }: Props) {
  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      relationsFrom: {
        include: { toAnime: true },
        where: { relationType: { in: ["SEQUEL", "PREQUEL", "SIDE_STORY", "SPIN_OFF"] } },
      },
    },
  });

  if (!anime) notFound();

  const displayTitle = anime.titleEnglish || anime.title;
  const genres: string[] = JSON.parse(anime.genres || "[]");

  const data = generateComparisonData(anime);
  const content = generateMangaVsAnimeContent(
    { ...anime, genres },
    {
      category: data.category,
      summary: `A comprehensive comparison of the manga and anime versions of ${displayTitle}, covering story fidelity, animation quality, character depth, pacing, filler, and overall experience.`,
      storyDiff: data.storyDiff,
      artQuality: data.artQuality,
      characterDev: data.characterDev,
      pacing: data.pacing,
      fillerNote: data.fillerNote,
      soundMusic: data.soundMusic,
      verdict: data.verdict,
      recommendation: data.recommendation,
    }
  );

  // Navigation: other manga vs anime pages
  let otherAnime: { title: string; titleEnglish: string | null; slug: string }[] = [];
  try {
    otherAnime = await prisma.anime.findMany({
      where: {
        source: { not: "ORIGINAL" },
        id: { not: anime.id },
      },
      orderBy: { popularity: "desc" },
      take: 6,
      select: { title: true, titleEnglish: true, slug: true },
    });
  } catch {
    // ignore
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <Breadcrumbs
        items={[
          { label: "Manga vs Anime", href: "/manga-vs-anime" },
          { label: displayTitle },
        ]}
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${displayTitle} - Manga vs Anime Comparison`,
            description: `Compare the manga and anime versions of ${displayTitle} across story, art, characters, pacing, and more.`,
            author: { "@type": "Organization", name: "AniYume" },
          }),
        }}
      />

      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border glow-primary">
            {anime.coverImage ? (
              <Image
                src={anime.coverImage}
                alt={`${displayTitle} cover`}
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl">📖</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-blue-400">Manga</span>{" "}
            <span className="text-muted-foreground">vs</span>{" "}
            <span className="text-orange-400">Anime</span>
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">{displayTitle}</h2>

          {/* Category badge */}
          <div className="mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                data.category === "Better in Manga"
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : data.category === "Better in Anime"
                    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                    : data.category === "Both are Great"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30"
              }`}
            >
              {data.category}
            </span>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-muted-foreground text-xs uppercase">Episodes</div>
              <div className="text-foreground font-bold text-lg">{anime.totalEpisodes || "?"}</div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-muted-foreground text-xs uppercase">Score</div>
              <div className="text-foreground font-bold text-lg">
                {anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)}/10` : "N/A"}
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-muted-foreground text-xs uppercase">Source</div>
              <div className="text-foreground font-bold text-lg">{anime.source || "Unknown"}</div>
            </div>
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm border border-primary/20 hover:border-primary/50 hover:bg-primary/20 transition-all duration-200"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}

          {/* Quick recommendation */}
          <div className="bg-gradient-to-r from-blue-500/10 to-orange-500/10 border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">💡</span>
              <span className="text-foreground font-semibold text-sm">Quick Take</span>
            </div>
            <p className="text-muted-foreground text-sm">{data.recommendation}</p>
          </div>
        </div>
      </div>

      <AdBanner className="mb-8" />

      {/* Comparison Table */}
      <ComparisonTable rows={data.comparisonRows} title={displayTitle} />

      {/* Detailed Content */}
      <article className="prose prose-themed max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      <AdBanner className="mb-8" />

      {/* Other Manga vs Anime Pages */}
      {otherAnime.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              More Manga vs Anime
            </h2>
            <Link
              href="/manga-vs-anime"
              className="text-primary hover:text-primary/80 text-sm transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherAnime.map((a) => (
              <Link
                key={a.slug}
                href={`/manga-vs-anime/${a.slug}`}
                className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:bg-card/80 transition-all duration-200"
              >
                <span className="text-foreground font-medium text-sm">
                  {a.titleEnglish || a.title}
                </span>
                <span className="text-muted-foreground text-xs block mt-1">
                  Manga vs Anime Comparison
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-4">More Guides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/anime/${anime.slug}`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            &larr; {displayTitle} Overview
          </Link>
          <Link
            href={`/anime/${anime.slug}/filler-list`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            🎯 Filler Guide
          </Link>
          <Link
            href={`/anime/${anime.slug}/episodes`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            📋 Episode Guide
          </Link>
          <Link
            href={`/manga-vs-anime`}
            className="bg-card text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted text-sm border border-border"
          >
            📖 All Manga vs Anime
          </Link>
        </div>
      </section>
    </div>
  );
}
