export function CardSkeleton() {
  return (
    <div className="bg-anime-card rounded-xl overflow-hidden border border-anime-border">
      <div className="relative aspect-[3/4] bg-gray-800 animate-shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-800 rounded animate-shimmer w-3/4" />
        <div className="h-3 bg-gray-800 rounded animate-shimmer w-1/2" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 bg-gray-800 rounded animate-shimmer w-12" />
          <div className="h-5 bg-gray-800 rounded animate-shimmer w-14" />
        </div>
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-800 rounded animate-shimmer"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
