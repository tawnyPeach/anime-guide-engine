export default function WatchOrderLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-48 animate-pulse" />
      </div>

      <div className="h-8 bg-muted rounded-lg w-56 mb-2 animate-pulse" />
      <div className="h-5 bg-muted rounded w-72 mb-8 animate-pulse" />

      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border animate-pulse"
          >
            <div className="w-16 h-24 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
            </div>
            <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
