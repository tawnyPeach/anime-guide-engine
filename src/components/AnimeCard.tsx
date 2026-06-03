import Link from "next/link";
import Image from "next/image";

// A tiny 10x14 purple/dark gradient placeholder image (base64 encoded)
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
}: AnimeCardProps) {
  const displayTitle = titleEnglish || title;

  return (
    <article className="bg-anime-card rounded-xl overflow-hidden border border-anime-border hover:glow-card-hover transition-all duration-300 group hover:-translate-y-1">
      <Link href={`/anime/${slug}`}>
        <div className="relative aspect-[3/4] bg-gray-800 overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`${displayTitle} cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {averageScore && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow-lg">
              ⭐ {(averageScore / 10).toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors duration-200">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {totalEpisodes > 0 && <span>{totalEpisodes} eps</span>}
            {seasonYear && <span>{seasonYear}</span>}
            {status === "RELEASING" && (
              <span className="text-green-400">Airing</span>
            )}
          </div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 text-purple-300 text-xs px-2 py-0.5 rounded-md border border-purple-800/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
