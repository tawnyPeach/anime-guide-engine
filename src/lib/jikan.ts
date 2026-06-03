/**
 * Jikan API v4 (MyAnimeList unofficial API)
 * Used as a fallback data source when AniList data is incomplete
 */

const JIKAN_API = "https://api.jikan.moe/v4";

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  episodes: number | null;
  status: string;
  score: number | null;
  synopsis: string | null;
  year: number | null;
  season: string | null;
  genres: { mal_id: number; name: string }[];
  images: {
    jpg: { large_image_url: string };
  };
  relations: {
    relation: string;
    entry: { mal_id: number; type: string; name: string; url: string }[];
  }[];
}

interface JikanResponse {
  data: JikanAnime;
}

interface JikanSearchResponse {
  data: JikanAnime[];
  pagination: {
    has_next_page: boolean;
    last_visible_page: number;
  };
}

// Jikan has a rate limit of 3 requests per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 350; // ms between requests

async function jikanRequest<T>(endpoint: string): Promise<T> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  const response = await fetch(`${JIKAN_API}${endpoint}`, {
    headers: { Accept: "application/json" },
  });

  if (response.status === 429) {
    console.log("Jikan rate limited. Waiting 2s...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return jikanRequest<T>(endpoint);
  }

  if (!response.ok) {
    throw new Error(`Jikan API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchAnimeByMalId(malId: number): Promise<JikanAnime | null> {
  try {
    const response = await jikanRequest<JikanResponse>(`/anime/${malId}`);
    return response.data;
  } catch {
    console.error(`Failed to fetch anime ${malId} from Jikan`);
    return null;
  }
}

export async function fetchAnimeRelations(malId: number): Promise<JikanAnime["relations"]> {
  try {
    const response = await jikanRequest<JikanResponse>(`/anime/${malId}/relations`);
    return (response as unknown as { data: JikanAnime["relations"] }).data || [];
  } catch {
    return [];
  }
}

export async function searchAnimeJikan(query: string): Promise<JikanAnime[]> {
  try {
    const response = await jikanRequest<JikanSearchResponse>(
      `/anime?q=${encodeURIComponent(query)}&limit=10`
    );
    return response.data;
  } catch {
    return [];
  }
}

export async function fetchTopAnime(page: number = 1): Promise<JikanAnime[]> {
  try {
    const response = await jikanRequest<JikanSearchResponse>(
      `/top/anime?page=${page}&limit=25`
    );
    return response.data;
  } catch {
    return [];
  }
}

export function normalizeJikanStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "Finished Airing": "FINISHED",
    "Currently Airing": "RELEASING",
    "Not yet aired": "NOT_YET_RELEASED",
  };
  return statusMap[status] || "FINISHED";
}

export function normalizeJikanSeason(season: string | null): string | null {
  if (!season) return null;
  return season.toUpperCase();
}

export type { JikanAnime };
