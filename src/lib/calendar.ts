const ANILIST_API = "https://graphql.anilist.co";

const AIRING_SCHEDULE_QUERY = `
  query ($page: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage currentPage }
      airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: TIME) {
        airingAt
        episode
        media {
          id
          title { romaji english }
          coverImage { large }
          format
          episodes
        }
      }
    }
  }
`;

export interface AiringEntry {
  airingAt: number;
  episode: number;
  media: {
    id: number;
    title: { romaji: string; english: string | null };
    coverImage: { large: string | null };
    format: string | null;
    episodes: number | null;
  };
}

export interface WeeklySchedule {
  [day: number]: AiringEntry[];
}

export interface CalendarData {
  schedule: WeeklySchedule;
  entries: AiringEntry[];
  weekStart: number;
  weekEnd: number;
}

async function fetchAiringPage(
  page: number,
  airingAtGreater: number,
  airingAtLesser: number,
  maxRetries: number = 3
): Promise<{ entries: AiringEntry[]; hasNextPage: boolean }> {
  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: AIRING_SCHEDULE_QUERY,
      variables: { page, airingAtGreater, airingAtLesser },
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (response.status === 429) {
    if (maxRetries <= 0) {
      throw new Error(`AniList API rate limited: max retries exhausted`);
    }
    const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return fetchAiringPage(page, airingAtGreater, airingAtLesser, maxRetries - 1);
  }

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  const data = json.data.Page;
  return {
    entries: data.airingSchedules as AiringEntry[],
    hasNextPage: data.pageInfo.hasNextPage,
  };
}

function getWeekBounds(): { weekStart: number; weekEnd: number } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sunday, 1=Monday...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + mondayOffset);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return {
    weekStart: Math.floor(monday.getTime() / 1000),
    weekEnd: Math.floor(sunday.getTime() / 1000),
  };
}

function getDayBounds(): { dayStart: number; dayEnd: number } {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const dayEnd = new Date(now);
  dayEnd.setUTCHours(23, 59, 59, 999);

  return {
    dayStart: Math.floor(dayStart.getTime() / 1000),
    dayEnd: Math.floor(dayEnd.getTime() / 1000),
  };
}

export async function fetchWeeklySchedule(): Promise<CalendarData> {
  const { weekStart, weekEnd } = getWeekBounds();

  const allEntries: AiringEntry[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= 10) {
    const result = await fetchAiringPage(page, weekStart, weekEnd);
    allEntries.push(...result.entries);
    hasNextPage = result.hasNextPage;
    page++;
  }

  // Group by day of week (0=Monday, 6=Sunday)
  const schedule: WeeklySchedule = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  for (const entry of allEntries) {
    const date = new Date(entry.airingAt * 1000);
    const utcDay = date.getUTCDay(); // 0=Sunday, 1=Monday...
    // Convert to 0=Monday, 6=Sunday
    const dayIndex = utcDay === 0 ? 6 : utcDay - 1;
    schedule[dayIndex].push(entry);
  }

  return { schedule, entries: allEntries, weekStart, weekEnd };
}

export async function fetchTodaySchedule(): Promise<AiringEntry[]> {
  const { dayStart, dayEnd } = getDayBounds();

  const allEntries: AiringEntry[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= 5) {
    const result = await fetchAiringPage(page, dayStart, dayEnd);
    allEntries.push(...result.entries);
    hasNextPage = result.hasNextPage;
    page++;
  }

  return allEntries;
}
