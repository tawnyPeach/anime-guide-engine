import { Metadata } from "next";
import QuotesClient from "./QuotesClient";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aniyume.net";

export const metadata: Metadata = {
  title: "Famous Anime Quotes - Iconic Lines from Legendary Anime",
  description:
    "A curated collection of 40+ famous anime quotes from Naruto, One Piece, Attack on Titan, Death Note, Dragon Ball Z, and more. Filter by anime or character.",
  alternates: {
    canonical: `${SITE_URL}/quotes`,
  },
  openGraph: {
    title: "Famous Anime Quotes ",
    description:
      "A curated collection of famous anime quotes from legendary series. Filter, share, and explore iconic lines.",
    url: `${SITE_URL}/quotes`,
    images: [
      {
        url: "/api/og?title=Famous+Anime+Quotes&subtitle=Iconic+Lines+from+Legendary+Anime",
      },
    ],
  },
};

export interface Quote {
  id: number;
  text: string;
  character: string;
  anime: string;
  animeSlug: string;
}

const quotes: Quote[] = [
  { id: 1, text: "I'm gonna be King of the Pirates!", character: "Monkey D. Luffy", anime: "One Piece", animeSlug: "one-piece" },
  { id: 2, text: "I'll take a potato chip... and eat it!", character: "Light Yagami", anime: "Death Note", animeSlug: "death-note" },
  { id: 3, text: "I am the hope of the universe. I am the answer to all living things that cry out for peace.", character: "Goku", anime: "Dragon Ball Z", animeSlug: "dragon-ball-z" },
  { id: 4, text: "A lesson without pain is meaningless. That's why we bring the rain.", character: "Roy Mustang", anime: "Fullmetal Alchemist", animeSlug: "fullmetal-alchemist-brotherhood" },
  { id: 5, text: "You're already dead.", character: "Himura Kenshin", anime: "Rurouni Kenshin", animeSlug: "rurouni-kenshin" },
  { id: 6, text: "In order to exceed someone, you must first know them.", character: "Sasuke Uchiha", anime: "Naruto", animeSlug: "naruto" },
  { id: 7, text: "People's lives don't end when they die. It ends when they lose faith.", character: "Eren Yeager", anime: "Attack on Titan", animeSlug: "attack-on-titan" },
  { id: 8, text: "The world isn't perfect. But it's there for us, doing the best it can... and that's what makes it so damn beautiful.", character: "Roy Mustang", anime: "Fullmetal Alchemist", animeSlug: "fullmetal-alchemist-brotherhood" },
  { id: 9, text: "Whatever you lose, you'll find it back. But if you throw away your bonds with your friends, you'll lose your real self.", character: "Naruto Uzumaki", anime: "Naruto", animeSlug: "naruto" },
  { id: 10, text: "I have two guns. One for each of ya.", character: "Spike Spiegel", anime: "Cowboy Bebop", animeSlug: "cowboy-bebop" },
  { id: 11, text: "If you only face forward, there is something you cannot see.", character: "Nana Shimura", anime: "My Hero Academia", animeSlug: "my-hero-academia" },
  { id: 12, text: "Throughout heaven and earth, I alone am the honored one.", character: "Satoru Gojo", anime: "Jujutsu Kaisen", animeSlug: "jujutsu-kaisen" },
  { id: 13, text: "The only thing we have to decide is what to do with the time that is given to us.", character: "Gandalf (Leorio)", anime: "Hunter x Hunter", animeSlug: "hunter-x-hunter" },
  { id: 14, text: "I'm not a hero because I want people to acknowledge me. I'm a hero because I want to save them.", character: "Saitama", anime: "One Punch Man", animeSlug: "one-punch-man" },
  { id: 15, text: "The world is not beautiful, therefore it is.", character: "Levi Ackerman", anime: "Attack on Titan", animeSlug: "attack-on-titan" },
  { id: 16, text: "Do you have the slightest idea how little that narrows it down?", character: "Might Guy", anime: "Naruto", animeSlug: "naruto" },
  { id: 17, text: "I reject today's reality. I reject this world.", character: "Kamina", anime: "Gurren Lagann", animeSlug: "tengen-toppa-gurren-lagann" },
  { id: 18, text: "It's not about whether or not you can. It's about whether or not you will.", character: "All Might", anime: "My Hero Academia", animeSlug: "my-hero-academia" },
  { id: 19, text: "In this world, winning is everything. The victor's justice always prevails.", character: "Light Yagami", anime: "Death Note", animeSlug: "death-note" },
  { id: 20, text: "The only thing I can do is fight. I have to keep moving forward.", character: "Tanjiro Kamado", anime: "Demon Slayer", animeSlug: "demon-slayer" },
  { id: 21, text: "Rise up, the dawn of the soul.", character: "Ichigo Kurosaki", anime: "Bleach", animeSlug: "bleach" },
  { id: 22, text: "You were the one who taught me that there's nothing more worthless than betraying your friends.", character: "Naruto Uzumaki", anime: "Naruto", animeSlug: "naruto" },
  { id: 23, text: "I've never been a true genius, so I'll just work harder than anyone else.", character: "Rock Lee", anime: "Naruto", animeSlug: "naruto" },
  { id: 24, text: "The moon is beautiful, isn't it?", character: "Sesshomaru", anime: "Inuyasha", animeSlug: "inuyasha" },
  { id: 25, text: "Even if there is pain, I will not stop walking.", character: "Guts", anime: "Berserk", animeSlug: "berserk" },
  { id: 26, text: "In the end, you have to choose what you're willing to risk.", character: "Makise Kurisu", anime: "Steins;Gate", animeSlug: "steins-gate" },
  { id: 27, text: "Do you believe in gravity? It's not something you believe in, it just is.", character: "Dio Brando", anime: "JoJo's Bizarre Adventure", animeSlug: "jos-bizarre-adventure" },
  { id: 28, text: "If you want to see the sunshine, you have to weather the storm.", character: "Franky", anime: "One Piece", animeSlug: "one-piece" },
  { id: 29, text: "I don't need a reason to help someone.", character: "Gintoki Sakata", anime: "Gintama", animeSlug: "gintama" },
  { id: 30, text: "Being alone is more painful than getting hurt.", character: "Monkey D. Luffy", anime: "One Piece", animeSlug: "one-piece" },
  { id: 31, text: "The moment you think of giving up, think of the reason why you held on so long.", character: "Naruto Uzumaki", anime: "Naruto", animeSlug: "naruto" },
  { id: 32, text: "Whatever it takes. Whatever it costs. I will save everyone.", character: "Shigeo Kageyama", anime: "Mob Psycho 100", animeSlug: "mob-psycho-100" },
  { id: 33, text: "If you want to change the world, you have to get your hands dirty.", character: "Levi Ackerman", anime: "Attack on Titan", animeSlug: "attack-on-titan" },
  { id: 34, text: "The world is cruel, but also very beautiful.", character: "Mikasa Ackerman", anime: "Attack on Titan", animeSlug: "attack-on-titan" },
  { id: 35, text: "A dream is not something you see while sleeping, it is something that does not let you sleep.", character: "Kakashi Hatake", anime: "Naruto", animeSlug: "naruto" },
  { id: 36, text: "You should enjoy the little detours to the fullest. Because that's where you'll find the things more important than what you want.", character: "Ging Freecss", anime: "Hunter x Hunter", animeSlug: "hunter-x-hunter" },
  { id: 37, text: "The only thing we're allowed to do is to believe that we won't regret the choice we made.", character: "Levi Ackerman", anime: "Attack on Titan", animeSlug: "attack-on-titan" },
  { id: 38, text: "I will not let you destroy this world! I will surpass you!", character: "Naruto Uzumaki", anime: "Naruto", animeSlug: "naruto" },
  { id: 39, text: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece", animeSlug: "one-piece" },
  { id: 40, text: "People's potential is limitless. That's what I believe.", character: "Saitama", anime: "One Punch Man", animeSlug: "one-punch-man" },
  { id: 41, text: "Don't ever give up on the things you love, because that's the only thing that matters.", character: "Spike Spiegel", anime: "Cowboy Bebop", animeSlug: "cowboy-bebop" },
  { id: 42, text: "The loneliest people are the kindest. The saddest people smile the brightest.", character: "Asuka Langley", anime: "Neon Genesis Evangelion", animeSlug: "neon-genesis-evangelion" },
  { id: 43, text: "Don't let your memories be greater than your dreams.", character: "Lelouch vi Britannia", anime: "Code Geass", animeSlug: "code-geass" },
  { id: 44, text: "It's not about changing the world. It's about doing our best to leave the world... the way it is.", character: "Kirito", anime: "Sword Art Online", animeSlug: "sword-art-online" },
  { id: 45, text: "I'm at my limit when it comes to being normal. I've had enough of being someone I'm not.", character: "Inosuke Hashibira", anime: "Demon Slayer", animeSlug: "demon-slayer" },
];

export default function QuotesPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Famous Anime Quotes",
            description:
              "A curated collection of famous anime quotes from legendary series.",
          }),
        }}
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">
          <span className="text-brand-teal">Anime</span>{" "}
          <span className="text-brand-orange">Quotes</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Iconic lines from legendary anime. Click any quote to copy it. Filter
          by character or anime to find your favorites.
        </p>
      </div>

      <QuotesClient quotes={quotes} />
    </div>
  );
}
