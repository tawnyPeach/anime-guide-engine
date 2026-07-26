import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });
  if (!anime) return { title: "Not Found" };

  const title = anime.titleEnglish || anime.title;

  return {
    title: `${title} Ending Explained`,
    description: `In-depth explanation of the ${title} ending. Understand the plot twists, character arcs, and themes behind the finale.`,
    alternates: { canonical: `/ending-explained/${slug}` },
    openGraph: {
      title: `${title} Ending Explained`,
      description: `In-depth explanation of the ${title} ending. Understand the plot twists, character arcs, and themes.`,
      images: anime.coverImage
        ? [{ url: anime.coverImage }]
        : [{ url: `/api/og?title=${encodeURIComponent(title)}&subtitle=Ending+Explained` }],
    },
  };
}

function generateEndingContent(anime: {
  title: string;
  titleEnglish?: string | null;
  description?: string | null;
  genres: string[];
  totalEpisodes: number;
  status?: string | null;
  seasonYear?: number | null;
}): string {
  const title = anime.titleEnglish || anime.title;
  const genres = anime.genres || [];

  return `
<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Ending Explained</h2>
<p class="text-gray-300 leading-relaxed mb-4">
The ending of <strong class="text-white font-semibold">${title}</strong> has sparked countless discussions among fans. After ${anime.totalEpisodes} episodes of compelling storytelling, the series delivered a conclusion that ties together its major themes and character arcs.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Setting the Stage</h3>
<p class="text-gray-300 leading-relaxed mb-4">
${anime.description ? anime.description.substring(0, 200) + "..." : `${title} is a ${genres.length > 0 ? genres.slice(0, 3).join(", ").toLowerCase() : "dramatic"} anime`} Throughout its run, the series built toward a climactic resolution that would determine the fate of its characters and the world they inhabit. The final episodes ramped up the tension, bringing long-running plot threads to a head.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">The Final Arc</h3>
<p class="text-gray-300 leading-relaxed mb-4">
The concluding arc of ${title} brings together the major conflicts that have been building throughout the series. Character motivations are laid bare, alliances are tested, and the true nature of the central conflict is revealed. Each character's journey reaches a pivotal moment that tests everything they've learned and become.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Key Themes in the Ending</h3>
<ul class="list-disc list-inside space-y-2 text-gray-300 mb-4">
<li><strong class="text-white font-semibold">Growth and Sacrifice:</strong> The ending emphasizes how the characters have grown from their experiences, often making difficult choices that demonstrate their development.</li>
<li><strong class="text-white font-semibold">Consequences and Resolution:</strong> Actions throughout the series have consequences that come due in the finale, providing a satisfying sense of cause and effect.</li>
<li><strong class="text-white font-semibold">Legacy and Future:</strong> The conclusion addresses what comes after, giving closure while leaving room for the characters' futures beyond the final frame.</li>
</ul>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Character Arcs Resolved</h3>
<p class="text-gray-300 leading-relaxed mb-4">
The series finale provides resolution for each major character's personal journey. Protagonists face their ultimate challenges, antagonists reveal their true motivations, and supporting characters find their own paths forward. The ending ensures that no significant character arc is left unaddressed.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Symbolism and Foreshadowing Payoff</h3>
<p class="text-gray-300 leading-relaxed mb-4">
${title} planted numerous visual and narrative seeds throughout its run that bear fruit in the final episodes. Careful viewers will recognize callbacks to earlier episodes, symbolic imagery that gains new meaning in context, and subtle details that reward attentive watching.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why the Ending Works</h3>
<p class="text-gray-300 leading-relaxed mb-4">
The strength of ${title}'s ending lies in its commitment to the themes and character relationships established from the beginning. Rather than relying on shock value alone, the conclusion delivers emotional payoff that feels earned through the series' careful pacing and character development.
</p>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Common Questions</h3>
<div class="space-y-3 mb-4">
<div class="bg-white/5 rounded-lg p-3">
<h4 class="text-white font-semibold text-sm mb-1">What does the final scene mean?</h4>
<p class="text-gray-300 text-sm">The final scene serves as a thematic bookend to the series, mirroring elements from the opening while showing how far the characters have come. It suggests hope and continuity without undermining the weight of the story's events.</p>
</div>
<div class="bg-white/5 rounded-lg p-3">
<h4 class="text-white font-semibold text-sm mb-1">Is there a post-credits scene?</h4>
<p class="text-gray-300 text-sm">Check the very end of the final episode for any additional scenes that may hint at future events or provide bonus character moments.</p>
</div>
<div class="bg-white/5 rounded-lg p-3">
<h4 class="text-white font-semibold text-sm mb-1">Will there be a sequel?</h4>
<p class="text-gray-300 text-sm">With the story reaching a natural conclusion, any continuation would likely explore new characters or a different aspect of the world rather than directly continuing the main narrative.</p>
</div>
</div>

<h3 class="text-lg font-semibold text-white mt-5 mb-2">Final Thoughts</h3>
<p class="text-gray-300 leading-relaxed mb-4">
${title}'s ending stands as a testament to the series' overall quality and the creators' commitment to telling a complete, satisfying story. Whether you found it triumphant, bittersweet, or thought-provoking, the finale ensures that ${title} will be remembered as a series that respected its audience and delivered on its narrative promises.
</p>`;
}

