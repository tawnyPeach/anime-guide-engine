const AFFILIATE_TAG = process.env.NEXT_PUBLIC_AFFILIATE_TAG || "aniyume";
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "aniyume-20";

export interface StreamingService {
  name: string;
  baseUrl: string;
  searchUrl?: string;
  gradient: string;
  textColor: string;
  icon: string;
}

export interface StreamingLink {
  name: string;
  url: string;
  gradient: string;
  textColor: string;
  icon: string;
}

const STREAMING_SERVICES: Record<string, StreamingService> = {
  Crunchyroll: {
    name: "Crunchyroll",
    baseUrl: "https://www.crunchyroll.com",
    searchUrl: "https://www.crunchyroll.com/search?q=",
    gradient: "from-orange-500 to-orange-600",
    textColor: "text-orange-100",
    icon: "CR",
  },
  Netflix: {
    name: "Netflix",
    baseUrl: "https://www.netflix.com",
    searchUrl: "https://www.netflix.com/search?q=",
    gradient: "from-red-600 to-red-700",
    textColor: "text-red-100",
    icon: "N",
  },
  HIDIVE: {
    name: "HIDIVE",
    baseUrl: "https://www.hidive.com",
    searchUrl: "https://www.hidive.com/search?q=",
    gradient: "from-blue-500 to-blue-700",
    textColor: "text-blue-100",
    icon: "HD",
  },
  Funimation: {
    name: "Funimation",
    baseUrl: "https://www.funimation.com",
    searchUrl: "https://www.funimation.com/search?q=",
    gradient: "from-purple-500 to-purple-700",
    textColor: "text-purple-100",
    icon: "FM",
  },
  "Amazon Prime Video": {
    name: "Amazon Prime Video",
    baseUrl: "https://www.amazon.com",
    searchUrl: "https://www.amazon.com/s?k=",
    gradient: "from-cyan-600 to-blue-600",
    textColor: "text-cyan-100",
    icon: "P",
  },
  Hulu: {
    name: "Hulu",
    baseUrl: "https://www.hulu.com",
    searchUrl: "https://www.hulu.com/search?q=",
    gradient: "from-green-500 to-green-600",
    textColor: "text-green-100",
    icon: "H",
  },
  "Disney+": {
    name: "Disney+",
    baseUrl: "https://www.disneyplus.com",
    searchUrl: "https://www.disneyplus.com/search?q=",
    gradient: "from-blue-600 to-indigo-700",
    textColor: "text-blue-100",
    icon: "D+",
  },
  YouTube: {
    name: "YouTube",
    baseUrl: "https://www.youtube.com",
    searchUrl: "https://www.youtube.com/results?search_query=",
    gradient: "from-red-500 to-red-600",
    textColor: "text-red-100",
    icon: "YT",
  },
};

const SITE_MATCHERS: Record<string, string[]> = {
  Crunchyroll: ["crunchyroll"],
  Netflix: ["netflix"],
  HIDIVE: ["hidive"],
  Funimation: ["funimation"],
  "Amazon Prime Video": ["amazon", "prime video"],
  Hulu: ["hulu"],
  "Disney+": ["disney", "disney plus", "disney+"],
  YouTube: ["youtube", "youtube premium"],
};

export function getStreamingLinks(anime: {
  title: string;
  titleEnglish?: string | null;
  slug: string;
  externalLinks?: string | null;
}): StreamingLink[] {
  const results: StreamingLink[] = [];
  const seen = new Set<string>();
  const searchQuery = encodeURIComponent(anime.titleEnglish || anime.title);

  // Parse externalLinks if present
  let externalLinks: { url: string; site: string; type: string | null }[] = [];
  if (anime.externalLinks) {
    try {
      externalLinks = JSON.parse(anime.externalLinks);
    } catch {
      // ignore parse errors
    }
  }

  // Match external links to known services
  for (const link of externalLinks) {
    if (!link.site) continue;
    const siteLower = link.site.toLowerCase();

    for (const [serviceKey, matchers] of Object.entries(SITE_MATCHERS)) {
      if (seen.has(serviceKey)) continue;
      if (matchers.some((m) => siteLower.includes(m))) {
        const service = STREAMING_SERVICES[serviceKey];
        results.push({
          name: service.name,
          url: link.url,
          gradient: service.gradient,
          textColor: service.textColor,
          icon: service.icon,
        });
        seen.add(serviceKey);
        break;
      }
    }
  }

  // Generate search-based affiliate links for services not found
  for (const [key, service] of Object.entries(STREAMING_SERVICES)) {
    if (seen.has(key)) continue;

    let url: string;
    if (key === "YouTube") {
      url = `https://www.youtube.com/results?search_query=${searchQuery}+anime`;
    } else if (key === "Amazon Prime Video") {
      url = `https://www.amazon.com/s?k=${searchQuery}+anime&tag=${AMAZON_TAG}`;
    } else {
      const searchBase = service.searchUrl || `${service.baseUrl}/search?q=`;
      url = `${searchBase}${searchQuery}`;
    }

    results.push({
      name: service.name,
      url,
      gradient: service.gradient,
      textColor: service.textColor,
      icon: service.icon,
    });
    seen.add(key);
  }

  return results;
}

export interface MerchLink {
  name: string;
  icon: string;
  url: string;
  description: string;
}

const MERCH_CATEGORIES = [
  { name: "Figures", icon: "🎨", query: "figure" },
  { name: "Manga", icon: "📚", query: "manga" },
  { name: "Blu-ray", icon: "📀", query: "blu-ray" },
  { name: "Soundtrack", icon: "🎵", query: "soundtrack OST" },
];

export function getMerchLinks(anime: {
  title: string;
  titleEnglish?: string | null;
}): MerchLink[] {
  const searchTitle = encodeURIComponent(
    `${anime.titleEnglish || anime.title} anime`
  );

  return MERCH_CATEGORIES.map((cat) => ({
    name: cat.name,
    icon: cat.icon,
    url: `https://www.amazon.com/s?k=${searchTitle}+${encodeURIComponent(cat.query)}&tag=${AMAZON_TAG}`,
    description: `${cat.name} for ${anime.titleEnglish || anime.title}`,
  }));
}

export interface VPNBannerConfig {
  name: string;
  url: string;
  gradient: string;
  tagline: string;
  cta: string;
}

export const VPN_BANNERS: VPNBannerConfig[] = [
  {
    name: "NordVPN",
    url: `https://nordvpn.com/?ref=${AFFILIATE_TAG}`,
    gradient: "from-blue-600 to-cyan-500",
    tagline: "Fast, secure VPN with 6000+ servers",
    cta: "Try NordVPN",
  },
  {
    name: "ExpressVPN",
    url: `https://www.expressvpn.com/go?affiliate_id=7523728`,
    gradient: "from-red-500 to-orange-500",
    tagline: "Premium speed & unlimited bandwidth",
    cta: "Try ExpressVPN",
  },
];
