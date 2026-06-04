import Link from "next/link";
import Image from "next/image";

const BLUR_PLACEHOLDER = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAOCAYAAAAWo42rAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbElEQVQoz2NkYPj/n4EBCxg1atR/BgYGRnwKGRgYGP7//8+Irhgbmx4dNWrUf0ZsLiTCRkYmBgYGhv+MDAzYXPgfi04kVY3EYxI+P+BQiO4mYhXi9AMxCsnlB7I4Aas7cQXBf1xuxJcwAHq0RckiXeZJAAAAAElFTkSuQmCC";

interface AnimeCardProps {
  title: string;
  titleEnglish?: string | null;
  slug: string;
  coverImage?: string | null;
  genres: string[];
  totalEpisodes: number;
  averageScore?: number | null;
  status?: string | null;
  seasonYear?: number | null;
  index?: number;
}

export default function AnimeCard({
  title,
  titleEnglish,
  slug,
  coverImage,
  genres,
  totalEpisodes,
  averageScore,
  status,
  seasonYear,
  index = 0,
}: AnimeCardProps) {
  const displayTitle = titleEnglish || title;

  return (
    <article
      className="animate-card-in"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link href={`/anime/${slug}`} className="block group">
        <div className="w-full rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative pt-[140%] bg-muted overflow-hidden rounded-xl">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`${displayTitle} cover`}
                fill
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                <span className="text-4xl">🎬</span>
              </div>
            )}

            {/* Permanent bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Type/status badge top-left */}
            {status === "RELEASING" && (
              <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-sm text-emerald-400">
                AIRING
              </span>
            )}

            {/* Rating badge top-right */}
            {averageScore && (
              <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange/90 text-white">
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {(averageScore / 10).toFixed(1)}
              </span>
            )}

            {/* Bottom info on image */}
            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between">
              {seasonYear && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-white/90">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {seasonYear}
                </span>
              )}
              {totalEpisodes > 0 && (
                <span className="text-[10px] font-medium text-white/90">
                  {totalEpisodes} EP
                </span>
              )}
            </div>
          </div>

          {/* Title area */}
          <div className="px-1 py-2">
            <h3
              className="m-0 overflow-hidden whitespace-nowrap text-ellipsis text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary"
              title={displayTitle}
            >
              {displayTitle}
            </h3>
            {genres.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {genres.slice(0, 2).join(" / ")}
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