export default async function EndingExplainedDetailPage({ params }: Props) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({ where: { slug } });

  if (!anime) notFound();

  const genres: string[] = JSON.parse(anime.genres || "[]");
  const displayTitle = anime.titleEnglish || anime.title;

  const content = generateEndingContent({
    title: anime.title,
    titleEnglish: anime.titleEnglish,
    description: anime.description,
    genres,
    totalEpisodes: anime.totalEpisodes || 0,
    status: anime.status,
    seasonYear: anime.seasonYear,
  });

  // Get adjacent anime for navigation
  let adjacentAnime: { title: string; titleEnglish: string | null; slug: string }[] = [];
  try {
    adjacentAnime = await prisma.anime.findMany({
      where: { status: "FINISHED", id: { not: anime.id } },
      select: { title: true, titleEnglish: true, slug: true },
      orderBy: { popularity: "desc" },
      take: 12,
    });
  } catch {
    // ignore
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${displayTitle} Ending Explained`,
    description: `In-depth explanation of the ${displayTitle} ending. Understand the plot twists, character arcs, and themes.`,
    author: { "@type": "Organization", name: "AniYume" },
    publisher: { "@type": "Organization", name: "AniYume" },
    image: anime.coverImage || undefined,
    url: `/ending-explained/${slug}`,
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/ending-explained" className="hover:text-primary transition-colors">Ending Explained</Link>
        <span>/</span>
        <span className="text-foreground">{displayTitle}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Cover */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border">
              {anime.coverImage ? (
                <Image
                  src={anime.coverImage}
                  alt={`${displayTitle} cover`}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-5xl">📖</span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <span className="text-xs text-muted-foreground uppercase">Episodes</span>
                <div className="text-foreground font-bold">{anime.totalEpisodes || "?"}</div>
              </div>
              {anime.averageScore && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Score</span>
                  <div className="text-foreground font-bold">{(anime.averageScore / 10).toFixed(1)}/10</div>
                </div>
              )}
              {anime.seasonYear && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Year</span>
                  <div className="text-foreground font-bold">{anime.seasonYear}</div>
                </div>
              )}
              {genres.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Genres</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {genres.map((g) => (
                      <span key={g} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href={`/anime/${anime.slug}`}
              className="block bg-card border border-border rounded-xl p-3 text-center text-sm text-primary hover:border-primary/40 hover:bg-muted/60 transition-all"
            >
              View Full Anime Page →
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange/90 text-white mb-2">
              Ending Explained
            </span>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              {displayTitle} Ending Explained
            </h1>
            <p className="text-sm text-muted-foreground">
              Published by AniYume · Spoiler warning for the complete series
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 md:p-8 prose prose-themed max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>

          {/* Navigation */}
          {adjacentAnime.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-foreground mb-3">More Endings Explained</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {adjacentAnime.slice(0, 8).map((a) => (
                  <Link
                    key={a.slug}
                    href={`/ending-explained/${a.slug}`}
                    className="bg-card border border-border rounded-lg p-3 text-sm text-foreground hover:border-primary/40 hover:bg-muted/60 transition-all text-center truncate"
                  >
                    {a.titleEnglish || a.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
