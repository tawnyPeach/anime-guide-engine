/**
 * Content Generator for SEO pages
 * Generates human-readable, SEO-optimized content for each page type
 */

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
  const title = anime.titleEnglish || anime.title;
  const totalEps = anime.totalEpisodes;

  return `
## ${title} Filler Episode Guide

If you're watching **${title}** and want to skip the filler episodes, you're in the right place. This comprehensive filler guide breaks down every episode so you can focus on the main storyline.

### Quick Summary

- **Total Episodes:** ${totalEps}
- **Canon Episodes:** ${stats.totalCanon} (${Math.round((stats.totalCanon / totalEps) * 100)}%)
- **Filler Episodes:** ${stats.totalFiller} (${stats.fillerPercent}%)
- **Mixed Canon/Filler:** ${stats.totalMixed} (${Math.round((stats.totalMixed / totalEps) * 100)}%)

### What Are Filler Episodes?

Filler episodes in ${title} are episodes that were not adapted from the original source material (manga/light novel). These episodes were created by the anime studio to prevent the anime from catching up to the manga. While some filler episodes can be entertaining, they don't advance the main plot.

### Should You Skip ${title} Filler?

${stats.fillerPercent > 30 
  ? `With **${stats.fillerPercent}%** filler content, ${title} has a significant amount of non-canon episodes. If you're primarily interested in the main storyline, skipping the filler episodes can save you considerable time without missing any important plot developments.`
  : stats.fillerPercent > 15
    ? `${title} has a moderate amount of filler at **${stats.fillerPercent}%**. While not excessive, skipping these episodes will give you a more streamlined viewing experience focused on the core narrative.`
    : `${title} has relatively little filler at only **${stats.fillerPercent}%**. The series stays mostly faithful to its source material, making it a good watch even without skipping any episodes.`
}

### How to Use This Guide

Episodes marked as **Canon** are essential to the story. **Filler** episodes can be safely skipped. **Mixed** episodes contain some canon material alongside filler content — we recommend watching these as they may contain character development or minor plot points that are referenced later.
  `.trim();
}

export function generateWatchOrderContent(anime: AnimeData, relatedAnime: { title: string; slug: string; type: string }[]): string {
  const title = anime.titleEnglish || anime.title;

  const hasPrequels = relatedAnime.some(r => r.type === "PREQUEL");
  const hasSequels = relatedAnime.some(r => r.type === "SEQUEL");
  const hasSideStories = relatedAnime.some(r => r.type === "SIDE_STORY" || r.type === "SPIN_OFF");

  return `
## ${title} Watch Order Guide

Looking for the correct order to watch the **${title}** series? This guide covers the recommended watch order including ${hasPrequels ? "prequels, " : ""}${hasSequels ? "sequels, " : ""}${hasSideStories ? "side stories, " : ""}and related entries.

### Why Watch Order Matters

${relatedAnime.length > 2
  ? `The ${title} franchise has **${relatedAnime.length + 1}** entries, making it important to watch them in the right order to fully understand the story, character development, and plot connections between series.`
  : `While ${title} can be enjoyed on its own, watching related entries in the correct order enhances the overall experience and helps you catch references and connections between the series.`
}

### Recommended Watch Order

The following order is recommended for the best viewing experience. This is the **chronological order** that follows the story timeline:

${relatedAnime.length > 0 
  ? relatedAnime.map((r, i) => `${i + 1}. **${r.title}** (${r.type.replace(/_/g, " ").toLowerCase()})`).join("\n")
  : `1. **${title}** (Main Series)`
}

### Release Order vs Chronological Order

For first-time viewers, we generally recommend **release order** as it provides the intended viewing experience designed by the creators. Chronological order is better suited for rewatches when you want to experience the story's timeline linearly.

### Tips for New Viewers

