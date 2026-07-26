import { getMerchLinks } from "@/lib/affiliate";

interface MerchSectionProps {
  anime: {
    title: string;
    titleEnglish?: string | null;
  };
}

export default function MerchSection({ anime }: MerchSectionProps) {
  const merchLinks = getMerchLinks(anime);
  const displayTitle = anime.titleEnglish || anime.title;

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">
        Merch for {displayTitle}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {merchLinks.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-xl p-4 border border-border hover:border-primary/40 hover:glow-card-hover transition-all duration-300 group flex flex-col items-center text-center gap-2"
          >
            <span className="text-3xl">{item.icon}</span>
            <h3 className="text-foreground font-semibold text-sm group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-2">
              {item.description}
            </p>
            <span className="text-primary text-xs font-medium mt-auto">
              View on Amazon →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
