'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full" />
          <div className="relative text-6xl">🏷️</div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Failed to load genre
        </h1>
        <p className="text-gray-400 mb-6">
          {error.message || 'We could not load this genre page. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
