import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const fma = await p.$queryRawUnsafe(
    `SELECT slug, title FROM "Anime" WHERE title ILIKE '%fullmetal alchemist%' LIMIT 5`
  );
  console.log("FMA:", JSON.stringify(fma, null, 2));

  const kimetsu = await p.$queryRawUnsafe(
    `SELECT slug, title, popularity FROM "Anime" WHERE title ILIKE '%kimetsu no yaiba%' ORDER BY popularity DESC NULLS LAST LIMIT 5`
  );
  console.log("Kimetsu:", JSON.stringify(kimetsu, null, 2));

  const rezero = await p.$queryRawUnsafe(
    `SELECT slug, title, popularity FROM "Anime" WHERE title ILIKE 'Re:Zero%' ORDER BY popularity DESC NULLS LAST LIMIT 5`
  );
  console.log("Re:Zero:", JSON.stringify(rezero, null, 2));

  await p.$disconnect();
})();
