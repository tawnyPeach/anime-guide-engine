import Link from "next/link";
import Image from "next/image";

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
    <article className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200 group">
      <Link href={`/anime/${slug}`}>
        <div className="relative aspect-[3/4] bg-gray-700">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`${displayTitle} cover`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          {averageScore && (
            <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
              ⭐ {(averageScore / 10).toFixed(1)}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
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
                  className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded"
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
