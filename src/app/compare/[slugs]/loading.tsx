export default function CompareLoading() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <div className="mb-4">
        <div className="h-4 bg-muted rounded w-40 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center p-6 bg-card rounded-xl border border-border animate-pulse">
            <div className="w-32 h-44 bg-muted rounded-lg mb-4 animate-pulse" />
            <div className="h-6 bg-muted rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-4 p-4 bg-card rounded-lg border border-border animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
