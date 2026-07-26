/**
 * Fix broken/medium cover images for filler anime.
 * Searches AniList by title to get large cover images.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/fix-covers.ts
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const ANILIST_URL = "https://graphql.anilist.co";

const SEARCH = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    coverImage { large }
  }
}`;

async function fetchCover(title: string): Promise<string | null> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: SEARCH, variables: { search: title } }),
  });
  const json = await res.json();
  return json.data?.Media?.coverImage?.large || null;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const r = await pool.query(`
    SELECT a.id, a.title, a."coverImage"
    FROM "Anime" a
    INNER JOIN "FillerMapping" fm ON a.id = fm."animeId"
    ORDER BY a.title
  `);

  let updated = 0;
  let alreadyOk = 0;
  let failed = 0;

  for (const row of r.rows) {
    const url = row.coverImage || "";
    const isOldFormat = /\/\d+\.jpg$/.test(url);
    const isMedium = url.includes("/cover/medium/");

    if (!isOldFormat && !isMedium) {
      alreadyOk++;
      continue;
    }

    const newUrl = await fetchCover(row.title);
    if (newUrl && newUrl !== url) {
      await pool.query(`UPDATE "Anime" SET "coverImage" = $1 WHERE id = $2`, [newUrl, row.id]);
      updated++;
      console.log(`  [UPDATED] ${row.title}`);
    } else {
      failed++;
      console.log(`  [NO CHANGE] ${row.title}`);
    }

    await delay(700);
  }

  console.log(`\nDone: ${updated} updated, ${alreadyOk} already ok, ${failed} no change`);
  await pool.end();
}

main().catch(console.error);
