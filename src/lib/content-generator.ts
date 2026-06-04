/**
 * Content Generator for SEO pages
 * Generates human-readable, SEO-optimized content for each page type
 * Returns valid HTML strings with Tailwind CSS classes for styling
 */

/**
 * Escapes special HTML characters to prevent XSS when interpolating
 * user-provided data into HTML template strings.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface AnimeData {
  title: string;
  titleEnglish?: string | null;
  slug: string;
  description?: string | null;
  genres: string[];
  totalEpisodes: number;
  status?: string | null;
  seasonYear?: number | null;
}

interface FillerStats {
  totalFiller: number;
  totalMixed: number;
  totalCanon: number;
  fillerPercent: number;
}

export function generateFillerPageContent(anime: AnimeData, stats: FillerStats): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);
  const totalEps = anime.totalEpisodes;

  const skipAdvice = stats.fillerPercent > 30
    ? `With <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong> filler content, ${title} has a significant amount of non-canon episodes. If you're primarily interested in the main storyline, skipping the filler episodes can save you considerable time without missing any important plot developments.`
    : stats.fillerPercent > 15
      ? `${title} has a moderate amount of filler at <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong>. While not excessive, skipping these episodes will give you a more streamlined viewing experience focused on the core narrative.`
      : `${title} has relatively little filler at only <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong>. The series stays mostly faithful to its source material, making it a good watch even without skipping any episodes.`;

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Filler Episode Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">If you're watching <strong class="text-white font-semibold">${title}</strong> and want to skip the filler episodes, you're in the right place. This comprehensive filler guide breaks down every episode so you can focus on the main storyline.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Quick Summary</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
<li><strong class="text-white font-semibold">Total Episodes:</strong> <span class="text-purple-400 font-semibold">${totalEps}</span></li>
<li><strong class="text-white font-semibold">Canon Episodes:</strong> <span class="text-purple-400 font-semibold">${stats.totalCanon}</span> (${Math.round((stats.totalCanon / totalEps) * 100)}%)</li>
<li><strong class="text-white font-semibold">Filler Episodes:</strong> <span class="text-purple-400 font-semibold">${stats.totalFiller}</span> (${stats.fillerPercent}%)</li>
<li><strong class="text-white font-semibold">Mixed Canon/Filler:</strong> <span class="text-purple-400 font-semibold">${stats.totalMixed}</span> (${Math.round((stats.totalMixed / totalEps) * 100)}%)</li>
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">What Are Filler Episodes?</h3>
<p class="text-gray-300 leading-relaxed mb-4">Filler episodes in ${title} are episodes that were not adapted from the original source material (manga/light novel). These episodes were created by the anime studio to prevent the anime from catching up to the manga. While some filler episodes can be entertaining, they don't advance the main plot.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Should You Skip ${title} Filler?</h3>
<p class="text-gray-300 leading-relaxed mb-4">${skipAdvice}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">How to Use This Guide</h3>
<p class="text-gray-300 leading-relaxed mb-4">Episodes marked as <strong class="text-white font-semibold">Canon</strong> are essential to the story. <strong class="text-white font-semibold">Filler</strong> episodes can be safely skipped. <strong class="text-white font-semibold">Mixed</strong> episodes contain some canon material alongside filler content — we recommend watching these as they may contain character development or minor plot points that are referenced later.</p>`;
}

export function generateWatchOrderContent(anime: AnimeData, relatedAnime: { title: string; slug: string; type: string }[]): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const hasPrequels = relatedAnime.some(r => r.type === "PREQUEL");
  const hasSequels = relatedAnime.some(r => r.type === "SEQUEL");
  const hasSideStories = relatedAnime.some(r => r.type === "SIDE_STORY" || r.type === "SPIN_OFF");

  const includeParts: string[] = [];
  if (hasPrequels) includeParts.push("prequels");
  if (hasSequels) includeParts.push("sequels");
  if (hasSideStories) includeParts.push("side stories");
  const includesText = includeParts.length > 0 ? includeParts.join(", ") + ", and related entries" : "related entries";

  const whyMatters = relatedAnime.length > 2
    ? `The ${title} franchise has <strong class="text-purple-400 font-semibold">${relatedAnime.length + 1}</strong> entries, making it important to watch them in the right order to fully understand the story, character development, and plot connections between series.`
    : `While ${title} can be enjoyed on its own, watching related entries in the correct order enhances the overall experience and helps you catch references and connections between the series.`;

  let orderList: string;
  if (relatedAnime.length > 0) {
    const items = relatedAnime.map((r) => `<li class="text-gray-300"><strong class="text-white font-semibold">${escapeHtml(r.title)}</strong> (${r.type.replace(/_/g, " ").toLowerCase()})</li>`).join("\n");
    orderList = `<ol class="list-decimal list-inside space-y-1 text-gray-300 mb-4">\n${items}\n</ol>`;
  } else {
    orderList = `<ol class="list-decimal list-inside space-y-1 text-gray-300 mb-4">\n<li class="text-gray-300"><strong class="text-white font-semibold">${title}</strong> (Main Series)</li>\n</ol>`;
  }

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Watch Order Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">Looking for the correct order to watch the <strong class="text-white font-semibold">${title}</strong> series? This guide covers the recommended watch order including ${includesText}.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why Watch Order Matters</h3>
<p class="text-gray-300 leading-relaxed mb-4">${whyMatters}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Recommended Watch Order</h3>
<p class="text-gray-300 leading-relaxed mb-4">The following order is recommended for the best viewing experience. This is the <strong class="text-white font-semibold">chronological order</strong> that follows the story timeline:</p>
${orderList}
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Release Order vs Chronological Order</h3>
<p class="text-gray-300 leading-relaxed mb-4">For first-time viewers, we generally recommend <strong class="text-white font-semibold">release order</strong> as it provides the intended viewing experience designed by the creators. Chronological order is better suited for rewatches when you want to experience the story's timeline linearly.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Tips for New Viewers</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
<li>Start with the main series if you're unsure</li>
<li>Side stories and OVAs can be watched after completing the main storyline</li>
<li>Movies may or may not be canon — check individual entries for details</li>
</ul>`;
}

export function generateEpisodeGuideContent(anime: AnimeData): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const aboutText = anime.description ? escapeHtml(anime.description) : `${title} is a popular anime series${anime.genres.length > 0 ? ` in the ${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ")} genre${anime.genres.length > 1 ? "s" : ""}` : ""}.`;

  const seriesInfoItems: string[] = [
    `<li><strong class="text-white font-semibold">Total Episodes:</strong> <span class="text-purple-400 font-semibold">${anime.totalEpisodes}</span></li>`,
    `<li><strong class="text-white font-semibold">Status:</strong> ${formatStatus(anime.status)}</li>`,
  ];
  if (anime.seasonYear) {
    seriesInfoItems.push(`<li><strong class="text-white font-semibold">Year:</strong> ${anime.seasonYear}</li>`);
  }
  if (anime.genres.length > 0) {
    seriesInfoItems.push(`<li><strong class="text-white font-semibold">Genres:</strong> ${anime.genres.map(g => escapeHtml(g)).join(", ")}</li>`);
  }

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Episode Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">Complete episode guide for <strong class="text-white font-semibold">${title}</strong> with ${anime.totalEpisodes} episodes. This guide includes filler markers to help you identify which episodes are canon and which can be skipped.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">About ${title}</h3>
<p class="text-gray-300 leading-relaxed mb-4">${aboutText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Series Information</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
${seriesInfoItems.join("\n")}
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Episode Legend</h3>
<ul class="list-none space-y-1 text-gray-300 mb-4">
<li>🟢 <strong class="text-white font-semibold">Canon</strong> — Essential to the main storyline</li>
<li>🔴 <strong class="text-white font-semibold">Filler</strong> — Can be safely skipped</li>
<li>🟡 <strong class="text-white font-semibold">Mixed</strong> — Contains both canon and filler content</li>
</ul>`;
}

export function generateAnimePageContent(anime: AnimeData): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const descText = anime.description ? escapeHtml(anime.description) : `${title} is an anime series${anime.genres.length > 0 ? ` featuring ${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ").toLowerCase()} themes` : ""}.`;

  const detailItems: string[] = [
    `<li><strong class="text-white font-semibold">Episodes:</strong> ${anime.totalEpisodes || "Unknown"}</li>`,
    `<li><strong class="text-white font-semibold">Status:</strong> ${formatStatus(anime.status)}</li>`,
  ];
  if (anime.seasonYear) {
    detailItems.push(`<li><strong class="text-white font-semibold">Aired:</strong> ${anime.seasonYear}</li>`);
  }
  if (anime.genres.length > 0) {
    detailItems.push(`<li><strong class="text-white font-semibold">Genres:</strong> ${anime.genres.map(g => escapeHtml(g)).join(", ")}</li>`);
  }

  return `<p class="text-gray-300 leading-relaxed mb-4">${descText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Series Details</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
${detailItems.join("\n")}
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Guides Available</h3>
<p class="text-gray-300 leading-relaxed mb-4">Explore our comprehensive guides for ${title}:</p>`;
}

export function generateGenrePageContent(genre: string, animeCount: number): string {
  const safeGenre = escapeHtml(genre);
  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Best ${safeGenre} Anime</h2>
<p class="text-gray-300 leading-relaxed mb-4">Discover the top <strong class="text-purple-400 font-semibold">${animeCount}</strong> ${safeGenre.toLowerCase()} anime series ranked by popularity. Whether you're a long-time fan of ${safeGenre.toLowerCase()} anime or looking to explore the genre for the first time, this curated list features the most acclaimed and popular series.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">What is ${safeGenre} Anime?</h3>
<p class="text-gray-300 leading-relaxed mb-4">${getGenreDescription(genre)}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">How We Rank</h3>
<p class="text-gray-300 leading-relaxed mb-4">Our ranking is based on a combination of popularity scores, user ratings, and critical reception from major anime databases. We update this list regularly to include new releases and reflect changing audience preferences.</p>`;
}

export function generateYearPageContent(year: number, animeCount: number): string {
  const overviewText = year >= 2020
    ? `${year} was a standout year for anime with high-quality productions across multiple genres and studios pushing creative boundaries.`
    : year >= 2010
      ? `${year} represented the modern era of anime with improved production quality and diverse storytelling.`
      : `${year} was part of anime's classic era, producing timeless series that continue to influence the medium today.`;

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Best Anime of ${year}</h2>
<p class="text-gray-300 leading-relaxed mb-4">Explore the top <strong class="text-purple-400 font-semibold">${animeCount}</strong> anime series that aired in <strong class="text-purple-400 font-semibold">${year}</strong>. From action-packed adventures to emotional dramas, ${year} brought us some incredible anime worth watching.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">${year} Anime Overview</h3>
<p class="text-gray-300 leading-relaxed mb-4">${overviewText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">How to Use This Page</h3>
<p class="text-gray-300 leading-relaxed mb-4">Browse our curated selection of ${year}'s best anime below. Each entry includes key information like genre, episode count, and synopsis to help you find your next watch.</p>`;
}

export function generateAnimeLikeContent(anime: AnimeData, similarAnime: { title: string; slug: string }[]): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Anime Like ${title}</h2>
<p class="text-gray-300 leading-relaxed mb-4">Looking for anime similar to <strong class="text-white font-semibold">${title}</strong>? Here are ${similarAnime.length} anime recommendations that share similar themes, genres, or storytelling styles.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why These Recommendations?</h3>
<p class="text-gray-300 leading-relaxed mb-4">We selected these anime based on shared genres (${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ")}), similar narrative structures, comparable art styles, and positive fan overlap. If you enjoyed ${title}, these series should appeal to your taste.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Our Top Picks</h3>`;
}

function formatStatus(status: string | null | undefined): string {
  const statusMap: Record<string, string> = {
    FINISHED: "Completed",
    RELEASING: "Currently Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return statusMap[status || ""] || "Unknown";
}

function getGenreDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    Action: "Action anime features intense combat sequences, epic battles, and high-stakes confrontations. These series typically follow protagonists who must fight to protect what they believe in, featuring impressive choreography and power systems.",
    Adventure: "Adventure anime takes viewers on journeys through vast worlds, following characters as they explore unknown territories, discover ancient secrets, and grow through their experiences on the road.",
    Comedy: "Comedy anime aims to entertain through humor, featuring witty dialogue, absurd situations, slapstick moments, and clever parodies that keep viewers laughing episode after episode.",
    Drama: "Drama anime explores deep emotional themes, complex character relationships, and realistic portrayals of human struggles. These series often tackle heavy subjects with nuance and sensitivity.",
    Fantasy: "Fantasy anime transports viewers to magical worlds filled with supernatural elements, mythical creatures, and extraordinary powers. These series often feature complex magic systems and epic world-building.",
    Romance: "Romance anime focuses on love stories and relationships, exploring the development of romantic connections between characters through tender moments, misunderstandings, and emotional growth.",
    "Sci-Fi": "Science fiction anime explores futuristic technologies, space exploration, artificial intelligence, and speculative scenarios that challenge our understanding of reality and humanity's potential.",
    Horror: "Horror anime creates atmospheric dread and terror through supernatural threats, psychological horror, and disturbing imagery designed to unsettle and frighten viewers.",
    Mystery: "Mystery anime engages viewers with puzzles, investigations, and hidden truths waiting to be uncovered. These series reward attentive viewers who enjoy piecing together clues.",
    Thriller: "Thriller anime keeps viewers on the edge of their seats with suspenseful plots, psychological mind games, and unexpected twists that create a sense of urgency and tension.",
    Sports: "Sports anime captures the excitement of athletic competition, following dedicated athletes as they train, compete, and push their limits while building teamwork and rivalries.",
    Supernatural: "Supernatural anime deals with phenomena beyond natural explanation, featuring ghosts, demons, psychic abilities, and otherworldly forces that exist alongside or threaten the everyday world.",
    Slice_of_Life: "Slice of Life anime portrays everyday experiences in a relatable and often heartwarming way, finding beauty and meaning in ordinary moments and everyday interactions.",
    Mecha: "Mecha anime features giant robots and mechanical suits, often set against the backdrop of war or alien invasions, combining action with themes of technology and humanity.",
  };
  return descriptions[genre] || `${genre} anime encompasses a wide range of series that share thematic elements and storytelling approaches unique to this genre, offering viewers diverse experiences within a focused narrative framework.`;
}

// SEO Meta generators
export function generateMetaTitle(type: string, anime?: AnimeData, extra?: string): string {
  const siteName = "Anime Guide Engine";
  switch (type) {
    case "filler":
      return `${anime?.titleEnglish || anime?.title} Filler List | Episodes to Skip | ${siteName}`;
    case "watch-order":
      return `${anime?.titleEnglish || anime?.title} Watch Order Guide (${new Date().getFullYear()}) | ${siteName}`;
    case "episodes":
      return `${anime?.titleEnglish || anime?.title} Episode Guide - All ${anime?.totalEpisodes} Episodes | ${siteName}`;
    case "anime":
      return `${anime?.titleEnglish || anime?.title} - Synopsis, Episodes & Guides | ${siteName}`;
    case "genre":
      return `Best ${extra} Anime - Top Series Ranked | ${siteName}`;
    case "year":
      return `Best Anime of ${extra} - Top Series That Year | ${siteName}`;
    case "anime-like":
      return `Anime Like ${anime?.titleEnglish || anime?.title} - Similar Recommendations | ${siteName}`;
    default:
      return siteName;
  }
}

export function generateMetaDescription(type: string, anime?: AnimeData, extra?: string): string {
  switch (type) {
    case "filler":
      return `Complete ${anime?.titleEnglish || anime?.title} filler episode list. Find out which episodes are filler, canon, or mixed. Skip filler and watch only what matters.`;
    case "watch-order":
      return `The definitive ${anime?.titleEnglish || anime?.title} watch order guide. Learn the correct order to watch all series, movies, and OVAs in the franchise.`;
    case "episodes":
      return `Full episode guide for ${anime?.titleEnglish || anime?.title} with all ${anime?.totalEpisodes} episodes listed. Includes filler markers and arc breakdowns.`;
    case "anime":
      return `Everything about ${anime?.titleEnglish || anime?.title}: synopsis, episode count, filler guide, watch order, and recommendations for similar anime.`;
    case "genre":
      return `Discover the best ${extra?.toLowerCase()} anime series. Ranked list of top ${extra?.toLowerCase()} anime with ratings, episode counts, and descriptions.`;
    case "year":
      return `The best anime series from ${extra}. Complete ranked list of top anime that aired in ${extra} with ratings and descriptions.`;
    case "anime-like":
      return `Looking for anime similar to ${anime?.titleEnglish || anime?.title}? Here are our top recommendations based on genre, themes, and fan ratings.`;
    default:
      return "Comprehensive anime guides including filler lists, watch orders, and episode guides for all popular anime series.";
  }
}

export function generateMetaKeywords(type: string, anime?: AnimeData, extra?: string): string[] {
  const baseKeywords = ["anime", "guide", "AniYume"];
  const currentYear = new Date().getFullYear().toString();

  switch (type) {
    case "filler": {
      const title = anime?.titleEnglish || anime?.title || "";
      const keywords = [
        title,
        `${title} filler list`,
        `${title} filler guide`,
        `${title} episodes to skip`,
        `${title} canon episodes`,
        ...baseKeywords,
      ];
      if (anime?.genres) {
        keywords.push(...anime.genres.slice(0, 3).map(g => `${g.toLowerCase()} anime`));
      }
      return keywords;
    }
    case "genre": {
      const genre = extra || "";
      return [
        `${genre} anime`,
        `best ${genre.toLowerCase()} anime`,
        `top ${genre.toLowerCase()} anime`,
        `${genre.toLowerCase()} anime ${currentYear}`,
        `${genre.toLowerCase()} anime recommendations`,
        ...baseKeywords,
      ];
    }
    case "anime": {
      const title = anime?.titleEnglish || anime?.title || "";
      const keywords = [title, ...baseKeywords];
      if (anime?.title && anime.title !== anime.titleEnglish) {
        keywords.push(anime.title);
      }
      if (anime?.genres) {
        keywords.push(...anime.genres.slice(0, 3));
      }
      if (anime?.status) {
        keywords.push(anime.status === "RELEASING" ? "currently airing" : "completed anime");
      }
      return keywords;
    }
    case "year": {
      return [
        `best anime ${extra}`,
        `top anime ${extra}`,
        `anime ${extra}`,
        `${extra} anime list`,
        ...baseKeywords,
      ];
    }
    default:
      return baseKeywords;
  }
}