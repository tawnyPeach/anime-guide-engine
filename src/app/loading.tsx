import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function HomeLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <section className="relative text-center mb-16 py-12 rounded-xl overflow-hidden bg-muted/30 animate-pulse">
        <div className="relative z-10 space-y-4">
          <div className="h-12 md:h-16 bg-muted rounded-lg w-48 mx-auto animate-pulse" />
          <div className="h-5 bg-muted rounded-lg w-full max-w-2xl mx-auto animate-pulse" />
          <div className="h-5 bg-muted rounded-lg w-full max-w-xl mx-auto animate-pulse" />
          <div className="h-3 bg-muted rounded w-32 mx-auto animate-pulse" />
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-muted rounded-full mr-3 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-48 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-muted rounded-full mr-3 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-56 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-muted rounded-full mr-3 animate-pulse" />
          <div className="h-6 bg-muted rounded-lg w-40 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
