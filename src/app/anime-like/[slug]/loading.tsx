import { CardSkeleton } from "@/components/LoadingSkeleton";

export default function AnimeLikeLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-52 animate-pulse" />
      </div>

      <div className="mb-8">
        <div className="h-8 bg-muted rounded-lg w-72 mb-2 animate-pulse" />
        <div className="h-5 bg-muted rounded w-96 animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
