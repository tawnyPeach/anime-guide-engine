"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/calendar", label: "Calendar" },
  { href: "/genre/action", label: "Action" },
  { href: "/genre/romance", label: "Romance" },
  { href: "/genre/fantasy", label: "Fantasy" },
  { href: "/genre/sci-fi", label: "Sci-Fi" },
  { href: "/year/2024", label: "2024 Anime" },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 glass border-b border-anime-border">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="nav-link px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
