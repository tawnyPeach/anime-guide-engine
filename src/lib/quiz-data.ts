export type Trait =
  | "brave"
  | "cunning"
  | "loyal"
  | "mysterious"
  | "determined"
  | "chaotic"
  | "stoic"
  | "passionate"
  | "genius"
  | "relentless";

export interface QuizAnswer {
  text: string;
  traits: Partial<Record<Trait, number>>;
  emoji: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  answers: QuizAnswer[];
}

export interface CharacterResult {
  name: string;
  anime: string;
  slug: string;
  description: string;
  traits: Partial<Record<Trait, number>>;
  coverImage: string;
  similarAnime: { title: string; slug: string }[];
}

export const TRAIT_LABELS: Record<Trait, string> = {
  brave: "Brave",
  cunning: "Cunning",
  loyal: "Loyal",
  mysterious: "Mysterious",
  determined: "Determined",
  chaotic: "Chaotic",
  stoic: "Stoic",
  passionate: "Passionate",
  genius: "Genius",
  relentless: "Relentless",
};

export const questions: QuizQuestion[] = [
  {
    id: 1,
    question: "What's your ideal Saturday?",
    emoji: "🌅",
    answers: [
      {
        text: "Training until I collapse",
        traits: { brave: 3, determined: 2, relentless: 1 },
        emoji: "💪",
      },
      {
        text: "Plotting my next big move",
        traits: { cunning: 3, genius: 2, mysterious: 1 },
        emoji: "🧠",
      },
      {
        text: "Hanging out with friends",
        traits: { loyal: 3, passionate: 2, brave: 1 },
        emoji: "🎉",
      },
      {
        text: "Exploring somewhere new alone",
        traits: { mysterious: 3, stoic: 2, determined: 1 },
        emoji: "🗺️",
      },
    ],
  },
  {
    id: 2,
    question: "Pick a superpower!",
    emoji: "⚡",
    answers: [
      {
        text: "Unlimited energy & raw strength",
        traits: { brave: 3, passionate: 2, relentless: 1 },
        emoji: "💥",
      },
      {
        text: "Mind control & manipulation",
        traits: { cunning: 3, genius: 2, mysterious: 1 },
        emoji: "👁️",
      },
      {
        text: "Elemental magic (fire/ice/lightning)",
        traits: { determined: 3, stoic: 2, brave: 1 },
        emoji: "🔥",
      },
      {
        text: "Time manipulation",
        traits: { genius: 3, mysterious: 2, cunning: 1 },
        emoji: "⏰",
      },
    ],
  },
  {
    id: 3,
    question: "What's your fighting style?",
    emoji: "⚔️",
    answers: [
      {
        text: "Charge in headfirst",
        traits: { brave: 3, chaotic: 2, passionate: 1 },
        emoji: "🦬",
      },
      {
        text: "Outsmart the opponent",
        traits: { cunning: 3, genius: 2, stoic: 1 },
        emoji: "♟️",
      },
      {
        text: "Protect others at all costs",
        traits: { loyal: 3, brave: 2, determined: 1 },
        emoji: "🛡️",
      },
      {
        text: "One devastating strike",
        traits: { stoic: 3, relentless: 2, mysterious: 1 },
        emoji: "🗡️",
      },
    ],
  },
  {
    id: 4,
    question: "Choose a setting for your story!",
    emoji: "🏰",
    answers: [
      {
        text: "A war-torn kingdom",
        traits: { determined: 3, brave: 2, stoic: 1 },
        emoji: "⚔️",
      },
      {
        text: "A futuristic city",
        traits: { genius: 3, cunning: 2, mysterious: 1 },
        emoji: "🌃",
      },
      {
        text: "A hidden village in the mountains",
        traits: { loyal: 3, passionate: 2, brave: 1 },
        emoji: "🏔️",
      },
      {
        text: "An interdimensional void",
        traits: { mysterious: 3, relentless: 2, chaotic: 1 },
        emoji: "🌀",
      },
    ],
  },
  {
    id: 5,
    question: "What's your motto in life?",
    emoji: "📜",
    answers: [
      {
        text: "Never give up, no matter what!",
        traits: { brave: 3, determined: 2, passionate: 1 },
        emoji: "🔥",
      },
      {
        text: "Knowledge is the ultimate weapon",
        traits: { genius: 3, cunning: 2, stoic: 1 },
        emoji: "📚",
      },
      {
        text: "I'll protect everyone I love",
        traits: { loyal: 3, brave: 2, determined: 1 },
        emoji: "❤️",
      },
      {
        text: "True strength comes from within",
        traits: { stoic: 3, mysterious: 2, relentless: 1 },
        emoji: "🧘",
      },
    ],
  },
  {
    id: 6,
    question: "Pick your crew!",
    emoji: "👥",
    answers: [
      {
        text: "A ragtag group of misfits",
        traits: { chaotic: 3, loyal: 2, passionate: 1 },
        emoji: "🏴‍☠️",
      },
      {
        text: "A disciplined military unit",
        traits: { stoic: 3, determined: 2, brave: 1 },
        emoji: "🎖️",
      },
      {
        text: "Just me and my best friend",
        traits: { loyal: 3, brave: 2, mysterious: 1 },
        emoji: "🤝",
      },
      {
        text: "A shadow network of spies",
        traits: { cunning: 3, genius: 2, mysterious: 1 },
        emoji: "🕵️",
      },
    ],
  },
  {
    id: 7,
    question: "What's your biggest flaw?",
    emoji: "💔",
    answers: [
      {
        text: "I rush in without thinking",
        traits: { chaotic: 3, brave: 2, passionate: 1 },
        emoji: "🏃",
      },
      {
        text: "I trust too easily",
        traits: { loyal: 3, passionate: 2, brave: 1 },
        emoji: "😭",
      },
      {
        text: "I overthink everything",
        traits: { genius: 3, stoic: 2, mysterious: 1 },
        emoji: "🤔",
      },
      {
        text: "I push people away",
        traits: { mysterious: 3, stoic: 2, relentless: 1 },
        emoji: "🚶",
      },
    ],
  },
  {
    id: 8,
    question: "Choose a weapon!",
    emoji: "🗡️",
    answers: [
      {
        text: "My bare fists",
        traits: { brave: 3, determined: 2, passionate: 1 },
        emoji: "👊",
      },
      {
        text: "A sacred sword",
        traits: { stoic: 3, loyal: 2, relentless: 1 },
        emoji: "⚔️",
      },
      {
        text: "Ancient forbidden magic",
        traits: { mysterious: 3, cunning: 2, genius: 1 },
        emoji: "✨",
      },
      {
        text: "Strategy & sheer willpower",
        traits: { genius: 3, determined: 2, brave: 1 },
        emoji: "🧠",
      },
    ],
  },
  {
    id: 9,
    question: "How do you handle failure?",
    emoji: "😤",
    answers: [
      {
        text: "Train 10x harder tomorrow",
        traits: { determined: 3, brave: 2, relentless: 1 },
        emoji: "🔥",
      },
      {
        text: "Analyze what went wrong",
        traits: { genius: 3, stoic: 2, cunning: 1 },
        emoji: "📊",
      },
      {
        text: "Lean on my friends",
        traits: { loyal: 3, passionate: 2, brave: 1 },
        emoji: "🫂",
      },
      {
        text: "Vow revenge",
        traits: { relentless: 3, chaotic: 2, mysterious: 1 },
        emoji: "😈",
      },
    ],
  },
  {
    id: 10,
    question: "What drives you most?",
    emoji: "💎",
    answers: [
      {
        text: "Becoming the strongest",
        traits: { relentless: 3, brave: 2, passionate: 1 },
        emoji: "🏆",
      },
      {
        text: "Creating a perfect world",
        traits: { genius: 3, cunning: 2, determined: 1 },
        emoji: "🌍",
      },
      {
        text: "Protecting my loved ones",
        traits: { loyal: 3, passionate: 2, stoic: 1 },
        emoji: "💖",
      },
      {
        text: "Uncovering the truth",
        traits: { mysterious: 3, determined: 2, genius: 1 },
        emoji: "🔍",
      },
    ],
  },
];

