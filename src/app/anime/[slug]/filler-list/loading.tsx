export default function FillerListLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      </div>

      <div className="h-8 bg-muted rounded-lg w-64 mb-2 animate-pulse" />
      <div className="h-5 bg-muted rounded w-80 mb-8 animate-pulse" />

      <div className="space-y-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border animate-pulse"
          >
            <div className="h-5 bg-muted rounded w-8 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            <div className="h-5 bg-muted rounded-full w-16 animate-pulse" />
            <div className="h-5 bg-muted rounded-full w-16 animate-pulse" />
            <div className="flex-1" />
            <div className="h-4 bg-muted rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
