import Link from "next/link";
import SearchBar from "./SearchBar";
import MobileNav from "./MobileNav";

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
          <nav className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link
              href="/genre/action"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Action
            </Link>
            <Link
              href="/genre/romance"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Romance
            </Link>
            <Link
              href="/genre/fantasy"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Fantasy
            </Link>
            <Link
              href="/genre/sci-fi"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              Sci-Fi
            </Link>
            <Link
              href="/year/2024"
              className="nav-link text-gray-300 hover:text-white transition-colors text-sm"
            >
              2024 Anime
            </Link>
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
