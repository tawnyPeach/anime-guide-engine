/**
 * Database Seed Script
 * Populates the database with top 200 anime from AniList API
 * Also integrates filler data and generates watch orders
 * 
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { fetchPopularAnime, normalizeAniListMedia, generateSlug } from "../src/lib/anilist";
import { getAllFillerData, calculateFillerStats, type FillerEntry } from "../src/lib/filler-data";

const prisma = new PrismaClient();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedAnimeFromAniList() {
  console.log("🎌 Starting anime database seed...\n");

  const totalPages = 4; // 4 pages x 50 = 200 anime
  let totalSeeded = 0;

  for (let page = 1; page <= totalPages; page++) {
    console.log(`📥 Fetching page ${page}/${totalPages} from AniList...`);

    try {
      const response = await fetchPopularAnime(page, 50);
      const mediaList = response.data.Page.media;

      for (const media of mediaList) {
        try {
          const normalized = normalizeAniListMedia(media);
          let slug = generateSlug(normalized.title);

          // Ensure slug uniqueness
          const existingSlug = await prisma.anime.findUnique({ where: { slug } });
          if (existingSlug) {
            slug = `${slug}-${normalized.anilistId}`;
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

          // Store relations
          for (const relation of normalized.relations) {
            if (relation.targetAnilistId && ["PREQUEL", "SEQUEL", "SIDE_STORY", "PARENT", "ALTERNATIVE", "SPIN_OFF"].includes(relation.relationType)) {
              // Check if target anime exists
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
              }
            }
          }

          // Generate episodes placeholders
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

              await prisma.episode.createMany({
                data: episodes,
              });
            }
          }

          totalSeeded++;
          if (totalSeeded % 10 === 0) {
            console.log(`  ✅ Seeded ${totalSeeded} anime...`);
          }
        } catch (err) {
          console.error(`  ❌ Error seeding ${media.title.romaji}:`, (err as Error).message);
        }
      }

      // Rate limit: wait between pages
      if (page < totalPages) {
        console.log("  ⏳ Waiting to respect rate limits...");
        await sleep(2000);
      }
    } catch (err) {
      console.error(`❌ Failed to fetch page ${page}:`, (err as Error).message);
      await sleep(5000);
    }
  }

  console.log(`\n✅ Total anime seeded: ${totalSeeded}`);
}

async function seedFillerData() {
  console.log("\n📊 Seeding filler episode data...\n");

  const fillerData = getAllFillerData();
  let matched = 0;

  for (const entry of fillerData) {
    // Try to match with existing anime in DB by slug or title
    const anime = await findAnimeMatch(entry);

    if (anime) {
      const stats = calculateFillerStats(entry);

      // Update filler mapping
      await prisma.fillerMapping.upsert({
        where: { animeId: anime.id },
        update: {
          fillerEpisodes: JSON.stringify(entry.fillerEpisodes),
          mixedEpisodes: JSON.stringify(entry.mixedCanonFillerEpisodes),
          canonEpisodes: JSON.stringify(entry.canonEpisodes),
          totalFiller: stats.totalFiller,
          totalMixed: stats.totalMixed,
          totalCanon: stats.totalCanon,
          fillerPercent: stats.fillerPercent,
        },
        create: {
          animeId: anime.id,
          fillerEpisodes: JSON.stringify(entry.fillerEpisodes),
          mixedEpisodes: JSON.stringify(entry.mixedCanonFillerEpisodes),
          canonEpisodes: JSON.stringify(entry.canonEpisodes),
          totalFiller: stats.totalFiller,
          totalMixed: stats.totalMixed,
          totalCanon: stats.totalCanon,
          fillerPercent: stats.fillerPercent,
        },
      });

      // Update episode filler markers
      for (const epNum of entry.fillerEpisodes) {
        await prisma.episode.updateMany({
          where: { animeId: anime.id, episodeNumber: epNum },
          data: { isFiller: true },
        });
      }

      for (const epNum of entry.mixedCanonFillerEpisodes) {
        await prisma.episode.updateMany({
          where: { animeId: anime.id, episodeNumber: epNum },
          data: { isMixedCanonFiller: true },
        });
      }

      matched++;
      console.log(`  ✅ Matched filler data: ${entry.title} → ${anime.title}`);
    } else {
      console.log(`  ⚠️ No match found for: ${entry.title}`);
    }
  }

  console.log(`\n✅ Filler data matched: ${matched}/${fillerData.length}`);
}

async function findAnimeMatch(entry: FillerEntry) {
  // Try exact slug match
  let anime = await prisma.anime.findUnique({ where: { slug: entry.slug } });
  if (anime) return anime;

  // Try title search
  anime = await prisma.anime.findFirst({
    where: {
      OR: [
        { title: { contains: entry.title } },
        { titleEnglish: { contains: entry.title } },
        { slug: { contains: entry.slug } },
      ],
    },
  });

  return anime;
}

async function generateWatchOrders() {
  console.log("\n🔗 Generating watch orders...\n");

  // Get all anime with relations
  const animeWithRelations = await prisma.anime.findMany({
    where: {
      relationsFrom: { some: {} },
    },
    include: {
      relationsFrom: {
        include: { toAnime: true },
      },
    },
  });

  let generated = 0;

  for (const anime of animeWithRelations) {
    const orderList = anime.relationsFrom
      .filter((r) => ["PREQUEL", "SEQUEL", "SIDE_STORY", "PARENT"].includes(r.relationType))
      .map((r, index) => ({
        animeId: r.toAnime.id,
        title: r.toAnime.titleEnglish || r.toAnime.title,
        slug: r.toAnime.slug,
        type: r.relationType,
        order: index + 1,
      }));

    if (orderList.length > 0) {
      await prisma.watchOrder.upsert({
        where: { animeId: anime.id },
        update: { orderList: JSON.stringify(orderList) },
        create: {
          animeId: anime.id,
          orderList: JSON.stringify(orderList),
        },
      });
      generated++;
    }
  }

  console.log(`✅ Watch orders generated: ${generated}`);
}

async function generateSEOPages() {
  console.log("\n📄 Generating SEO pages...\n");

  const allAnime = await prisma.anime.findMany({
    include: { fillerMapping: true },
  });

  let pagesCreated = 0;

  for (const anime of allAnime) {
    const genres: string[] = JSON.parse(anime.genres || "[]");
    const animeData = { ...anime, genres };

    // Filler page
    if (anime.fillerMapping) {
      const slug = `${anime.slug}-filler-list`;
      await prisma.sEOPage.upsert({
        where: { slug },
        update: {
          title: `${anime.titleEnglish || anime.title} Filler List`,
          metaTitle: `${anime.titleEnglish || anime.title} Filler List | Episodes to Skip | Anime Guide Engine`,
          metaDesc: `Complete ${anime.titleEnglish || anime.title} filler episode list. Find out which episodes are filler, canon, or mixed.`,
          type: "filler",
          animeId: anime.id,
        },
        create: {
          slug,
          title: `${anime.titleEnglish || anime.title} Filler List`,
          metaTitle: `${anime.titleEnglish || anime.title} Filler List | Episodes to Skip | Anime Guide Engine`,
          metaDesc: `Complete ${anime.titleEnglish || anime.title} filler episode list. Find out which episodes are filler, canon, or mixed.`,
          type: "filler",
          animeId: anime.id,
          keywords: JSON.stringify([`${anime.title} filler`, `${anime.title} filler episodes`, `${anime.title} skip episodes`]),
        },
      });
      pagesCreated++;
    }

    // Episode guide page
    if (anime.totalEpisodes > 0) {
      const slug = `${anime.slug}-episodes`;
      await prisma.sEOPage.upsert({
        where: { slug },
        update: {
          title: `${anime.titleEnglish || anime.title} Episode Guide`,
          metaTitle: `${anime.titleEnglish || anime.title} Episode Guide - All ${anime.totalEpisodes} Episodes | Anime Guide Engine`,
          metaDesc: `Full episode guide for ${anime.titleEnglish || anime.title} with all ${anime.totalEpisodes} episodes.`,
          type: "episodes",
          animeId: anime.id,
        },
        create: {
          slug,
          title: `${anime.titleEnglish || anime.title} Episode Guide`,
          metaTitle: `${anime.titleEnglish || anime.title} Episode Guide - All ${anime.totalEpisodes} Episodes | Anime Guide Engine`,
          metaDesc: `Full episode guide for ${anime.titleEnglish || anime.title} with all ${anime.totalEpisodes} episodes.`,
          type: "episodes",
          animeId: anime.id,
          keywords: JSON.stringify([`${anime.title} episodes`, `${anime.title} episode list`, `${anime.title} episode guide`]),
        },
      });
      pagesCreated++;
    }
  }

  // Genre pages
  const genreSet = new Set<string>();
  for (const anime of allAnime) {
    const genres: string[] = JSON.parse(anime.genres || "[]");
    genres.forEach((g) => genreSet.add(g));
  }

  for (const genre of genreSet) {
    const slug = `genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    await prisma.sEOPage.upsert({
      where: { slug },
      update: {
        title: `Best ${genre} Anime`,
        metaTitle: `Best ${genre} Anime - Top Series Ranked | Anime Guide Engine`,
        metaDesc: `Discover the best ${genre.toLowerCase()} anime series ranked by popularity.`,
        type: "genre",
      },
      create: {
        slug,
        title: `Best ${genre} Anime`,
        metaTitle: `Best ${genre} Anime - Top Series Ranked | Anime Guide Engine`,
        metaDesc: `Discover the best ${genre.toLowerCase()} anime series ranked by popularity.`,
        type: "genre",
        keywords: JSON.stringify([`${genre} anime`, `best ${genre} anime`, `top ${genre} anime`]),
      },
    });
    pagesCreated++;
  }

  // Year pages
  const years = [...new Set(allAnime.map((a) => a.seasonYear).filter(Boolean))] as number[];
  for (const year of years) {
    const slug = `year-${year}`;
    await prisma.sEOPage.upsert({
      where: { slug },
      update: {
        title: `Best Anime of ${year}`,
        metaTitle: `Best Anime of ${year} - Top Series | Anime Guide Engine`,
        metaDesc: `The best anime series from ${year}. Complete ranked list.`,
        type: "year",
      },
      create: {
        slug,
        title: `Best Anime of ${year}`,
        metaTitle: `Best Anime of ${year} - Top Series | Anime Guide Engine`,
        metaDesc: `The best anime series from ${year}. Complete ranked list.`,
        type: "year",
        keywords: JSON.stringify([`${year} anime`, `best anime ${year}`, `anime ${year}`]),
      },
    });
    pagesCreated++;
  }

  console.log(`✅ SEO pages created: ${pagesCreated}`);
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  ANIME GUIDE ENGINE - Database Seeder ");
  console.log("═══════════════════════════════════════\n");

  try {
    await seedAnimeFromAniList();
    await seedFillerData();
    await generateWatchOrders();
    await generateSEOPages();

    // Final stats
    const stats = {
      anime: await prisma.anime.count(),
      episodes: await prisma.episode.count(),
      fillerMappings: await prisma.fillerMapping.count(),
      watchOrders: await prisma.watchOrder.count(),
      relations: await prisma.animeRelation.count(),
      seoPages: await prisma.sEOPage.count(),
    };

    console.log("\n═══════════════════════════════════════");
    console.log("  SEED COMPLETE - Database Statistics  ");
    console.log("═══════════════════════════════════════");
    console.log(`  📺 Anime: ${stats.anime}`);
    console.log(`  📋 Episodes: ${stats.episodes}`);
    console.log(`  🎯 Filler Mappings: ${stats.fillerMappings}`);
    console.log(`  📑 Watch Orders: ${stats.watchOrders}`);
    console.log(`  🔗 Relations: ${stats.relations}`);
    console.log(`  📄 SEO Pages: ${stats.seoPages}`);
    console.log("═══════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
