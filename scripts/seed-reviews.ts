/**
 * Seed Reviews Script
 * Creates realistic reviews for top anime in the database
 * 
 * Usage: npx tsx scripts/seed-reviews.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

interface ReviewSeed {
  slug: string;
  rating: number;
  title: string;
  content: string;
  author: string;
}

const REVIEW_TEMPLATES: ReviewSeed[] = [
  // Attack on Titan
  { slug: "shingeki-no-kyojin", rating: 10, title: "A masterpiece of storytelling", content: "Attack on Titan redefined what anime can be. The world-building is incredible, the plot twists are genuinely shocking, and the character development is top-tier. The final season wraps everything up perfectly.", author: "TitanFan99" },
  { slug: "shingeki-no-kyojin", rating: 9, title: "Incredible but rushed ending", content: "The first three seasons are near-perfect. The pacing in season 4 feels a bit rushed and some character decisions in the finale were controversial, but overall this is one of the greatest anime ever made.", author: "AnimeCritic" },
  { slug: "shingeki-no-kyojin", rating: 8, title: "Great action, confusing politics", content: "The action scenes and animation are stellar. I got a bit lost in the political intrigue later on, but the emotional moments hit hard. Eren's transformation as a character is fascinating.", author: "CasualWatcher" },

  // Death Note
  { slug: "death-note", rating: 10, title: "The perfect cat-and-mouse thriller", content: "Death Note is a masterclass in suspense. Light vs L is one of the greatest rivalries in fiction. Every episode keeps you on the edge of your seat. The psychological warfare is unmatched.", author: "NoteMaster" },
  { slug: "death-note", rating: 9, title: "Iconic for a reason", content: "Started watching because of the memes, stayed for the incredible writing. The second half drops a bit after a certain character leaves, but it's still better than 95% of anime out there.", author: "NewToAnime" },
  { slug: "death-note", rating: 7, title: "Overhyped but still good", content: "It's a solid anime with great mind games, but I think it gets more credit than it deserves. The ending felt predictable and some plot points required too much suspension of disbelief.", author: "HonestReview" },

  // Fullmetal Alchemist: Brotherhood
  { slug: "fullmetal-alchemist-brotherhood", rating: 10, title: "The gold standard of anime", content: "FMA:B is the most complete anime I've ever watched. Perfect pacing, incredible characters, a satisfying ending, and themes that make you think. It does everything right.", author: "AlchemistFan" },
  { slug: "fullmetal-alchemist-brotherhood", rating: 10, title: "Perfect from start to finish", content: "I've rewatched this 4 times and it gets better every time. The foreshadowing is genius, the humor lands, and the emotional moments destroy me every single time. A true masterpiece.", author: "RewatchKing" },

  // Steins;Gate
  { slug: "steins-gate", rating: 10, title: "Time travel done right", content: "Steins;Gate starts slow but once it gets going, it's absolutely unstoppable. The time travel logic is surprisingly consistent and the emotional payoff is incredible. Okabe's character arc is beautiful.", author: "SciFiLover" },
  { slug: "steins-gate", rating: 9, title: "Slow start, incredible payoff", content: "Almost dropped this in the first 8 episodes. So glad I didn't. The second half is some of the most intense anime I've ever seen. The ending had me in tears.", author: "PatientViewer" },

  // Cowboy Bebop
  { slug: "cowboy-bebop", rating: 10, title: "Cool never ages", content: "Cowboy Bebop is effortlessly cool. The jazz soundtrack, the noir atmosphere, the episodic structure that builds to an emotional climax — it's pure art. See you, space cowboy.", author: "BebopFan" },
  { slug: "cowboy-bebop", rating: 8, title: "Style over substance?", content: "Beautiful animation and incredible music, but I sometimes felt the episodic nature made it hard to connect with the characters. The finale is absolutely perfect though.", author: "StoryFirst" },

  // One Piece
  { slug: "one-piece", rating: 10, title: "The greatest adventure ever told", content: "1000+ episodes and it still hasn't peaked. One Piece is the king of world-building. Every arc adds new depth and the payoffs after hundreds of episodes of setup are unmatched.", author: "PirateKing" },
  { slug: "one-piece", rating: 8, title: "Amazing but the pacing...", content: "The story and world are incredible, but good lord the pacing in the anime is rough. The Dressrosa arc could have been half the length. Still, when it hits, it hits HARD.", author: "PacingPolice" },
  { slug: "one-piece", rating: 9, title: "Worth every minute", content: "Yes it's long. Yes it takes commitment. But the emotional moments in One Piece hit like nothing else. The Marineford arc changed anime forever. Keep going past episode 300.", author: "VeteranFan" },

  // Naruto Shippuden
  { slug: "naruto-shippuuden", rating: 8, title: "Nostalgic and epic", content: "Naruto Shippuden has some of the best fights in anime history. The Pain arc is peak fiction. The war arc drags and the ending gets weird, but the journey is what matters.", author: "NarutoRun" },
  { slug: "naruto-shippuuden", rating: 7, title: "Too much filler, too many flashbacks", content: "The core story is great but it's buried under mountains of filler and flashback episodes. If you skip the filler it's an 9/10. With filler it's a 6/10.", author: "SkipFiller" },

  // Jujutsu Kaisen
  { slug: "jujutsu-kaisen", rating: 9, title: "Modern anime at its best", content: "JJK brings fresh energy to the shonen genre. The power system is creative, the fights are beautifully animated, and the characters are all compelling. MAPPA did an incredible job.", author: "SorcererFan" },
  { slug: "jujutsu-kaisen", rating: 8, title: "Great action, confusing lore", content: "The fight choreography is some of the best I've ever seen. However, the curse mechanics and lore can get really confusing. Still, it's a must-watch for any anime fan.", author: "ActionJunkie" },

  // Demon Slayer
  { slug: "demon-slayer-kimetsu-no-yaiba", rating: 9, title: "Visual perfection", content: "Demon Slayer is the most beautiful anime ever made. Ufotable's animation is otherworldly. The story is simple but effective, and the Mugen Train movie had me sobbing.", author: "DemonFan" },
  { slug: "demon-slayer-kimetsu-no-yaiba", rating: 7, title: "Beautiful but shallow", content: "Gorgeous to look at but the story and characters are pretty standard shonen fare. Tanjiro is almost too nice. Still, the entertainment value is sky-high thanks to the animation.", author: "DeepStories" },

  // Hunter x Hunter
  { slug: "hunter-x-hunter-2011", rating: 10, title: "The best shonen ever made", content: "Hunter x Hunter subverts every shonen trope while still being a shonen. The Chimera Ant arc is the most ambitious storytelling I've seen in anime. Every arc is different and amazing.", author: "HunterFan" },
  { slug: "hunter-x-hunter-2011", rating: 9, title: "Genius writing, painful hiatuses", content: "Togashi is a genius. The power system, the characters, the themes — all top tier. My only complaint is the hiatus situation. We need more chapters!", author: "WaitingForMore" },

  // My Hero Academia
  { slug: "boku-no-hero-academia", rating: 8, title: "Superhero anime done right", content: "MHA proves anime can do superheroes better than most Western media. Deku's journey from quirkless to top hero is inspiring. The tournament arc is peak shonen.", author: "PlusUltra" },
  { slug: "boku-no-hero-academia", rating: 7, title: "Good but declining", content: "The first 3 seasons are amazing. After that the pacing drops and some arcs feel bloated. Still entertaining but not the powerhouse it once was.", author: "HonestHero" },

  // Your Name
  { slug: "kimi-no-na-wa", rating: 10, title: "A visual and emotional masterpiece", content: "Your Name is the most beautiful movie I've ever seen. The animation is stunning, the story is heartbreaking and hopeful, and the music by Radwimps is perfect. I've watched it 6 times.", author: "MakotoFan" },
  { slug: "kimi-no-na-wa", rating: 9, title: "Gorgeous but slightly confusing", content: "The body-swap concept evolves into something much deeper and more emotional than I expected. Some plot points are a bit confusing on first watch, but the emotional impact is undeniable.", author: "MovieBuff" },

  // Spy x Family
  { slug: "spy-x-family", rating: 9, title: "The most wholesome anime", content: "Spy x Family is pure joy. Anya is one of the greatest anime characters ever created. The mix of action, comedy, and heartwarming family moments is perfectly balanced.", author: "WakuWaku" },
  { slug: "spy-x-family", rating: 8, title: "Fun but needs more depth", content: "Extremely entertaining and well-animated. I just wish there was more depth to the overall plot. Anya carries every scene though. The dog is also adorable.", author: "CasualFan" },

  // Chainsaw Man
  { slug: "chainsaw-man", rating: 9, title: "Raw, brutal, and brilliant", content: "Chainsaw Man is unlike anything else in anime. It's chaotic, violent, surprisingly emotional, and the animation is phenomenal. Denji is the most relatable shonen protagonist ever.", author: "ChainsawFan" },
  { slug: "chainsaw-man", rating: 8, title: "Unique but not for everyone", content: "If you want traditional shonen storytelling, look elsewhere. Chainsaw Man is deliberately messy and unpredictable. That's either its greatest strength or weakness depending on your taste.", author: "OpenMind" },

  // Mob Psycho 100
  { slug: "mob-psycho-100", rating: 10, title: "Underrated masterpiece", content: "Mob Psycho 100 is the best anime that doesn't get enough credit. The themes of self-improvement without relying on power are beautiful. The animation is creative and expressive.", author: "MobFan" },
  { slug: "mob-psycho-100", rating: 9, title: "Heartwarming and hilarious", content: "Reigen is the greatest anime mentor of all time. The show balances comedy, action, and genuine emotional growth better than almost anything. Please watch this.", author: "ReigenBest" },

  // Code Geass
  { slug: "code-geass-hangyaku-no-lelouch", rating: 10, title: "The greatest ending in anime", content: "Code Geass is a rollercoaster of strategy, politics, and moral ambiguity. Lelouch is one of the most complex protagonists in anime. The ending is perfect — wouldn't change a thing.", author: "GeassFan" },
  { slug: "code-geass-hangyaku-no-lelouch", rating: 8, title: "Genius protagonist, questionable mecha", content: "Lelouch's schemes are incredible to watch unfold. The mecha battles can be a bit silly and the fan service is distracting, but the story and ending elevate everything.", author: "StrategyFan" },

  // Re:Zero
  { slug: "re-zero-kara-hajimeru-isekai-seikatsu", rating: 9, title: "Dark isekai done right", content: "Re:Zero subverts every isekai trope by making suffering a central mechanic. Subaru's deaths are gut-wrenching and the character development is phenomenal. Season 2 is a masterpiece.", author: "ReturnByDeath" },
  { slug: "re-zero-kara-hajimeru-isekai-seikatsu", rating: 7, title: "Depressing but good", content: "This show is emotionally exhausting in the best and worst ways. Subaru's suffering can feel gratuitous at times, but the payoff is usually worth it. Not for the faint of heart.", author: "DarkFantasy" },

  // Violet Evergarden
  { slug: "violet-evergarden", rating: 10, title: "The most beautiful anime ever", content: "Violet Evergarden is art in its purest form. Every frame is a painting. The episodic stories of Violet helping people while learning about emotions had me crying every episode.", author: "AutoMemory" },
  { slug: "violet-evergarden", rating: 9, title: "Gorgeous and emotional", content: "Kyoto Animation poured their heart into this. The animation quality is unmatched, and the story of Violet learning to understand love and loss is profoundly moving.", author: "AnimationFan" },

  // Tokyo Revengers
  { slug: "tokyo-revengers", rating: 7, title: "Great premise, uneven execution", content: "The time-travel gang concept is awesome and the early arcs are gripping. However, the power scaling gets weird and some later arcs drag. Still worth watching for the first season.", author: "TimeTravelFan" },

  // Vinland Saga
  { slug: "vinland-saga", rating: 10, title: "Anime's greatest character study", content: "Vinland Saga transforms from a Viking action anime into a profound meditation on violence, peace, and purpose. Thorfinn's character arc is the best in all of anime. Season 2 is a masterpiece.", author: "VinlandFan" },
  { slug: "vinland-saga", rating: 9, title: "Season 2 is a masterpiece", content: "If you dropped this during the farm arc, go back and finish it. The slow burn pays off beautifully. This is what anime can be when it prioritizes themes over fights.", author: "PatientFan" },

  // Dragon Ball Z
  { slug: "dragon-ball-z", rating: 8, title: "The OG that started it all", content: "Dragon Ball Z is the reason most of us watch anime. The fights are iconic, the transformations are legendary, and the nostalgia factor is off the charts. Still rewatchable.", author: "DBZFan" },
  { slug: "dragon-ball-z", rating: 7, title: "Iconic but hasn't aged well", content: "The fights and transformations are still cool, but the pacing is terrible (especially on Namek), and most characters besides Goku are useless. Nostalgia carries this hard.", author: "ModernFan" },

  // Sword Art Online
  { slug: "sword-art-online", rating: 6, title: "Great concept, mediocre execution", content: "SAO had the potential to be amazing — trapped in a virtual world with death stakes. The first arc is decent but it goes downhill fast. Kirito is too overpowered and the romance feels forced.", author: "GamerAnime" },

  // Attack on Titan final
  { slug: "shingeki-no-kyojin-the-final-season", rating: 9, title: "Controversial but brave", content: "The final season takes huge risks with its story. Not everyone will agree with the direction, but you have to respect Isayama for committing to his vision. The animation is insane.", author: "AoTWatcher" },
];

async function seedReviews() {
  console.log("📝 Seeding reviews...\n");

  // Get existing slugs
  const existingAnime = await prisma.anime.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existingAnime.map((a) => a.slug));

  let created = 0;
  let skipped = 0;

  for (const review of REVIEW_TEMPLATES) {
    if (!existingSlugs.has(review.slug)) {
      console.log(`  ⏭  Skipping "${review.title}" — slug "${review.slug}" not found`);
      skipped++;
      continue;
    }

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
      console.log(`  ✅ Created review: "${review.title}" for ${review.slug}`);
      created++;
    } catch (err) {
      console.log(`  ⚠️  Error creating review "${review.title}": ${err}`);
    }
  }

  console.log(`\n✨ Done! Created ${created} reviews, skipped ${skipped}`);

  const totalCount = await prisma.review.count();
  console.log(`📊 Total reviews in database: ${totalCount}`);
}

seedReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
