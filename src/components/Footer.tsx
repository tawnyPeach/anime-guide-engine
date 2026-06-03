import Link from "next/link";
import Newsletter from "./Newsletter";

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Sci-Fi", "Thriller"];
const years = [2024, 2023, 2022, 2021, 2020];

export default function Footer() {
  return (
    <footer className="relative border-t border-anime-border mt-16 bg-gradient-to-b from-[#0f0f23] to-[#0a0a1a]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="mb-10">
          <Newsletter />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="gradient-text font-bold text-lg mb-4">
              🎌 Anime Guide Engine
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your ultimate resource for anime filler guides, watch orders, and
              episode lists. Skip the filler, watch what matters.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Browse by Genre</h4>
            <ul className="space-y-2">
              {genres.map((genre) => (
                <li key={genre}>
                  <Link
                    href={`/genre/${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className="text-gray-400 hover:text-purple-400 text-sm transition-colors duration-200"
                  >
                    {genre} Anime
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Browse by Year</h4>
            <ul className="space-y-2">
              {years.map((year) => (
                <li key={year}>
                  <Link
                    href={`/year/${year}`}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                  >
                    Best of {year}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Popular Guides</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/anime/naruto/filler-list"
                  className="text-gray-400 hover:text-pink-400 text-sm transition-colors duration-200"
                >
                  Naruto Filler Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/anime/one-piece/filler-list"
                  className="text-gray-400 hover:text-pink-400 text-sm transition-colors duration-200"
                >
                  One Piece Filler Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/anime/bleach/filler-list"
                  className="text-gray-400 hover:text-pink-400 text-sm transition-colors duration-200"
                >
                  Bleach Filler Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/anime/dragon-ball-z/filler-list"
                  className="text-gray-400 hover:text-pink-400 text-sm transition-colors duration-200"
                >
                  Dragon Ball Z Filler Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-anime-border mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Anime Guide Engine. All anime
            data sourced from AniList and MyAnimeList.
          </p>
        </div>
      </div>
    </footer>
  );
}
