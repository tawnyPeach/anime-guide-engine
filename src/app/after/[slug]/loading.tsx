import { CardSkeleton } from "@/components/LoadingSkeleton";
import { TextSkeleton } from "@/components/LoadingSkeleton";

export default function AfterLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 p-6 bg-card rounded-xl border border-border animate-pulse">
        <div className="w-24 h-32 bg-muted rounded-lg animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-7 bg-muted rounded-lg w-64 animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
          <TextSkeleton lines={2} />
        </div>
      </div>

      <div className="h-6 bg-muted rounded w-64 mb-4 animate-pulse" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
