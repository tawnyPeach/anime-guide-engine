import { TextSkeleton } from "@/components/LoadingSkeleton";

export default function AnimeLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="aspect-[3/4] bg-muted rounded-xl animate-pulse" />
        </div>

        <div className="flex-1 space-y-6">
          <div className="h-8 bg-muted rounded-lg w-3/4 animate-pulse" />
          <div className="h-5 bg-muted rounded w-1/2 animate-pulse" />

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded-full w-20 animate-pulse" />
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded-lg w-24 animate-pulse" />
            ))}
          </div>

          <TextSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
