const ANILIST_API = "https://graphql.anilist.co";

interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  genres: string[];
  episodes: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  coverImage: {
    large: string | null;
    extraLarge: string | null;
  };
  bannerImage: string | null;
  averageScore: number | null;
  popularity: number | null;
  format: string | null;
  source: string | null;
  studios: {
    nodes: { name: string }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        idMal: number | null;
        title: { romaji: string; english: string | null };
        format: string | null;
      };
    }[];
  };
}

interface AniListResponse {
  data: {
    Page: {
      pageInfo: {
        hasNextPage: boolean;
        currentPage: number;
        total: number;
      };
      media: AniListMedia[];
    };
  };
}

interface AniListSingleResponse {
  data: {
    Media: AniListMedia;
  };
}

const MEDIA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  description(asHtml: false)
  genres
  episodes
  status
  season
  seasonYear
  coverImage {
    large
    extraLarge
  }
  bannerImage
  averageScore
  popularity
  format
  source
  studios(isMain: true) {
    nodes {
      name
    }
  }
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        idMal
        title {
          romaji
          english
        }
        format
      }
    }
  }
`;

async function anilistRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
    console.log(`AniList rate limited. Waiting ${retryAfter}s...`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return anilistRequest<T>(query, variables);
  }

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPopularAnime(page: number = 1, perPage: number = 50): Promise<AniListResponse> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, sort: POPULARITY_DESC, format_in: [TV, TV_SHORT, MOVIE, OVA, ONA]) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  return anilistRequest<AniListResponse>(query, { page, perPage });
}

export async function fetchAnimeById(id: number): Promise<AniListSingleResponse> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
      }
    }
  `;
  return anilistRequest<AniListSingleResponse>(query, { id });
}

export async function fetchAnimeByMalId(malId: number): Promise<AniListSingleResponse> {
  const query = `
    query ($malId: Int) {
      Media(idMal: $malId, type: ANIME) {
        ${MEDIA_FRAGMENT}
      }
    }
  `;
  return anilistRequest<AniListSingleResponse>(query, { malId });
}

export async function searchAnime(search: string, page: number = 1): Promise<AniListResponse> {
  const query = `
    query ($search: String, $page: Int) {
      Page(page: $page, perPage: 20) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  return anilistRequest<AniListResponse>(query, { search, page });
}

export async function fetchAnimeByGenre(genre: string, page: number = 1): Promise<AniListResponse> {
  const query = `
    query ($genre: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, genre: $genre, sort: POPULARITY_DESC, format_in: [TV, MOVIE]) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  return anilistRequest<AniListResponse>(query, { genre, page, perPage: 50 });
}

export async function fetchAnimeByYear(year: number, page: number = 1): Promise<AniListResponse> {
  const query = `
    query ($year: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
          currentPage
          total
        }
        media(type: ANIME, seasonYear: $year, sort: POPULARITY_DESC, format_in: [TV, MOVIE]) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;
  return anilistRequest<AniListResponse>(query, { year, page, perPage: 50 });
}

export function normalizeAniListMedia(media: AniListMedia) {
  return {
    anilistId: media.id,
    malId: media.idMal,
    title: media.title.romaji,
    titleEnglish: media.title.english,
    titleJapanese: media.title.native,
    description: media.description?.replace(/<[^>]*>/g, "") || null,
    genres: JSON.stringify(media.genres),
    totalEpisodes: media.episodes || 0,
    status: media.status,
    season: media.season,
    seasonYear: media.seasonYear,
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large || null,
    bannerImage: media.bannerImage,
    averageScore: media.averageScore,
    popularity: media.popularity,
    format: media.format,
    source: media.source,
    studios: JSON.stringify(media.studios?.nodes?.map((s) => s.name) || []),
    relations: media.relations?.edges?.map((edge) => ({
      relationType: edge.relationType,
      targetAnilistId: edge.node.id,
      targetMalId: edge.node.idMal,
      targetTitle: edge.node.title.romaji || edge.node.title.english,
      targetFormat: edge.node.format,
    })) || [],
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

export type { AniListMedia, AniListResponse };
