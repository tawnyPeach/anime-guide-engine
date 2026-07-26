interface ComparisonRow {
  category: string;
  mangaScore: number;
  animeScore: number;
  mangaNote?: string;
  animeNote?: string;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  title: string;
}

function StarRating({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < score ? "text-brand-orange fill-brand-orange" : "text-muted-foreground/30 fill-muted-foreground/30"}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function BarIndicator({ score, max = 10 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-brand-orange transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function ComparisonTable({ rows, title }: ComparisonTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">
          {title} Comparison
        </h2>
        <p className="text-muted-foreground text-xs mt-1">
          Side-by-side breakdown across key categories
        </p>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 p-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
        <div className="col-span-3">Category</div>
        <div className="col-span-4 text-center">Manga</div>
        <div className="col-span-1" />
        <div className="col-span-4 text-center">Anime</div>
      </div>

      {/* Rows */}
      {rows.map((row, idx) => {
        const winner = row.mangaScore > row.animeScore
          ? "manga"
          : row.animeScore > row.mangaScore
            ? "anime"
            : "tie";

        return (
          <div
            key={row.category}
            className={`grid grid-cols-12 gap-2 p-3 text-sm items-center border-b border-border last:border-b-0 ${
              idx % 2 === 0 ? "" : "bg-muted/30"
            }`}
          >
            <div className="col-span-3 font-medium text-foreground">
              {row.category}
            </div>

            {/* Manga side */}
            <div className={`col-span-4 flex flex-col items-center gap-1 ${winner === "manga" ? "" : "opacity-70"}`}>
              <StarRating score={Math.round(row.mangaScore)} />
              <BarIndicator score={row.mangaScore} />
              {row.mangaNote && (
                <span className="text-[10px] text-muted-foreground text-center">{row.mangaNote}</span>
              )}
              {winner === "manga" && (
                <span className="text-[10px] font-bold text-blue-400">★ WINNER</span>
              )}
            </div>

            {/* VS */}
            <div className="col-span-1 flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted-foreground/60">VS</span>
            </div>

            {/* Anime side */}
            <div className={`col-span-4 flex flex-col items-center gap-1 ${winner === "anime" ? "" : "opacity-70"}`}>
              <StarRating score={Math.round(row.animeScore)} />
              <BarIndicator score={row.animeScore} />
              {row.animeNote && (
                <span className="text-[10px] text-muted-foreground text-center">{row.animeNote}</span>
              )}
              {winner === "anime" && (
                <span className="text-[10px] font-bold text-orange-400">★ WINNER</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
