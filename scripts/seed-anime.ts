/**
 * Resumable Anime Seed Script
 * Fetches up to 5000+ anime from AniList API (100 pages x 50 per page)
 * Supports resuming from where it left off and manual page range control.
 *
 * Usage:
 *   npx tsx scripts/seed-anime.ts
 *   npx tsx scripts/seed-anime.ts --start-page 21 --end-page 50
 */

import { PrismaClient } from "@prisma/client";
import { fetchPopularAnime, normalizeAniListMedia, generateSlug } from "../src/lib/anilist";
import { sleep } from "../src/lib/rate-limiter";

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  let startPage: number | null = null;
  let endPage = 100;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--start-page" && args[i + 1]) {
      startPage = parseInt(args[i + 1], 10);
    }
    if (args[i] === "--end-page" && args[i + 1]) {
      endPage = parseInt(args[i + 1], 10);
    }
  }

  return { startPage, endPage };
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  label: string = "request"
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = (err as Error).message;
      if (attempt === maxRetries) {
        throw err;
      }
      const delay = Math.pow(2, attempt) * 1000; // exponential backoff: 2s, 4s, 8s
      console.log(`  Warning: ${label} failed (attempt ${attempt}/${maxRetries}): ${message}`);
      console.log(`  Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
  throw new Error(`${label} failed after ${maxRetries} retries`);
}

async function determineStartPage(): Promise<number> {
  const existingCount = await prisma.anime.count();
  const calculatedPage = Math.floor(existingCount / 50) + 1;
  console.log(`  Found ${existingCount} anime in database.`);
  console.log(`  Calculated start page: ${calculatedPage}`);
  return calculatedPage;
}

async function main() {
  console.log("=======================================");
  console.log("  ANIME SEED - Resumable Batch Fetcher ");
  console.log("=======================================\n");

  const { startPage: manualStartPage, endPage } = parseArgs();

  let startPage: number;
  if (manualStartPage !== null) {
    startPage = manualStartPage;
    console.log(`  Using manual start page: ${startPage}`);
  } else {
    console.log("  Detecting resume point...");
    startPage = await determineStartPage();
  }

  console.log(`  Fetching pages ${startPage} to ${endPage} (${(endPage - startPage + 1) * 50} potential anime)\n`);

  if (startPage > endPage) {
    console.log("  Nothing to do - start page is beyond end page.");
    console.log("  All pages have already been processed.");
    await prisma.$disconnect();
    return;
  }

  let totalNew = 0;
  let totalUpdated = 0;
  let totalRelations = 0;
  let totalEpisodes = 0;
  let totalErrors = 0;

  for (let page = startPage; page <= endPage; page++) {
    console.log(`\n--- Page ${page}/${endPage} ---`);
    console.log(`  Fetching from AniList...`);

    let mediaList;
    try {
      const response = await fetchWithRetry(
        () => fetchPopularAnime(page, 50),
        3,
        `AniList page ${page}`
      );
      mediaList = response.data.Page.media;
    } catch (err) {
      const message = (err as Error).message;
      console.error(`  ERROR: Failed to fetch page ${page} after retries: ${message}`);
      console.log(`  Skipping page ${page} and continuing...`);
      totalErrors++;
      await sleep(5000);
      continue;
    }

    if (!mediaList || mediaList.length === 0) {
      console.log(`  No more anime returned from AniList. Stopping.`);
      break;
    }

    console.log(`  Processing ${mediaList.length} anime...`);

    let pageNew = 0;
    let pageUpdated = 0;
    let pageRelations = 0;
    let pageEpisodes = 0;

    for (const media of mediaList) {
      try {
        const normalized = normalizeAniListMedia(media);
        let slug = generateSlug(normalized.title);

        // Check if this anime already exists
        const existing = await prisma.anime.findUnique({
          where: { anilistId: normalized.anilistId },
        });

        // Ensure slug uniqueness for new entries
        if (!existing) {
          const existingSlug = await prisma.anime.findUnique({ where: { slug } });
          if (existingSlug) {
            slug = `${slug}-${normalized.anilistId}`;
          }
        }

        // Upsert anime
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
            externalLinks: normalized.externalLinks,
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
            externalLinks: normalized.externalLinks,
          },
        });

        if (existing) {
          pageUpdated++;
        } else {
          pageNew++;
        }

        // Store relations (only if target anime already exists in DB)
        for (const relation of normalized.relations) {
          if (
            relation.targetAnilistId &&
            ["PREQUEL", "SEQUEL", "SIDE_STORY", "PARENT", "ALTERNATIVE", "SPIN_OFF"].includes(relation.relationType)
          ) {
            const targetAnime = await prisma.anime.findUnique({
              where: { anilistId: relation.targetAnilistId },
            });

            if (targetAnime) {
              await prisma.animeRelation.upsert({
                where: {
                  fromAnimeId_toAnimeId_relationType: {
                    fromAnimeId: anime.id,
                    toAnimeId: targetAnime.id,
                    relationType: relation.relationType,
                  },
                },
                update: {},
                create: {
                  fromAnimeId: anime.id,
                  toAnimeId: targetAnime.id,
                  relationType: relation.relationType,
                },
              });
              pageRelations++;
            }
          }
        }

        // Create episode placeholders if anime has episodes and none exist yet
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
            pageEpisodes += anime.totalEpisodes;
          }
        }
      } catch (err) {
        console.error(`    Error processing ${media.title.romaji}:`, (err as Error).message);
      }
    }

    totalNew += pageNew;
    totalUpdated += pageUpdated;
    totalRelations += pageRelations;
    totalEpisodes += pageEpisodes;

    const totalProcessed = (page - startPage + 1) * 50;
    console.log(
      `  Page ${page}/${endPage} complete - ${totalProcessed} anime processed. (${pageNew} new, ${pageUpdated} updated this page)`
    );

    // Rate limit: wait between pages
    if (page < endPage) {
      await sleep(2000);
    }
  }

  // Print summary
  console.log("\n=======================================");
  console.log("  SEED COMPLETE - Summary              ");
  console.log("=======================================");
  console.log(`  New anime added:     ${totalNew}`);
  console.log(`  Anime updated:       ${totalUpdated}`);
  console.log(`  Relations created:   ${totalRelations}`);
  console.log(`  Episodes created:    ${totalEpisodes}`);
  if (totalErrors > 0) {
    console.log(`  Pages with errors:   ${totalErrors}`);
  }
  console.log("=======================================\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  prisma.$disconnect();
  process.exit(1);
});
