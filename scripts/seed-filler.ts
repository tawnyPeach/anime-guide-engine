/**
 * Filler Data Seed Script
 *
 * Scrapes filler episode data from animefillerlist.com and upserts
 * FillerMapping records into the database.
 *
 * Usage:
 *   npm run seed:filler           # Seed filler data (skip existing)
 *   npm run seed:filler -- --force  # Overwrite existing mappings
 *
 * Requires:
 *   - DATABASE_URL environment variable set
 *   - Network access to animefillerlist.com
 */

import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import { RateLimiter } from "../src/lib/rate-limiter";

const prisma = new PrismaClient();
const rateLimiter = new RateLimiter(1000); // 1 request per second

// Anime slugs that match animefillerlist.com URL patterns
const ANIME_SLUGS = [
  "naruto",
  "naruto-shippuuden",
  "bleach",
  "one-piece",
  "dragon-ball-z",
  "dragon-ball",
  "dragon-ball-gt",
  "dragon-ball-super",
  "fairy-tail",
  "boruto-naruto-next-generations",
  "black-clover",
  "gintama",
  "inuyasha",
  "rurouni-kenshin",
  "soul-eater",
  "d-gray-man",
  "katekyo-hitman-reborn",
  "sailor-moon",
  "yu-yu-hakusho",
  "hunter-x-hunter-2011",
  "fullmetal-alchemist",
  "fullmetal-alchemist-brotherhood",
  "pokemon",
  "detective-conan",
  "digimon-adventure",
  "sword-art-online",
  "tokyo-ghoul",
  "my-hero-academia",
  "demon-slayer-kimetsu-no-yaiba",
  "attack-on-titan",
  "death-note",
  "code-geass",
  "neon-genesis-evangelion",
  "cowboy-bebop",
  "trigun",
  "steinsgate",
  "psycho-pass",
  "fate-zero",
  "fate-stay-night",
  "re-zero",
  "konosuba",
  "overlord",
  "that-time-i-got-reincarnated-as-a-slime",
  "vinland-saga",
  "dr-stone",
  "fire-force",
  "blue-exorcist",
  "the-seven-deadly-sins",
  "magi",
  "haikyuu",
  "kurokos-basketball",
  "ace-of-diamond",
  "food-wars",
  "one-punch-man",
  "mob-psycho-100",
  "berserk",
  "claymore",
  "parasyte",
  "ajin",
  "tokyo-revengers",
  "chainsaw-man",
  "spy-x-family",
  "oshi-no-ko",
  "frieren",
  "solo-leveling",
  "dandadan",
  "mashle",
  "undead-unluck",
  "zom-100",
  "hells-paradise",
  "pluto",
  "blue-lock",
  "ranking-of-kings",
  "bocchi-the-rock",
  "lycoris-recoil",
  "cyberpunk-edgerunners",
  "summertime-rendering",
  "made-in-abyss",
  "mushoku-tensei",
  "86-eighty-six",
  "vivy-fluorite-eyes-song",
  "odd-taxi",
  "wonder-egg-priority",
  "akudama-drive",
  "jujutsu-kaisen",
  "bleach-thousand-year-blood-war",
  "tokyo-ghoul-re",
  "eureka-seven",
  "d-gray-man-hallow",
  "toriko",
  "reborn",
  "shaman-king",
  "beelzebub",
  "hitman-reborn",
  "blue-dragon",
  "zatch-bell",
  "kenichi",
  "flame-of-recca",
  "getbackers",
  "law-of-ueki",
  "prince-of-tennis",
  "captain-tsubasa",
  "hajime-no-ippo",
  "slam-dunk",
  "initial-d",
  "great-teacher-onizuka",
  "samurai-champloo",
  "yu-gi-oh",
  "yu-gi-oh-gx",
  "yu-gi-oh-5ds",
  "yu-gi-oh-zexal",
  "yu-gi-oh-arc-v",
  "digimon-adventure-02",
  "digimon-tamers",
  "bakuman",
  "assassination-classroom",
  "the-promised-neverland",
  "dr-stone-new-world",
  "spy-x-family-season-2",
  "rurouni-kenshin-2023",
  "hell-teacher-nube",
  "sailor-moon-crystal",
  "fist-of-the-north-star",
  "city-hunter",
  "lupin-iii",
  "dragon-quest-the-adventure-of-dai",
  "ushio-to-tora",
  "rave-master",
  "medaka-box",
  "world-trigger",
  "radiant",
  "yashahime",
  "boruto-two-blue-vortex",
  "record-of-ragnarok",
  "hell-teacher-nube",
  "mobile-suit-gundam",
  "mobile-suit-gundam-seed",
  "mobile-suit-gundam-wing",
  "mobile-suit-gundam-00",
  "iron-blooded-orphans",
  "macross",
  "tenchi-muyo",
  "ranma-12",
  "urusei-yatsura",
  "maison-ikkoku",
  "ghost-in-the-shell-stand-alone-complex",
  "blood-plus",
  "darker-than-black",
  "durarara",
  "baccano",
  "angel-beats",
  "anohana",
  "clannad",
  "toradora",
  "fruits-basket",
  "your-lie-in-april",
  "violet-evergarden",
  "a-place-further-than-the-universe",
  "march-comes-in-like-a-lion",
  "land-of-the-lustrous",
  "dorohedoro",
  "golden-kamuy",
  "vinland-saga-season-2",
  "kingdom",
  "the-ancient-magus-bride",
  "dororo",
  "banana-fish",
  "megalo-box",
  "sk8-the-infinity",
  "given",
  "yuri-on-ice",
  "haikyu-to-the-top",
  "run-with-the-wind",
  "ping-pong-the-animation",
  "space-brothers",
  "silver-spoon",
  "barakamon",
  "natsume-yuujinchou",
  "mushishi",
  "monster",
  "death-parade",
  "erased",
  "promised-neverland",
  "id-invaded",
  "terror-in-resonance",
  "parasyte-the-maxim",
  "inuyashiki",
  "devilman-crybaby",
  "samurai-jack",
  "afro-samurai",
  "samurai-7",
  "blade-of-the-immortal",
  "drifters",
  "goblin-slayer",
  "shield-hero",
  "arifureta",
  "cautious-hero",
  "dont-toy-with-me-miss-nagatoro",
  "kaguya-sama-love-is-war",
  "quintessential-quintuplets",
  "rent-a-girlfriend",
  "my-dress-up-darling",
  "call-of-the-night",
  "bunny-girl-senpai",
];

