import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchPopularAnime, normalizeAniListMedia, generateSlug } from "@/lib/anilist";
import { fetchFillerDataFromGitHub, calculateFillerStats } from "@/lib/filler-data";
import { sleep, jikanLimiter } from "@/lib/rate-limiter";

interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese: string | null;
  title_romanji: string | null;
  aired: string | null;
  filler: boolean;
  recap: boolean;
}

interface JikanEpisodesResponse {
  data: JikanEpisode[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
  };
}

const TIMEOUT_LIMIT_MS = 4.5 * 60 * 1000; // 4.5 minutes (leave buffer for 5-min timeout)

export async function GET(request: Request) {
  const startTime = Date.now();

  // Verify authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[cron/sync] CRON_SECRET is not configured');
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = {
    animeUpserted: 0,
    fillerUpdated: 0,
    episodeTitlesUpdated: 0,
    errors: [] as string[],
  };

  try {
    // Step 1: Fetch first 5 pages from AniList (top 250 anime)
    for (let page = 1; page <= 5; page++) {
      if (Date.now() - startTime > TIMEOUT_LIMIT_MS) {
        stats.errors.push("Approaching timeout limit, stopping AniList fetch");
        break;
      }

      try {
        const response = await fetchPopularAnime(page, 50);
        const mediaList = response.data.Page.media;

        for (const media of mediaList) {
          try {
            const normalized = normalizeAniListMedia(media);
            let slug = generateSlug(normalized.title);

            const existingSlug = await prisma.anime.findUnique({ where: { slug } });
            if (existingSlug && existingSlug.anilistId !== normalized.anilistId) {
              slug = `${slug}-${normalized.anilistId}`;
            }

            const anime = await prisma.anime.upsert({
              where: { anilistId: normalized.anilistId },
              update: {
                title: normalized.title,
                titleEnglish: normalized.titleEnglish,
                titleJapanese: normalized.titleJapanese,
                description: normalized.description,
                genres: normalized.genres,
                totalEpisodes: normalized.totalEpisodes,
                status: normalized.status,
                season: normalized.season,
                seasonYear: normalized.seasonYear,
                coverImage: normalized.coverImage,
                bannerImage: normalized.bannerImage,
                averageScore: normalized.averageScore,
                popularity: normalized.popularity,
                format: normalized.format,
                source: normalized.source,
                studios: normalized.studios,
              },
              create: {
                title: normalized.title,
                titleEnglish: normalized.titleEnglish,
                titleJapanese: normalized.titleJapanese,
                slug,
                description: normalized.description,
                genres: normalized.genres,
                totalEpisodes: normalized.totalEpisodes,
                status: normalized.status,
                season: normalized.season,
                seasonYear: normalized.seasonYear,
                coverImage: normalized.coverImage,
                bannerImage: normalized.bannerImage,
                malId: normalized.malId,
                anilistId: normalized.anilistId,
                averageScore: normalized.averageScore,
                popularity: normalized.popularity,
                format: normalized.format,
                source: normalized.source,
                studios: normalized.studios,
              },
            });

            // Create episode placeholders if needed
            if (anime.totalEpisodes > 0) {
              const existingEpisodes = await prisma.episode.count({
                where: { animeId: anime.id },
              });

              if (existingEpisodes === 0) {
                const episodes = Array.from({ length: anime.totalEpisodes }, (_, i) => ({
                  animeId: anime.id,
                  episodeNumber: i + 1,
                  isFiller: false,
                  isMixedCanonFiller: false,
                }));

                await prisma.episode.createMany({ data: episodes });
              }
            }

            stats.animeUpserted++;
          } catch (err) {
            stats.errors.push(`Upsert ${media.title.romaji}: ${(err as Error).message}`);
          }
        }

        // Wait between pages to respect rate limits
        if (page < 5) {
          await sleep(1500);
        }
      } catch (err) {
        stats.errors.push(`AniList page ${page}: ${(err as Error).message}`);
      }
    }

    // Step 2: Update filler data from GitHub
    if (Date.now() - startTime < TIMEOUT_LIMIT_MS) {
      try {
        const fillerData = await fetchFillerDataFromGitHub();

        for (const entry of fillerData) {
          const anime = await prisma.anime.findFirst({
            where: {
              OR: [
                { slug: entry.slug },
                { title: { contains: entry.title } },
                { titleEnglish: { contains: entry.title } },
              ],
            },
          });

          if (anime) {
            const fillerStats = calculateFillerStats(entry);

            await prisma.fillerMapping.upsert({
              where: { animeId: anime.id },
              update: {
                fillerEpisodes: JSON.stringify(entry.fillerEpisodes),
                mixedEpisodes: JSON.stringify(entry.mixedCanonFillerEpisodes),
                canonEpisodes: JSON.stringify(entry.canonEpisodes),
                totalFiller: fillerStats.totalFiller,
                totalMixed: fillerStats.totalMixed,
                totalCanon: fillerStats.totalCanon,
                fillerPercent: fillerStats.fillerPercent,
              },
              create: {
                animeId: anime.id,
                fillerEpisodes: JSON.stringify(entry.fillerEpisodes),
                mixedEpisodes: JSON.stringify(entry.mixedCanonFillerEpisodes),
                canonEpisodes: JSON.stringify(entry.canonEpisodes),
                totalFiller: fillerStats.totalFiller,
                totalMixed: fillerStats.totalMixed,
                totalCanon: fillerStats.totalCanon,
                fillerPercent: fillerStats.fillerPercent,
              },
            });

            stats.fillerUpdated++;
          }
        }
      } catch (err) {
        stats.errors.push(`Filler update: ${(err as Error).message}`);
      }
    }

    // Step 3: Fetch episode titles from Jikan (limit to 20 anime per run)
    if (Date.now() - startTime < TIMEOUT_LIMIT_MS) {
      const animeNeedingTitles = await prisma.anime.findMany({
        where: {
          malId: { not: null },
          totalEpisodes: { gt: 0 },
          episodes: {
            some: { title: null },
          },
        },
        select: {
          id: true,
          malId: true,
          title: true,
          totalEpisodes: true,
        },
        take: 20,
      });

      for (const anime of animeNeedingTitles) {
        if (Date.now() - startTime > TIMEOUT_LIMIT_MS) {
          stats.errors.push("Approaching timeout, stopping episode title fetch");
          break;
        }

        try {
          let page = 1;
          let hasNextPage = true;

          while (hasNextPage) {
            await jikanLimiter.wait();

            const response = await fetch(
              `https://api.jikan.moe/v4/anime/${anime.malId}/episodes?page=${page}`,
              { headers: { Accept: "application/json" } }
            );

            if (response.status === 429) {
              await sleep(2000);
              continue;
            }

            if (!response.ok) break;

            const data: JikanEpisodesResponse = await response.json();

            for (const ep of data.data) {
              const title = ep.title || ep.title_romanji || ep.title_japanese;
              if (title) {
                await prisma.episode.updateMany({
                  where: {
                    animeId: anime.id,
                    episodeNumber: ep.mal_id,
                  },
                  data: { title },
                });
                stats.episodeTitlesUpdated++;
              }
            }

            hasNextPage = data.pagination.has_next_page;
            page++;
          }
        } catch (err) {
          stats.errors.push(`Jikan episodes for ${anime.title}: ${(err as Error).message}`);
        }
      }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);

    return NextResponse.json({
      success: true,
      duration: `${elapsed}s`,
      stats,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message,
        stats,
      },
      { status: 500 }
    );
  }
}
