import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="relative inline-block mb-6">
        <h1 className="text-8xl font-bold gradient-text">404</h1>
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-primary via-brand-teal to-brand-orange" />
      </div>
      <h2 className="text-2xl text-foreground mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The anime guide you&apos;re looking for doesn&apos;t exist or hasn&apos;t been generated yet.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-opacity shadow-lg glow-primary"
        >
          Go Home
        </Link>
        <Link
          href="/genre/action"
          className="bg-card text-muted-foreground px-6 py-3 rounded-xl border border-border hover:border-primary/40 hover:text-primary transition-all duration-200"
        >
          Browse Action Anime
        </Link>
      </div>
    </div>
  );
}
