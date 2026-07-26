import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const MISSING_REVIEWS = [
  { slug: "hagane-no-renkinjutsushi-fullmetal-alchemist", rating: 10, title: "The gold standard of anime", content: "FMA is the most complete anime I've ever watched. Perfect pacing, incredible characters, a satisfying ending, and themes that make you think. It does everything right.", author: "AlchemistFan" },
  { slug: "hagane-no-renkinjutsushi-fullmetal-alchemist", rating: 10, title: "Perfect from start to finish", content: "I've rewatched this 4 times and it gets better every time. The foreshadowing is genius, the humor lands, and the emotional moments destroy me every single time. A true masterpiece.", author: "RewatchKing" },
  { slug: "steinsgate", rating: 10, title: "Time travel done right", content: "Steins;Gate starts slow but once it gets going, it's absolutely unstoppable. The time travel logic is surprisingly consistent and the emotional payoff is incredible. Okabe's character arc is beautiful.", author: "SciFiLover" },
  { slug: "steinsgate", rating: 9, title: "Slow start, incredible payoff", content: "Almost dropped this in the first 8 episodes. So glad I didn't. The second half is some of the most intense anime I've ever seen. The ending had me in tears.", author: "PatientViewer" },
  { slug: "kimetsu-no-yaiba", rating: 9, title: "Visual perfection", content: "Demon Slayer is the most beautiful anime ever made. Ufotable's animation is otherworldly. The story is simple but effective, and the Mugen Train movie had me sobbing.", author: "DemonFan" },
  { slug: "kimetsu-no-yaiba", rating: 7, title: "Beautiful but shallow", content: "Gorgeous to look at but the story and characters are pretty standard shonen fare. Tanjiro is almost too nice. Still, the entertainment value is sky-high thanks to the animation.", author: "DeepStories" },
  { slug: "hunterhunter-2011", rating: 10, title: "The best shonen ever made", content: "Hunter x Hunter subverts every shonen trope while still being a shonen. The Chimera Ant arc is the most ambitious storytelling I've seen in anime. Every arc is different and amazing.", author: "HunterFan" },
  { slug: "hunterhunter-2011", rating: 9, title: "Genius writing, painful hiatuses", content: "Togashi is a genius. The power system, the characters, the themes — all top tier. My only complaint is the hiatus situation. We need more chapters!", author: "WaitingForMore" },
  { slug: "spyfamily", rating: 9, title: "The most wholesome anime", content: "Spy x Family is pure joy. Anya is one of the greatest anime characters ever created. The mix of action, comedy, and heartwarming family moments is perfectly balanced.", author: "WakuWaku" },
  { slug: "spyfamily", rating: 8, title: "Fun but needs more depth", content: "Extremely entertaining and well-animated. I just wish there was more depth to the overall plot. Anya carries every scene though. The dog is also adorable.", author: "CasualFan" },
  { slug: "rezero-kara-hajimeru-isekai-seikatsu", rating: 9, title: "Dark isekai done right", content: "Re:Zero subverts every isekai trope by making suffering a central mechanic. Subaru's deaths are gut-wrenching and the character development is phenomenal. Season 2 is a masterpiece.", author: "ReturnByDeath" },
  { slug: "rezero-kara-hajimeru-isekai-seikatsu", rating: 7, title: "Depressing but good", content: "This show is emotionally exhausting in the best and worst ways. Subaru's suffering can feel gratuitous at times, but the payoff is usually worth it. Not for the faint of heart.", author: "DarkFantasy" },
];

async function seedMissing() {
  console.log("📝 Seeding missing reviews...\n");
  let created = 0;

  for (const review of MISSING_REVIEWS) {
    try {
      await prisma.review.create({
        data: {
          slug: review.slug,
          rating: review.rating,
          title: review.title,
          content: review.content,
          author: review.author,
        },
      });
      console.log(`  ✅ "${review.title}" for ${review.slug}`);
      created++;
    } catch (err) {
      console.log(`  ⚠️  Error: ${err}`);
    }
  }

  const total = await prisma.review.count();
  console.log(`\n✨ Created ${created} reviews. Total in DB: ${total}`);
}

seedMissing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
