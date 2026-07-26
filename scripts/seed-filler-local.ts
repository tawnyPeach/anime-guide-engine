/**
 * Seed filler data from local filler-data.ts into the database.
 * Uses raw pg client to avoid Prisma pool exhaustion on Aiven free tier.
 *
 * Usage: DATABASE_URL="..." npx tsx scripts/seed-filler-local.ts
 */

import { Pool } from "pg";
import { getAllFillerData, calculateFillerStats } from "../src/lib/filler-data";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const fillerData = getAllFillerData();
  console.log(`Loaded ${fillerData.length} filler entries`);

  let matched = 0;
  let skipped = 0;
  let notFound = 0;

  for (const entry of fillerData) {
    if (entry.fillerEpisodes.length === 0 && entry.mixedCanonFillerEpisodes.length === 0) {
      skipped++;
      continue;
    }

    // Find by slug
    let result = await pool.query(`SELECT id, title FROM "Anime" WHERE slug = $1 LIMIT 1`, [entry.slug]);

    // Fallback: title match
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT id, title FROM "Anime" WHERE title ILIKE $1 OR "titleEnglish" ILIKE $1 LIMIT 1`,
        [`%${entry.title}%`]
      );
    }

    if (result.rows.length === 0) {
      console.log(`  [NOT FOUND] ${entry.title} (${entry.slug})`);
      notFound++;
      continue;
    }

    const anime = result.rows[0];
    const stats = calculateFillerStats(entry);

    await pool.query(
      `INSERT INTO "FillerMapping" ("animeId", "fillerEpisodes", "mixedEpisodes", "canonEpisodes", "totalFiller", "totalMixed", "totalCanon", "fillerPercent")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT ("animeId") DO UPDATE SET
         "fillerEpisodes" = EXCLUDED."fillerEpisodes",
         "mixedEpisodes" = EXCLUDED."mixedEpisodes",
         "canonEpisodes" = EXCLUDED."canonEpisodes",
         "totalFiller" = EXCLUDED."totalFiller",
         "totalMixed" = EXCLUDED."totalMixed",
         "totalCanon" = EXCLUDED."totalCanon",
         "fillerPercent" = EXCLUDED."fillerPercent"`,
      [
        anime.id,
        JSON.stringify(entry.fillerEpisodes),
        JSON.stringify(entry.mixedCanonFillerEpisodes),
        JSON.stringify(entry.canonEpisodes),
        stats.totalFiller,
        stats.totalMixed,
        stats.totalCanon,
        stats.fillerPercent,
      ]
    );

    matched++;
    console.log(`  [OK] ${entry.title} → ${anime.title}: ${stats.totalFiller} filler, ${stats.totalMixed} mixed`);
  }

  console.log(`\nDone: ${matched} matched, ${skipped} skipped (no filler), ${notFound} not found in DB`);
  await pool.end();
}

main().catch(console.error);
