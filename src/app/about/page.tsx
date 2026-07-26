import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About AniYume — your ultimate anime guide for filler lists, watch orders, and episode guides.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">About AniYume</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <p className="text-lg">
            <strong className="text-foreground">AniYume</strong> is your ultimate resource for anime guides, filler lists, watch orders, and episode guides. We help you spend less time figuring out what to watch and more time enjoying anime.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">What We Offer</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Filler Guides</strong> — Know which episodes to skip and which are essential to the story</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Watch Orders</strong> — The correct viewing order for complex franchises like Fate, Monogatari, and more</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Episode Guides</strong> — Detailed episode lists with titles, filler markers, and arc breakdowns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Seasonal Charts</strong> — What&apos;s airing this season and upcoming anime schedules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong className="text-foreground">Community Reviews</strong> — Real ratings and reviews from anime fans like you</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
          <p>
            We believe anime should be accessible to everyone. With thousands of anime titles across dozens of streaming platforms, it can be overwhelming to figure out where to start, what to skip, and how to watch things in the right order. AniYume exists to solve that problem.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Database</h2>
          <p>
            Our database includes over 1,000 anime titles with detailed episode information, curated from sources like AniList and MyAnimeList. We&apos;re constantly adding new titles and updating existing entries to keep our guides accurate and up-to-date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Contact</h2>
          <p>
            Have suggestions, found an error, or want to partner with us? Reach out at{" "}
            <a href="mailto:contact@aniyume.net" className="text-primary hover:underline">
              contact@aniyume.net
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
