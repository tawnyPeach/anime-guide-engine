import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="relative inline-block mb-6">
        <h1 className="text-8xl font-bold gradient-text">404</h1>
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500" />
      </div>
      <h2 className="text-2xl text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        The anime guide you&apos;re looking for doesn&apos;t exist or hasn&apos;t been generated yet.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg glow-purple"
        >
          Go Home
        </Link>
        <Link
          href="/genre/action"
          className="bg-anime-card text-gray-300 px-6 py-3 rounded-xl border border-anime-border hover:border-purple-700/40 hover:text-purple-300 transition-all duration-200"
        >
          Browse Action Anime
        </Link>
      </div>
    </div>
  );
}
