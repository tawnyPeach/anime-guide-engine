import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function GenreLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-40 animate-pulse" />
      </div>

      <div className="mb-8 py-8 px-6">
        <div className="h-8 bg-muted rounded-lg w-64 mb-2 animate-pulse" />
        <div className="h-5 bg-muted rounded w-80 animate-pulse" />
      </div>

      <section className="mb-8">
        <div className="h-5 bg-muted rounded w-56 mb-4 animate-pulse" />
        <div className="flex gap-4 overflow-hidden pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[160px] max-w-[180px] flex-shrink-0">
              <CardSkeleton />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