interface ScrapedFillerData {
  fillerEpisodes: number[];
  mixedEpisodes: number[];
  canonEpisodes: number[];
  totalEpisodes: number;
}

/**
 * Scrape filler data from animefillerlist.com for a given show slug
 */
async function scrapeFillerData(slug: string): Promise<ScrapedFillerData | null> {
  const url = `https://www.animefillerlist.com/shows/${slug}`;

  try {
    await rateLimiter.wait();

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AnimeGuideEngine/1.0)",
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`  [SKIP] Not found: ${slug}`);
        return null;
      }
      console.warn(`  [ERROR] HTTP ${response.status} for ${slug}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const fillerEpisodes: number[] = [];
    const mixedEpisodes: number[] = [];
    const canonEpisodes: number[] = [];

    // Parse episode list - animefillerlist uses table rows with class indicators
    $(".episodes .ep").each((_i, el) => {
      const $el = $(el);
      const epNum = parseInt($el.find(".ep-num, .Number").text().trim(), 10);
      if (isNaN(epNum)) return;

      if ($el.hasClass("filler")) {
        fillerEpisodes.push(epNum);
      } else if ($el.hasClass("mixed_canon/filler") || $el.hasClass("mixed_canon_filler")) {
        mixedEpisodes.push(epNum);
      } else if ($el.hasClass("canon") || $el.hasClass("manga_canon")) {
        canonEpisodes.push(epNum);
      }
    });

    // Alternative parsing approach for different page structures
    if (fillerEpisodes.length === 0 && mixedEpisodes.length === 0) {
      $("tr.filler span.Label, td.filler").each((_i, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) fillerEpisodes.push(num);
      });

      $('tr.mixed_canon\\/filler span.Label, td.mixed_canon\\/filler').each((_i, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) mixedEpisodes.push(num);
      });

      $("tr.manga_canon span.Label, tr.canon span.Label, td.manga_canon, td.canon").each((_i, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text, 10);
        if (!isNaN(num)) canonEpisodes.push(num);
      });
    }

    // Try yet another selector pattern used by some pages
    if (fillerEpisodes.length === 0 && mixedEpisodes.length === 0 && canonEpisodes.length === 0) {
      $(".EpisodeList .list-group-item, .EpisodeList tr").each((_i, el) => {
        const $el = $(el);
        const className = $el.attr("class") || "";
        const numText = $el.find(".Number, .ep-num").first().text().trim() || $el.find("td:first-child").text().trim();
        const num = parseInt(numText, 10);
        if (isNaN(num)) return;

        if (className.includes("filler") && !className.includes("mixed")) {
          fillerEpisodes.push(num);
        } else if (className.includes("mixed")) {
          mixedEpisodes.push(num);
        } else if (className.includes("canon") || className.includes("manga")) {
          canonEpisodes.push(num);
        }
      });
    }

    const totalEpisodes = fillerEpisodes.length + mixedEpisodes.length + canonEpisodes.length;

    return {
      fillerEpisodes: fillerEpisodes.sort((a, b) => a - b),
      mixedEpisodes: mixedEpisodes.sort((a, b) => a - b),
      canonEpisodes: canonEpisodes.sort((a, b) => a - b),
      totalEpisodes,
    };
  } catch (error) {
    console.error(`  [ERROR] Failed to scrape ${slug}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Find matching anime in the database by slug patterns
 */
async function findAnimeBySlug(slug: string): Promise<{ id: number; slug: string; title: string } | null> {
  // Try exact match first
  const exact = await prisma.anime.findFirst({
    where: { slug },
    select: { id: true, slug: true, title: true },
  });
  if (exact) return exact;

  // Try partial match on slug
  const partial = await prisma.anime.findFirst({
    where: {
      slug: { contains: slug.replace(/-/g, "-") },
    },
    select: { id: true, slug: true, title: true },
  });
  if (partial) return partial;

  // Try matching by title keywords
  const titleKeywords = slug.replace(/-/g, " ");
  const titleMatch = await prisma.anime.findFirst({
    where: {
      OR: [
        { title: { contains: titleKeywords, mode: "insensitive" } },
        { titleEnglish: { contains: titleKeywords, mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, title: true },
  });

  return titleMatch;
}

/**
 * Upsert a FillerMapping record for the given anime
 */
async function upsertFillerMapping(
  animeId: number,
  data: ScrapedFillerData
): Promise<void> {
  const totalFiller = data.fillerEpisodes.length;
  const totalMixed = data.mixedEpisodes.length;
  const totalCanon = data.canonEpisodes.length;
  const total = totalFiller + totalMixed + totalCanon;
  const fillerPercent = total > 0 ? (totalFiller / total) * 100 : 0;

  await prisma.fillerMapping.upsert({
    where: { animeId },
    create: {
      animeId,
      fillerEpisodes: JSON.stringify(data.fillerEpisodes),
      mixedEpisodes: JSON.stringify(data.mixedEpisodes),
      canonEpisodes: JSON.stringify(data.canonEpisodes),
      totalFiller,
      totalMixed,
      totalCanon,
      fillerPercent,
    },
    update: {
      fillerEpisodes: JSON.stringify(data.fillerEpisodes),
      mixedEpisodes: JSON.stringify(data.mixedEpisodes),
      canonEpisodes: JSON.stringify(data.canonEpisodes),
      totalFiller,
      totalMixed,
      totalCanon,
      fillerPercent,
    },
  });
}

/**
 * Update Episode records with filler/mixed flags
 */
async function updateEpisodeFlags(
  animeId: number,
  data: ScrapedFillerData
): Promise<void> {
  // Reset all episodes for this anime
  await prisma.episode.updateMany({
    where: { animeId },
    data: { isFiller: false, isMixedCanonFiller: false },
  });

  // Mark filler episodes
  if (data.fillerEpisodes.length > 0) {
    await prisma.episode.updateMany({
      where: {
        animeId,
        episodeNumber: { in: data.fillerEpisodes },
      },
      data: { isFiller: true },
    });
  }

  // Mark mixed canon/filler episodes
  if (data.mixedEpisodes.length > 0) {
    await prisma.episode.updateMany({
      where: {
        animeId,
        episodeNumber: { in: data.mixedEpisodes },
      },
      data: { isMixedCanonFiller: true },
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log("=== Filler Data Seed Script ===");
  console.log(`Mode: ${force ? "FORCE (overwrite existing)" : "Normal (skip existing)"}`);
  console.log(`Slugs to process: ${ANIME_SLUGS.length}`);
  console.log("");

  let processed = 0;
  let matched = 0;
  let skipped = 0;
  let errors = 0;

  for (const slug of ANIME_SLUGS) {
    processed++;
    console.log(`[${processed}/${ANIME_SLUGS.length}] Processing: ${slug}`);

    // Find matching anime in database
    const anime = await findAnimeBySlug(slug);
    if (!anime) {
      console.log(`  [SKIP] No matching anime in database for: ${slug}`);
      skipped++;
      continue;
    }

    // Check if mapping already exists
    if (!force) {
      const existing = await prisma.fillerMapping.findUnique({
        where: { animeId: anime.id },
      });
      if (existing) {
        console.log(`  [SKIP] Already has filler mapping: ${anime.title}`);
        skipped++;
        continue;
      }
    }

    // Scrape filler data
    const data = await scrapeFillerData(slug);
    if (!data) {
      errors++;
      continue;
    }

    if (data.fillerEpisodes.length === 0 && data.mixedEpisodes.length === 0 && data.canonEpisodes.length === 0) {
      console.log(`  [WARN] No episode data found for: ${slug}`);
      errors++;
      continue;
    }

    // Upsert filler mapping
    await upsertFillerMapping(anime.id, data);

    // Update episode flags
    await updateEpisodeFlags(anime.id, data);

    matched++;
    console.log(
      `  [OK] ${anime.title}: ${data.fillerEpisodes.length} filler, ${data.mixedEpisodes.length} mixed, ${data.canonEpisodes.length} canon`
    );
  }

  console.log("");
  console.log("=== Summary ===");
  console.log(`Total processed: ${processed}`);
  console.log(`Successfully matched & seeded: ${matched}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors/Not found: ${errors}`);
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
