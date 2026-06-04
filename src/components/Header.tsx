import Link from "next/link";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";

function getCurrentSeasonSlug(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  let season: string;
  if (month < 3) season = "winter";
  else if (month < 6) season = "spring";
  else if (month < 9) season = "summer";
  else season = "fall";

  return `${season}-${year}`;
}

export default function Header() {
  return (
    <header className="glass sticky top-0 z-50 border-b border-anime-border">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <span className="text-2xl">🎌</span>
            <span className="text-xl font-bold gradient-text">
              Anime Guide Engine
            </span>
          </Link>
          <div className="hidden md:flex flex-1 justify-center px-6">
            <SearchBar />
          </div>
          <nav className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <Link
              href="/top/most-popular"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Top Anime
            </Link>
            <Link
              href={`/season/${getCurrentSeasonSlug()}`}
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              This Season
            </Link>
            <Link
              href="/calendar"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Calendar
            </Link>
            <Link
              href="/genre/action"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Action
            </Link>
            <Link
              href="/blog"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Blog
            </Link>
            <Link
              href="/bookmarks"
              className="text-gray-300 hover:text-pink-400 transition-colors"
              aria-label="Bookmarks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <ThemeToggle />
          </nav>
          <MobileNav />
        </div>
        {/* Mobile search bar */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