- Start with the main series if you're unsure
- Side stories and OVAs can be watched after completing the main storyline
- Movies may or may not be canon — check individual entries for details
  `.trim();
}

export function generateEpisodeGuideContent(anime: AnimeData): string {
  const title = anime.titleEnglish || anime.title;

  return `
## ${title} Episode Guide

Complete episode guide for **${title}** with ${anime.totalEpisodes} episodes. This guide includes filler markers to help you identify which episodes are canon and which can be skipped.

### About ${title}

${anime.description || `${title} is a popular anime series${anime.genres.length > 0 ? ` in the ${anime.genres.slice(0, 3).join(", ")} genre${anime.genres.length > 1 ? "s" : ""}` : ""}.`}

### Series Information

- **Total Episodes:** ${anime.totalEpisodes}
- **Status:** ${formatStatus(anime.status)}
${anime.seasonYear ? `- **Year:** ${anime.seasonYear}` : ""}
${anime.genres.length > 0 ? `- **Genres:** ${anime.genres.join(", ")}` : ""}

### Episode Legend

- 🟢 **Canon** — Essential to the main storyline
- 🔴 **Filler** — Can be safely skipped
- 🟡 **Mixed** — Contains both canon and filler content
  `.trim();
}

export function generateAnimePageContent(anime: AnimeData): string {
  const title = anime.titleEnglish || anime.title;

  return `
${anime.description || `${title} is an anime series${anime.genres.length > 0 ? ` featuring ${anime.genres.slice(0, 3).join(", ").toLowerCase()} themes` : ""}.`}

### Series Details

- **Episodes:** ${anime.totalEpisodes || "Unknown"}
- **Status:** ${formatStatus(anime.status)}
${anime.seasonYear ? `- **Aired:** ${anime.seasonYear}` : ""}
${anime.genres.length > 0 ? `- **Genres:** ${anime.genres.join(", ")}` : ""}

### Guides Available

Explore our comprehensive guides for ${title}:
  `.trim();
}

export function generateGenrePageContent(genre: string, animeCount: number): string {
  return `
## Best ${genre} Anime

Discover the top **${animeCount}** ${genre.toLowerCase()} anime series ranked by popularity. Whether you're a long-time fan of ${genre.toLowerCase()} anime or looking to explore the genre for the first time, this curated list features the most acclaimed and popular series.

### What is ${genre} Anime?

${getGenreDescription(genre)}

### How We Rank

Our ranking is based on a combination of popularity scores, user ratings, and critical reception from major anime databases. We update this list regularly to include new releases and reflect changing audience preferences.
  `.trim();
}

export function generateYearPageContent(year: number, animeCount: number): string {
  return `
## Best Anime of ${year}

Explore the top **${animeCount}** anime series that aired in **${year}**. From action-packed adventures to emotional dramas, ${year} brought us some incredible anime worth watching.

### ${year} Anime Overview

${year >= 2020
  ? `${year} was a standout year for anime with high-quality productions across multiple genres and studios pushing creative boundaries.`
  : year >= 2010
    ? `${year} represented the modern era of anime with improved production quality and diverse storytelling.`
    : `${year} was part of anime's classic era, producing timeless series that continue to influence the medium today.`
}

### How to Use This Page

Browse our curated selection of ${year}'s best anime below. Each entry includes key information like genre, episode count, and synopsis to help you find your next watch.
  `.trim();
}

export function generateAnimeLikeContent(anime: AnimeData, similarAnime: { title: string; slug: string }[]): string {
  const title = anime.titleEnglish || anime.title;

  return `
## Anime Like ${title}

Looking for anime similar to **${title}**? Here are ${similarAnime.length} anime recommendations that share similar themes, genres, or storytelling styles.

### Why These Recommendations?

We selected these anime based on shared genres (${anime.genres.slice(0, 3).join(", ")}), similar narrative structures, comparable art styles, and positive fan overlap. If you enjoyed ${title}, these series should appeal to your taste.

### Our Top Picks
  `.trim();
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
