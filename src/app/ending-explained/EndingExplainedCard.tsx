import Link from "next/link";
import Image from "next/image";

interface EndingExplainedCardProps {
  anime: {
    id: number;
    title: string;
    titleEnglish: string | null;
    slug: string;
    coverImage: string | null;
    averageScore: number | null;
    totalEpisodes: number;
  };
  index?: number;
}

export default function EndingExplainedCard({ anime, index = 0 }: EndingExplainedCardProps) {
  const displayTitle = anime.titleEnglish || anime.title;

  return (
    <Link
      href={`/ending-explained/${anime.slug}`}
      className="animate-card-in group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          {anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt={`${displayTitle} cover`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📖</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Ending Explained Badge */}
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange/90 text-white backdrop-blur-sm">
            Ending Explained
          </div>

          {/* Score badge */}
          {anime.averageScore && (
            <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-teal/90 text-white">
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {(anime.averageScore / 10).toFixed(1)}
            </span>
          )}

          {/* Episodes */}
          {anime.totalEpisodes > 0 && (
            <div className="absolute bottom-2 left-2 right-2 z-10">
              <span className="text-[10px] font-medium text-white/90">
                {anime.totalEpisodes} Episodes
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-3 py-3">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
          <p className="text-[11px] text-primary/80 mt-1 font-medium">
            Read Explanation →
          </p>
        </div>
      </div>
    </Link>
  );
}