export const characters: CharacterResult[] = [
  {
    name: "Naruto Uzumaki",
    anime: "Naruto",
    slug: "naruto",
    description:
      "You never give up, no matter how many times you get knocked down. Your determination and belief in yourself inspires everyone around you. You wear your heart on your sleeve and fight for those you love.",
    traits: { brave: 8, loyal: 9, passionate: 7, determined: 10, chaotic: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    similarAnime: [
      { title: "My Hero Academia", slug: "my-hero-academia" },
      { title: "Black Clover", slug: "black-clover" },
      { title: "Boruto", slug: "boruto" },
    ],
  },
  {
    name: "Monkey D. Luffy",
    anime: "One Piece",
    slug: "one-piece",
    description:
      "You're a free spirit who lives life on your own terms. Your infectious energy and loyalty to your crew know no bounds. You charge into every adventure with a grin and a dream.",
    traits: { brave: 9, loyal: 8, passionate: 8, chaotic: 7, determined: 7 },
    coverImage: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "Dragon Ball Z", slug: "dragon-ball-z" },
      { title: "Fairy Tail", slug: "fairy-tail" },
    ],
  },
  {
    name: "Son Goku",
    anime: "Dragon Ball Z",
    slug: "dragon-ball-z",
    description:
      "Your pure heart and love for battle define you. You seek to push your limits every single day and always face the strongest opponents head-on. Your simplicity hides a warrior's wisdom.",
    traits: { brave: 9, passionate: 9, determined: 8, loyal: 6, stoic: 3 },
    coverImage: "https://cdn.myanimelist.net/images/anime/10/60441l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "One Punch Man", slug: "one-punch-man" },
      { title: "My Hero Academia", slug: "my-hero-academia" },
    ],
  },
  {
    name: "Light Yagami",
    anime: "Death Note",
    slug: "death-note",
    description:
      "You're brilliant and ambitious, with a vision to reshape the world. You think ten steps ahead of everyone else and rarely show your true emotions. Power and intellect are your weapons.",
    traits: { cunning: 10, genius: 10, mysterious: 7, determined: 6, stoic: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/9/95249l.jpg",
    similarAnime: [
      { title: "Code Geass", slug: "code-geass" },
      { title: "Monster", slug: "monster" },
      { title: "Psycho-Pass", slug: "psycho-pass" },
    ],
  },
  {
    name: "Lelouch vi Britannia",
    anime: "Code Geass",
    slug: "code-geass",
    description:
      "You're a master strategist who sacrifices everything for your ideals. Your charisma and intellect can move armies, but your real power lies in your willingness to bear any burden.",
    traits: { cunning: 9, genius: 10, mysterious: 6, determined: 8, stoic: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/5/50351l.jpg",
    similarAnime: [
      { title: "Death Note", slug: "death-note" },
      { title: "Vinland Saga", slug: "vinland-saga" },
      { title: "Attack on Titan", slug: "attack-on-titan" },
    ],
  },
  {
    name: "Levi Ackerman",
    anime: "Attack on Titan",
    slug: "attack-on-titan",
    description:
      "You're cold, calculated, and devastatingly efficient. Behind your stoic exterior lies a deep sense of duty and loyalty. You do what needs to be done, no matter how brutal.",
    traits: { stoic: 10, brave: 7, determined: 8, loyal: 7, mysterious: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    similarAnime: [
      { title: "Demon Slayer", slug: "demon-slayer" },
      { title: "Jujutsu Kaisen", slug: "jujutsu-kaisen" },
      { title: "Vinland Saga", slug: "vinland-saga" },
    ],
  },
  {
    name: "Gojo Satoru",
    anime: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    description:
      "You're effortlessly powerful and you know it. Your playful attitude masks incredible depth and strength. You bend the rules because you're strong enough to back it up.",
    traits: { mysterious: 8, stoic: 6, brave: 7, genius: 7, chaotic: 7 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    similarAnime: [
      { title: "Demon Slayer", slug: "demon-slayer" },
      { title: "Chainsaw Man", slug: "chainsaw-man" },
      { title: "Bleach", slug: "bleach" },
    ],
  },
  {
    name: "Tanjiro Kamado",
    anime: "Demon Slayer",
    slug: "demon-slayer",
    description:
      "You have an incredibly kind heart in a cruel world. Your empathy is your greatest strength and your greatest weakness. You fight not out of hatred, but out of love.",
    traits: { loyal: 10, brave: 8, passionate: 8, determined: 7, stoic: 4 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    similarAnime: [
      { title: "My Hero Academia", slug: "my-hero-academia" },
      { title: "Naruto", slug: "naruto" },
      { title: "Black Clover", slug: "black-clover" },
    ],
  },
  {
    name: "Edward Elric",
    anime: "Fullmetal Alchemist: Brotherhood",
    slug: "fullmetal-alchemist",
    description:
      "You're a genius with a fiery temper and an even bigger heart. You've paid a heavy price for your past mistakes and now channel that pain into helping others. Never underestimate your drive.",
    traits: { passionate: 9, genius: 7, brave: 7, determined: 8, chaotic: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "Hunter x Hunter", slug: "hunter-x-hunter" },
      { title: "Avatar: The Last Airbender", slug: "avatar" },
    ],
  },
  {
    name: "Spike Spiegel",
    anime: "Cowboy Bebop",
    slug: "cowboy-bebop",
    description:
      "You're effortlessly cool and live in the moment. A complicated past haunts you, but you wear a laid-back smile like armor. You're a drifting soul searching for meaning.",
    traits: { mysterious: 8, stoic: 7, chaotic: 6, brave: 5, loyal: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/4/19644l.jpg",
    similarAnime: [
      { title: "Samurai Champloo", slug: "samurai-champloo" },
      { title: "Cowboy Bebop: The Movie", slug: "cowboy-bebop-movie" },
      { title: "Psycho-Pass", slug: "psycho-pass" },
    ],
  },
  {
    name: "Guts",
    anime: "Berserk",
    slug: "berserk",
    description:
      "You've faced hell itself and refuse to break. Your sheer willpower and refusal to give up make you a force of nature. Pain is just another Tuesday for you.",
    traits: { relentless: 10, brave: 10, stoic: 7, mysterious: 5, determined: 9 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1403/126042l.jpg",
    similarAnime: [
      { title: "Vinland Saga", slug: "vinland-saga" },
      { title: "Attack on Titan", slug: "attack-on-titan" },
      { title: "Claymore", slug: "claymore" },
    ],
  },
  {
    name: "Saitama",
    anime: "One Punch Man",
    slug: "one-punch-man",
    description:
      "You've already reached the pinnacle and now struggle with boredom. Your strength is unmatched, but the real challenge is finding purpose. You're the ultimate underdog who became the ultimate overdog.",
    traits: { stoic: 8, brave: 6, chaotic: 5, determined: 4, mysterious: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg",
    similarAnime: [
      { title: "Mob Psycho 100", slug: "mob-psycho-100" },
      { title: "Dragon Ball Z", slug: "dragon-ball-z" },
      { title: "The Disastrous Life of Saiki K.", slug: "saiki-k" },
    ],
  },
  {
    name: "Killua Zoldyck",
    anime: "Hunter x Hunter",
    slug: "hunter-x-hunter",
    description:
      "You're a prodigy raised in darkness who's learning what it means to be free. Quick-witted, playful, and deadly — you balance charm and lethality like no one else.",
    traits: { cunning: 8, mysterious: 7, loyal: 7, chaotic: 6, genius: 7 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1339/138404l.jpg",
    similarAnime: [
      { title: "Jujutsu Kaisen", slug: "jujutsu-kaisen" },
      { title: "Naruto", slug: "naruto" },
      { title: "Fullmetal Alchemist", slug: "fullmetal-alchemist" },
    ],
  },
  {
    name: "Roronoa Zoro",
    anime: "One Piece",
    slug: "one-piece",
    description:
      "You're a warrior of pure willpower and discipline. You walk the hardest path without complaint and your ambition to be the best never wavers. Silence is your language.",
    traits: { stoic: 9, determined: 9, brave: 7, loyal: 7, relentless: 8 },
    coverImage: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "Bleach", slug: "bleach" },
      { title: "Vagabond", slug: "vagabond" },
    ],
  },
  {
    name: "Vegeta",
    anime: "Dragon Ball Z",
    slug: "dragon-ball-z",
    description:
      "Your pride is your fuel and your curse. You were born to be the best, and you'll never stop chasing that goal. Deep beneath that royal pride is someone who'd die for his family.",
    traits: { determined: 10, brave: 9, stoic: 7, relentless: 8, passionate: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/10/60441l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "My Hero Academia", slug: "my-hero-academia" },
      { title: "Bleach", slug: "bleach" },
    ],
  },
  {
    name: "Itachi Uchiha",
    anime: "Naruto",
    slug: "naruto",
    description:
      "You carry an unimaginable burden in silence. You sacrifice everything — even your reputation — for the greater good. Your true strength lies in your willingness to be misunderstood.",
    traits: { mysterious: 9, stoic: 9, loyal: 8, genius: 8, determined: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/13/17405l.jpg",
    similarAnime: [
      { title: "Code Geass", slug: "code-geass" },
      { title: "Death Note", slug: "death-note" },
      { title: "Attack on Titan", slug: "attack-on-titan" },
    ],
  },
  {
    name: "Izuku Midoriya",
    anime: "My Hero Academia",
    slug: "my-hero-academia",
    description:
      "You started as an underdog and refused to accept your limitations. Your analytical mind, brave heart, and desire to save everyone make you a true hero in every sense.",
    traits: { brave: 8, loyal: 8, determined: 8, passionate: 7, genius: 5 },
    coverImage: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "Black Clover", slug: "black-clover" },
      { title: "One Piece", slug: "one-piece" },
    ],
  },
  {
    name: "Asta",
    anime: "Black Clover",
    slug: "black-clover",
    description:
      "You were born with nothing but your voice and your will. Where others gave up, you kept screaming your dream to the world. Your persistence is genuinely unmatched.",
    traits: { brave: 9, loyal: 8, passionate: 9, determined: 10, chaotic: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/2/75533l.jpg",
    similarAnime: [
      { title: "Naruto", slug: "naruto" },
      { title: "My Hero Academia", slug: "my-hero-academia" },
      { title: "One Piece", slug: "one-piece" },
    ],
  },
  {
    name: "Senku Ishigami",
    anime: "Dr. Stone",
    slug: "dr-stone",
    description:
      "You're a scientific genius who believes humanity can rebuild anything with knowledge. Your optimism is relentless and your mind operates on a level others can't even fathom.",
    traits: { genius: 10, determined: 8, brave: 6, mysterious: 5, chaotic: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/1444/144407l.jpg",
    similarAnime: [
      { title: "Steins;Gate", slug: "steins-gate" },
      { title: "The Promised Neverland", slug: "promised-neverland" },
      { title: "Mob Psycho 100", slug: "mob-psycho-100" },
    ],
  },
  {
    name: "Eren Yeager",
    anime: "Attack on Titan",
    slug: "attack-on-titan",
    description:
      "You're driven by an unstoppable desire for freedom. You've been through transformations that would break anyone, yet you keep pushing forward. Your conviction reshapes the world.",
    traits: { determined: 10, relentless: 9, mysterious: 7, brave: 8, stoic: 6 },
    coverImage: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    similarAnime: [
      { title: "Death Note", slug: "death-note" },
      { title: "Code Geass", slug: "code-geass" },
      { title: "Vinland Saga", slug: "vinland-saga" },
    ],
  },
];
