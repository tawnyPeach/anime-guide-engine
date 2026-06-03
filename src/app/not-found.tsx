import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl text-gray-300 mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8">
        The anime guide you&apos;re looking for doesn&apos;t exist or hasn&apos;t been generated yet.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/genre/action"
          className="bg-gray-800 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Browse Action Anime
        </Link>
      </div>
    </div>
  );
}
