/**
 * Seed missing anime from AniList API into the database.
 * Searches by title, inserts with basic metadata.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/seed-missing-anime.ts
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const ANILIST_URL = "https://graphql.anilist.co";

// Missing anime: [filler-title-used, anilist-search-query]
const MISSING_ANIME: [string, string][] = [
  ["Katekyo Hitman Reborn", "Katekyo Hitman Reborn"],
  ["Pokemon", "Pokemon"],
  ["Fullmetal Alchemist 2003", "Fullmetal Alchemist"],
  ["Ace of Diamond", "Ace of Diamond"],
  ["Digimon Adventure", "Digimon Adventure"],
  ["Yu-Gi-Oh! Duel Monsters", "Yu-Gi-Oh! Duel Monsters"],
  ["Yu-Gi-Oh! GX", "Yu-Gi-Oh! GX"],
  ["Yu-Gi-Oh! 5D's", "Yu-Gi-Oh! 5D's"],
  ["Yu-Gi-Oh! Zexal", "Yu-Gi-Oh! Zexal"],
  ["Yu-Gi-Oh! Arc-V", "Yu-Gi-Oh! Arc-V"],
  ["Yu-Gi-Oh! VRAINS", "Yu-Gi-Oh! VRAINS"],
  ["Yu-Gi-Oh! Capsule Monsters", "Yu-Gi-Oh! Capsule Monsters"],
  ["Yu-Gi-Oh! (Toei)", "Yu-Gi-Oh"],
  ["Toriko", "Toriko"],
  ["Zatch Bell", "Konjiki no Gash!!"],
  ["Fist of the North Star", "Hokuto no Ken 1984"],
  ["Black Cat", "Black Cat"],
  ["Rosario + Vampire Capu2", "Rosario to Vampire"],
  ["GANTZ", "Gantz"],
  ["Hana-Yori Dango", "Hana Yori Dango"],
  ["Spider Riders", "Spider Riders"],
  ["MegaMan NT Warrior", "Rockman.EXE"],
  ["Rock Lee & His Ninja Pals", "NARUTO SD"],
  ["Kimagure Orange Road", "Kimagure"],
  ["GetBackers", "GetBackers"],
  ["Hayate the Combat Butler", "Hayate"],
  ["Ikkitousen", "Ikkitousen"],
  ["Tenchi Muyo!", "Tenchi Muyou"],
  ["Tenchi Universe", "Tenchi Muyou"],
  ["Tenchi Muyo! GXP", "Tenchi GXP"],
  ["Mobile Suit Gundam Seed", "Gundam SEED"],
  ["Mobile Suit Gundam Seed Destiny", "Gundam SEED Destiny"],
  ["Digimon Adventure 02", "Digimon Adventure"],
  ["Digimon Tamers", "Digimon Tamers"],
  ["Digimon Frontier", "Digimon Frontier"],
  ["Seikon no Qwaser", "Seikon no Qwaser"],
  ["Hero: 108", "Hero: 108"],
  ["Saint Seiya", "Saint Seiya"],
  ["Ranma ½", "Ranma 1/2"],
  ["Shugo Chara!", "Shugo Chara"],
  ["Magic Knight Rayearth", "Magic Knight Rayearth"],
  ["Tokyo Mew Mew", "Tokyo Mew Mew"],
  ["Soul Hunter", "Hoshin Engi"],
  ["Excel Saga", "Excel Saga"],
  ["Beyblade X", "Beyblade X"],
  ["Beyblade Burst QuadStrike", "Beyblade Burst"],
  ["Beyblade: Metal Fusion", "Beyblade Metal Fusion"],
  ["Nadia: The Secret of Blue Water", "Nadia: Aoi Sekai no Monogatari"],
  ["Outlaw Star", "Seihou Bukyou Outlaw Star"],
  ["Detective School Q", "Detective Academy Q"],
  ["Ace Attorney", "Gyakuten Saiban"],
  ["Hikaru no Go", "Hikaru no Go"],
  ["Urusei Yatsura", "Urusei Yatsura"],
  ["Hunter x Hunter (1999)", "Hunter x Hunter"],
  ["Highschool DxD", "High School DxD"],
  ["Ghost in the Shell: Arise", "Koukaku Kidoutai"],
  ["Slam Dunk", "Slam Dunk"],
  ["Mobile Suit Gundam", "Kidou Senshi Gundam"],
  ["Negima!", "Negima"],
  ["The Prince of Tennis", "The Prince of Tennis"],
  ["Shaman King (2001)", "Shaman King"],
  ["Rave Master", "RAVE Master"],
  ["SKET Dance", "Sket Dance"],
  ["Fate/Kaleid Liner Prisma Illya", "Fate/kaleid liner prisma"],
  ["Campione!", "Campione"],
  ["Sgt. Frog", "Keroro"],
  ["Nadia: The Secret of Blue Water", "Nadia"],
  ["Mobile Suit Gundam Seed", "Gundam SEED"],
  ["Seikon no Qwaser", "Seikon no Qwaser"],
  ["Hero: 108", "Hero: 108"],
];

const SEARCH_QUERY = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title { romaji english native }
    coverImage { large }
    episodes
    format
    status
    averageScore
    popularity
    description(asHtml: false)
    genres
  }
}`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function searchAniList(query: string) {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: query } }),
  });
  const json = await res.json();
  return json.data?.Media || null;
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\n/g, " ").slice(0, 2000);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [fillerTitle, searchQuery] of MISSING_ANIME) {
    const slug = slugify(fillerTitle);

    // Check if already exists
    const existing = await pool.query(`SELECT id FROM "Anime" WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      console.log(`  [EXISTS] ${fillerTitle}`);
      skipped++;
      continue;
    }

    // Search AniList
    const media = await searchAniList(searchQuery);
    if (!media) {
      console.log(`  [NOT FOUND] ${fillerTitle} (searched: ${searchQuery})`);
      failed++;
      await delay(700);
      continue;
    }

    const title = media.title.romaji || fillerTitle;
    const titleEnglish = media.title.english || null;
    const titleJapanese = media.title.native || null;
    const coverImage = media.coverImage?.large || null;
    const totalEpisodes = media.episodes || 0;
    const description = stripHtml(media.description);
    const genres = JSON.stringify(media.genres || []);
    const format = media.format || "UNKNOWN";
    const status = media.status || "FINISHED";

    try {
      await pool.query(
        `INSERT INTO "Anime" (slug, title, "titleEnglish", "titleJapanese", "coverImage", "totalEpisodes", description, genres, format, status, "averageScore", popularity, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
        [slug, title, titleEnglish, titleJapanese, coverImage, totalEpisodes, description, genres, format, status, media.averageScore || null, media.popularity || 0]
      );
      inserted++;
      console.log(`  [INSERTED] ${fillerTitle} → ${title} (${totalEpisodes} eps)`);
    } catch (e: any) {
      console.log(`  [ERROR] ${fillerTitle}: ${e.message}`);
      failed++;
    }

    await delay(700); // AniList rate limit: ~30 req/min
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} already existed, ${failed} failed`);
  await pool.end();
}

main().catch(console.error);
