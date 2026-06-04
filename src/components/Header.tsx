import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex h-14 md:h-16 items-center px-4 md:px-6 gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-extrabold text-2xl md:text-3xl tracking-tight">
            <span className="text-brand-teal">Ani</span><span className="text-brand-orange">Yume</span>
          </span>
        </Link>

        {/* Search - centered */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <Link
            href="/bookmarks"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-xl hover:bg-muted/60"
            aria-label="Bookmarks"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}
