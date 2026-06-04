/**
 * Content Generator for SEO pages
 * Generates human-readable, SEO-optimized content for each page type
 * Returns valid HTML strings with Tailwind CSS classes for styling
 */

/**
 * Escapes special HTML characters to prevent XSS when interpolating
 * user-provided data into HTML template strings.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface AnimeData {
  title: string;
  titleEnglish?: string | null;
  slug: string;
  description?: string | null;
  genres: string[];
  totalEpisodes: number;
  status?: string | null;
  seasonYear?: number | null;
}

interface FillerStats {
  totalFiller: number;
  totalMixed: number;
  totalCanon: number;
  fillerPercent: number;
}

export function generateFillerPageContent(anime: AnimeData, stats: FillerStats): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);
  const totalEps = anime.totalEpisodes;

  const skipAdvice = stats.fillerPercent > 30
    ? `With <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong> filler content, ${title} has a significant amount of non-canon episodes. If you're primarily interested in the main storyline, skipping the filler episodes can save you considerable time without missing any important plot developments.`
    : stats.fillerPercent > 15
      ? `${title} has a moderate amount of filler at <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong>. While not excessive, skipping these episodes will give you a more streamlined viewing experience focused on the core narrative.`
      : `${title} has relatively little filler at only <strong class="text-purple-400 font-semibold">${stats.fillerPercent}%</strong>. The series stays mostly faithful to its source material, making it a good watch even without skipping any episodes.`;

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Filler Episode Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">If you're watching <strong class="text-white font-semibold">${title}</strong> and want to skip the filler episodes, you're in the right place. This comprehensive filler guide breaks down every episode so you can focus on the main storyline.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Quick Summary</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
<li><strong class="text-white font-semibold">Total Episodes:</strong> <span class="text-purple-400 font-semibold">${totalEps}</span></li>
<li><strong class="text-white font-semibold">Canon Episodes:</strong> <span class="text-purple-400 font-semibold">${stats.totalCanon}</span> (${Math.round((stats.totalCanon / totalEps) * 100)}%)</li>
<li><strong class="text-white font-semibold">Filler Episodes:</strong> <span class="text-purple-400 font-semibold">${stats.totalFiller}</span> (${stats.fillerPercent}%)</li>
<li><strong class="text-white font-semibold">Mixed Canon/Filler:</strong> <span class="text-purple-400 font-semibold">${stats.totalMixed}</span> (${Math.round((stats.totalMixed / totalEps) * 100)}%)</li>
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">What Are Filler Episodes?</h3>
<p class="text-gray-300 leading-relaxed mb-4">Filler episodes in ${title} are episodes that were not adapted from the original source material (manga/light novel). These episodes were created by the anime studio to prevent the anime from catching up to the manga. While some filler episodes can be entertaining, they don't advance the main plot.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Should You Skip ${title} Filler?</h3>
<p class="text-gray-300 leading-relaxed mb-4">${skipAdvice}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">How to Use This Guide</h3>
<p class="text-gray-300 leading-relaxed mb-4">Episodes marked as <strong class="text-white font-semibold">Canon</strong> are essential to the story. <strong class="text-white font-semibold">Filler</strong> episodes can be safely skipped. <strong class="text-white font-semibold">Mixed</strong> episodes contain some canon material alongside filler content — we recommend watching these as they may contain character development or minor plot points that are referenced later.</p>`;
}

export function generateWatchOrderContent(anime: AnimeData, relatedAnime: { title: string; slug: string; type: string }[]): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const hasPrequels = relatedAnime.some(r => r.type === "PREQUEL");
  const hasSequels = relatedAnime.some(r => r.type === "SEQUEL");
  const hasSideStories = relatedAnime.some(r => r.type === "SIDE_STORY" || r.type === "SPIN_OFF");

  const includeParts: string[] = [];
  if (hasPrequels) includeParts.push("prequels");
  if (hasSequels) includeParts.push("sequels");
  if (hasSideStories) includeParts.push("side stories");
  const includesText = includeParts.length > 0 ? includeParts.join(", ") + ", and related entries" : "related entries";

  const whyMatters = relatedAnime.length > 2
    ? `The ${title} franchise has <strong class="text-purple-400 font-semibold">${relatedAnime.length + 1}</strong> entries, making it important to watch them in the right order to fully understand the story, character development, and plot connections between series.`
    : `While ${title} can be enjoyed on its own, watching related entries in the correct order enhances the overall experience and helps you catch references and connections between the series.`;

  let orderList: string;
  if (relatedAnime.length > 0) {
    const items = relatedAnime.map((r) => `<li class="text-gray-300"><strong class="text-white font-semibold">${escapeHtml(r.title)}</strong> (${r.type.replace(/_/g, " ").toLowerCase()})</li>`).join("\n");
    orderList = `<ol class="list-decimal list-inside space-y-1 text-gray-300 mb-4">\n${items}\n</ol>`;
  } else {
    orderList = `<ol class="list-decimal list-inside space-y-1 text-gray-300 mb-4">\n<li class="text-gray-300"><strong class="text-white font-semibold">${title}</strong> (Main Series)</li>\n</ol>`;
  }

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Watch Order Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">Looking for the correct order to watch the <strong class="text-white font-semibold">${title}</strong> series? This guide covers the recommended watch order including ${includesText}.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why Watch Order Matters</h3>
<p class="text-gray-300 leading-relaxed mb-4">${whyMatters}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Recommended Watch Order</h3>
<p class="text-gray-300 leading-relaxed mb-4">The following order is recommended for the best viewing experience. This is the <strong class="text-white font-semibold">chronological order</strong> that follows the story timeline:</p>
${orderList}
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Release Order vs Chronological Order</h3>
<p class="text-gray-300 leading-relaxed mb-4">For first-time viewers, we generally recommend <strong class="text-white font-semibold">release order</strong> as it provides the intended viewing experience designed by the creators. Chronological order is better suited for rewatches when you want to experience the story's timeline linearly.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Tips for New Viewers</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
<li>Start with the main series if you're unsure</li>
<li>Side stories and OVAs can be watched after completing the main storyline</li>
<li>Movies may or may not be canon — check individual entries for details</li>
</ul>`;
}

export function generateEpisodeGuideContent(anime: AnimeData): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const aboutText = anime.description ? escapeHtml(anime.description) : `${title} is a popular anime series${anime.genres.length > 0 ? ` in the ${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ")} genre${anime.genres.length > 1 ? "s" : ""}` : ""}.`;

  const seriesInfoItems: string[] = [
    `<li><strong class="text-white font-semibold">Total Episodes:</strong> <span class="text-purple-400 font-semibold">${anime.totalEpisodes}</span></li>`,
    `<li><strong class="text-white font-semibold">Status:</strong> ${formatStatus(anime.status)}</li>`,
  ];
  if (anime.seasonYear) {
    seriesInfoItems.push(`<li><strong class="text-white font-semibold">Year:</strong> ${anime.seasonYear}</li>`);
  }
  if (anime.genres.length > 0) {
    seriesInfoItems.push(`<li><strong class="text-white font-semibold">Genres:</strong> ${anime.genres.map(g => escapeHtml(g)).join(", ")}</li>`);
  }

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">${title} Episode Guide</h2>
<p class="text-gray-300 leading-relaxed mb-4">Complete episode guide for <strong class="text-white font-semibold">${title}</strong> with ${anime.totalEpisodes} episodes. This guide includes filler markers to help you identify which episodes are canon and which can be skipped.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">About ${title}</h3>
<p class="text-gray-300 leading-relaxed mb-4">${aboutText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Series Information</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
${seriesInfoItems.join("\n")}
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Episode Legend</h3>
<ul class="list-none space-y-1 text-gray-300 mb-4">
<li>🟢 <strong class="text-white font-semibold">Canon</strong> — Essential to the main storyline</li>
<li>🔴 <strong class="text-white font-semibold">Filler</strong> — Can be safely skipped</li>
<li>🟡 <strong class="text-white font-semibold">Mixed</strong> — Contains both canon and filler content</li>
</ul>`;
}

export function generateAnimePageContent(anime: AnimeData): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  const descText = anime.description ? escapeHtml(anime.description) : `${title} is an anime series${anime.genres.length > 0 ? ` featuring ${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ").toLowerCase()} themes` : ""}.`;

  const detailItems: string[] = [
    `<li><strong class="text-white font-semibold">Episodes:</strong> ${anime.totalEpisodes || "Unknown"}</li>`,
    `<li><strong class="text-white font-semibold">Status:</strong> ${formatStatus(anime.status)}</li>`,
  ];
  if (anime.seasonYear) {
    detailItems.push(`<li><strong class="text-white font-semibold">Aired:</strong> ${anime.seasonYear}</li>`);
  }
  if (anime.genres.length > 0) {
    detailItems.push(`<li><strong class="text-white font-semibold">Genres:</strong> ${anime.genres.map(g => escapeHtml(g)).join(", ")}</li>`);
  }

  return `<p class="text-gray-300 leading-relaxed mb-4">${descText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Series Details</h3>
<ul class="list-disc list-inside space-y-1 text-gray-300 mb-4">
${detailItems.join("\n")}
</ul>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Guides Available</h3>
<p class="text-gray-300 leading-relaxed mb-4">Explore our comprehensive guides for ${title}:</p>`;
}

export function generateGenrePageContent(genre: string, animeCount: number): string {
  const safeGenre = escapeHtml(genre);
  const intro = getGenreIntro(genre, animeCount);
  const defines = getGenreDefines(genre);
  const whyFans = getGenreWhyFansLoveIt(genre);
  const tips = getGenreTips(genre);

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Best ${safeGenre} Anime</h2>
<p class="text-gray-300 leading-relaxed mb-4">${intro}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">What Defines ${safeGenre} Anime?</h3>
<p class="text-gray-300 leading-relaxed mb-4">${defines}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why Fans Love ${safeGenre} Anime</h3>
<p class="text-gray-300 leading-relaxed mb-4">${whyFans}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Recommendations Tips</h3>
<p class="text-gray-300 leading-relaxed mb-4">${tips}</p>`;
}

function getGenreIntro(genre: string, animeCount: number): string {
  const intros: Record<string, string> = {
    Action: `From explosive battle sequences to heart-pounding chases, action anime delivers non-stop adrenaline. This collection of <strong class="text-purple-400 font-semibold">${animeCount}</strong> titles represents the best the genre has produced, spanning legendary shounen epics and gritty seinen thrillers alike. Each series here earned its place through unforgettable fight choreography, compelling power systems, and protagonists who refuse to back down.`,
    Adventure: `Journey beyond the horizon with <strong class="text-purple-400 font-semibold">${animeCount}</strong> adventure anime that will ignite your wanderlust. These series transport viewers to uncharted lands, vast oceans, and entire worlds waiting to be discovered. Whether the heroes travel by ship, on foot, or through dimensional portals, each story captures the thrill of stepping into the unknown and the growth that comes with every challenge faced along the way.`,
    Comedy: `Laughter is the best medicine, and these <strong class="text-purple-400 font-semibold">${animeCount}</strong> comedy anime series deliver it in abundance. From rapid-fire gags and absurd premises to subtle character-driven humor, this collection showcases the genre's incredible range. Japanese comedy anime has a unique flavor, blending visual gags, wordplay, and cultural humor into something that transcends language barriers.`,
    Drama: `Prepare for stories that will move you deeply. These <strong class="text-purple-400 font-semibold">${animeCount}</strong> drama anime series explore the full spectrum of human emotion, from heartbreak to hope, loss to redemption. The genre excels at building intimate character studies that resonate long after the final episode, tackling themes like family bonds, personal sacrifice, and the quiet strength found in everyday life.`,
    Fantasy: `Enter realms where magic is real and anything is possible. This curated list of <strong class="text-purple-400 font-semibold">${animeCount}</strong> fantasy anime features intricate magic systems, richly imagined worlds, and epic conflicts between good and evil. From high fantasy kingdoms to modern settings infused with supernatural elements, these series showcase the boundless creativity that makes fantasy anime a perennial favorite.`,
    Horror: `Dare to watch? These <strong class="text-purple-400 font-semibold">${animeCount}</strong> horror anime will chill you to the bone with atmospheric dread, psychological terror, and imagery that lingers in your mind. Japanese horror anime draws from a rich tradition of ghost stories and urban legends, creating experiences that range from slow-burn psychological unease to visceral body horror.`,
    Romance: `Fall in love with these <strong class="text-purple-400 font-semibold">${animeCount}</strong> romance anime that capture every stage of the heart's journey. From the flutter of a first crush to the complexities of mature relationships, these series explore connection with tenderness and authenticity. Each story creates moments that make you smile, cry, and remember what it feels like to care deeply about someone.`,
    "Sci-Fi": `Explore the frontiers of imagination with <strong class="text-purple-400 font-semibold">${animeCount}</strong> science fiction anime that push the boundaries of storytelling. These series tackle big questions about technology, consciousness, and humanity's future through compelling narratives set in space stations, cyberpunk cities, and post-apocalyptic landscapes. Sci-fi anime is where bold ideas meet stunning visual design.`,
    Mystery: `Put your detective skills to the test with <strong class="text-purple-400 font-semibold">${animeCount}</strong> mystery anime that reward sharp observation and careful thinking. These series weave intricate puzzles, hidden clues, and shocking revelations into narratives that keep you guessing until the very end. The best mystery anime plays fair with the audience while still delivering genuinely surprising twists.`,
    Thriller: `Buckle up for <strong class="text-purple-400 font-semibold">${animeCount}</strong> thriller anime that will keep you gripping the edge of your seat. These series masterfully build tension through high-stakes mind games, dangerous cat-and-mouse pursuits, and plots where a single wrong move means disaster. Thriller anime excels at creating scenarios where intelligence and nerve determine survival.`,
    Sports: `Experience the rush of competition with <strong class="text-purple-400 font-semibold">${animeCount}</strong> sports anime that capture athletic passion at its finest. These series go beyond the game itself, exploring the dedication, teamwork, and personal growth that define true athletes. From traditional sports like basketball and volleyball to unconventional competitions, each series transforms athletic endeavor into compelling drama.`,
    Supernatural: `Step beyond the veil of the ordinary with <strong class="text-purple-400 font-semibold">${animeCount}</strong> supernatural anime that blend the mundane with the extraordinary. These series introduce ghosts, spirits, psychic powers, and otherworldly phenomena into settings that feel tantalizingly close to our own reality, creating stories where the impossible becomes terrifyingly or beautifully real.`,
    "Slice of Life": `Find beauty in the everyday with <strong class="text-purple-400 font-semibold">${animeCount}</strong> slice of life anime that celebrate ordinary moments. These series prove that compelling stories do not need explosions or supernatural powers. Instead, they find drama, humor, and profound meaning in daily routines, friendships, and the quiet turning points that shape who we become.`,
    Mecha: `Witness colossal machines of war in <strong class="text-purple-400 font-semibold">${animeCount}</strong> mecha anime that combine jaw-dropping mechanical design with deeply human stories. From real-robot military dramas to super-robot spectacles, the genre explores what happens when humanity's greatest engineering achievements become extensions of the pilot's will, determination, and sacrifice.`,
  };
  return intros[genre] || `Explore <strong class="text-purple-400 font-semibold">${animeCount}</strong> outstanding ${genre.toLowerCase()} anime series carefully ranked by popularity and critical reception. This genre offers a distinct viewing experience with its own conventions and storytelling strengths that have captivated audiences worldwide.`;
}

function getGenreDefines(genre: string): string {
  const defines: Record<string, string> = {
    Action: `Action anime is defined by dynamic physical conflict as the primary narrative driver. Whether through martial arts, swordsmanship, superpowers, or military combat, action series use fight sequences as moments of character expression and plot progression. The best entries pair kinetic animation with meaningful stakes, ensuring each battle carries emotional weight beyond spectacle. Power systems, training arcs, and escalating threats form the backbone of the genre's structure.`,
    Adventure: `Adventure anime centers on journeys - literal and metaphorical. The genre is defined by exploration of unfamiliar territories, encounters with diverse cultures and creatures, and the transformative effect of travel on the protagonists. World-building is paramount, as the setting itself becomes a character. Episodic challenges test the heroes in new ways, and the sense of wonder at discovering something new never fades. The destination matters less than who the characters become along the way.`,
    Comedy: `Comedy anime is characterized by its commitment to generating laughter through every available tool. The genre employs visual gags, timing-based humor, absurd escalation, character-driven comedy, parody, and meta-awareness in combinations unique to animation. What sets anime comedy apart is its willingness to break the fourth wall, use exaggerated facial expressions, and create impossible physical scenarios that would be unachievable in live action. The best comedy anime builds its humor on well-developed characters whose quirks generate jokes organically.`,
    Drama: `Drama anime is defined by its focus on emotional authenticity and character depth. The genre prioritizes internal conflict over external action, exploring how people navigate loss, love, ambition, and moral complexity. Pacing tends toward the deliberate, allowing scenes to breathe and emotions to build naturally. Visual storytelling, subtle expressions, and symbolic imagery carry as much narrative weight as dialogue. The best drama anime achieves universality through specificity, making even culturally particular stories resonate globally.`,
    Fantasy: `Fantasy anime is defined by the presence of supernatural elements as fundamental to the world's rules. Magic systems, mythical creatures, and impossible landscapes form the foundation upon which stories are built. The genre ranges from high fantasy with elaborate lore to urban fantasy where magical elements intrude on modern life. World-building consistency is crucial, as audiences invest in understanding how the fantastical rules work. The genre offers creators unmatched freedom to externalize internal conflicts through magical metaphor.`,
    Horror: `Horror anime is defined by its intent to evoke fear, dread, or deep unease in the viewer. The genre leverages animation's unique ability to depict the impossible, creating imagery and atmospheres that live-action struggles to match. Psychological horror mines the human mind for terror, body horror distorts the familiar form, and supernatural horror introduces malevolent entities beyond comprehension. Sound design and visual pacing are critical tools, with silence and shadow often more effective than explicit violence.`,
    Romance: `Romance anime is defined by the development of emotional connections between characters as the central narrative focus. The genre tracks relationships from initial attraction through obstacles, misunderstandings, and growth toward genuine understanding. Subtle gestures carry enormous weight - a lingering glance, an accidental touch, words left unsaid. The best romance anime earns its emotional payoffs through patient character development, making even predictable confessions feel momentous because of everything that led there.`,
    "Sci-Fi": `Science fiction anime is defined by its engagement with speculative concepts grounded in scientific or technological extrapolation. The genre asks "what if" questions about artificial intelligence, space colonization, genetic engineering, time manipulation, and the nature of consciousness. Hard sci-fi prioritizes plausibility while soft sci-fi uses scientific trappings for philosophical exploration. Animation gives sci-fi anime the ability to visualize futuristic concepts without budget constraints, resulting in some of the most visually inventive world-building in any medium.`,
    Mystery: `Mystery anime is defined by the presence of a central puzzle that drives the narrative forward. Information is carefully controlled, with clues planted for attentive viewers while red herrings divert the unwary. The genre demands tight plotting and logical consistency, as audiences actively participate by forming theories. Fair-play mysteries reveal all necessary clues before the solution, while thriller-mysteries keep some cards hidden. The satisfaction of a mystery anime comes from that moment of revelation when scattered pieces click into place.`,
    Thriller: `Thriller anime is defined by sustained tension and the constant threat of dire consequences. Unlike action anime where conflict is physical, thrillers build suspense through information asymmetry, time pressure, and psychological warfare. Characters operate under extreme stress, making decisions with imperfect knowledge where mistakes are fatal. The genre rewards intelligent protagonists and antagonists, creating intellectual cat-and-mouse dynamics. Pacing is the thriller's greatest tool, alternating between slow-burn dread and explosive payoffs.`,
    Sports: `Sports anime is defined by the pursuit of athletic excellence and the personal growth that competition demands. The genre uses the framework of training, qualification, and tournament to structure narratives of dedication and teamwork. Technical explanations of strategies and techniques educate the audience while building tension. Rivalries drive character development as much as cooperation does. The best sports anime makes viewers passionate about activities they have never tried, transforming niche sports into universal stories of human ambition.`,
    Supernatural: `Supernatural anime is defined by the coexistence of paranormal phenomena with an otherwise normal world. Unlike fantasy, which builds entirely new worlds, supernatural anime grounds itself in recognizable reality before introducing ghosts, spirits, psychic powers, or cosmic entities. The tension between the ordinary and the extraordinary creates unease and wonder in equal measure. Characters often serve as bridges between worlds, navigating both mundane social life and dangerous spiritual realms.`,
    "Slice of Life": `Slice of life anime is defined by its deliberate avoidance of high-stakes conflict in favor of observing everyday existence. The genre finds narrative interest in routines, relationships, seasonal changes, and small personal victories. Pacing is unhurried, allowing viewers to inhabit the characters' world rather than simply watching events unfold. The genre's power lies in recognition - viewers see their own experiences reflected and elevated. Atmosphere, mood, and character chemistry matter more than plot progression.`,
    Mecha: `Mecha anime is defined by the presence of piloted robots or mechanical suits as central story elements. The genre splits between "real robot" series that treat machines as military hardware with realistic limitations, and "super robot" series where machines possess extraordinary, often unexplained capabilities. Beyond the mechanical spectacle, mecha anime explores the relationship between pilot and machine, the human cost of technological warfare, and how individuals bear the weight of protecting humanity inside metal giants.`,
  };
  return defines[genre] || `${genre} anime encompasses a rich tradition of storytelling with distinctive conventions, visual styles, and narrative structures that set it apart. The genre has evolved significantly over decades while maintaining core elements that continue to attract new fans and reward long-time viewers with increasingly sophisticated entries.`;
}

function getGenreWhyFansLoveIt(genre: string): string {
  const reasons: Record<string, string> = {
    Action: `Fans are drawn to action anime for the visceral excitement of perfectly choreographed battles and the satisfaction of watching characters grow stronger through perseverance. The genre delivers cathartic moments when underdogs overcome impossible odds, and the best series create power systems complex enough to inspire endless discussion. There is a unique thrill in watching animation push the limits of what movement and impact can look like on screen.`,
    Adventure: `Adventure anime fans love the sense of limitless possibility that each new episode brings. The genre satisfies a deep human desire to explore and discover, offering vicarious travel to places that could never exist. Watching characters form bonds through shared hardship creates investment that deepens with every arc. The episodic nature allows for variety within a single series, ensuring no two arcs feel the same.`,
    Comedy: `Comedy anime fans love how the medium uses animation's full creative toolkit to land jokes impossible in any other format. The genre provides reliable stress relief and joy, with beloved series becoming comfort watches that fans return to repeatedly. Running gags that evolve over seasons reward dedicated viewers, while the genre's variety means there is a comedy style for every taste.`,
    Drama: `Drama anime fans love the emotional catharsis these series provide and the way thoughtful storytelling can shift their perspective on real life. The genre creates characters so well-developed they feel like real people, making their triumphs and failures personally affecting. Fans appreciate how drama anime respects their intelligence, trusting subtle details over exposition and allowing space for interpretation.`,
    Fantasy: `Fantasy anime fans love the escapism of fully realized alternate worlds and the creativity of unique magic systems. The genre offers the joy of learning new rules and seeing characters master extraordinary abilities. Epic scope, from continent-spanning quests to cosmic conflicts, satisfies a desire for grand narratives. The visual splendor that animation brings to magical phenomena creates memorable spectacles exclusive to this medium.`,
    Horror: `Horror anime fans love the unique thrills that animation can deliver - imagery too disturbing for live action, atmospheres too precisely controlled for other media. The genre provides a safe space to confront fear, offering catharsis through fictional terror. Fans appreciate how horror anime often contains deeper commentary about society, humanity, or psychology beneath its frightening surface. The community around horror anime thrives on discussing interpretations and sharing survival reactions.`,
    Romance: `Romance anime fans love the emotional journey of watching two characters navigate the path to each other. The genre delivers moments of pure joy - first confessions, reconciliations, quiet understanding - that create genuine emotional responses. Fans invest deeply in couples, debating pairings and celebrating milestones. The varied settings and subgenres mean romance anime can satisfy any mood, from lighthearted sweetness to bittersweet realism.`,
    "Sci-Fi": `Sci-fi anime fans love how the genre makes abstract concepts tangible and visually stunning. These series stimulate both intellectual curiosity and emotional engagement, asking big questions while telling personal stories. The freedom of animation means sci-fi anime can realize visions of the future unmatched by live-action budgets. Fans particularly value how the genre uses speculative scenarios to illuminate present-day issues from unexpected angles.`,
    Mystery: `Mystery anime fans love the intellectual engagement of solving puzzles alongside the characters. The genre provides the unique satisfaction of correctly predicting twists and the equal pleasure of being genuinely surprised. Rewatchability is high as fans spot clues they missed initially. The community aspect - debating theories between episodes, sharing interpretations of evidence - extends the experience beyond passive viewing into active participation.`,
    Thriller: `Thriller anime fans love the adrenaline rush of high-stakes psychological warfare and the satisfaction of watching brilliant plans unfold. The genre keeps viewers mentally engaged, constantly evaluating character decisions and anticipating consequences. Plot twists hit harder because of the investment in understanding the game being played. The best thriller anime creates scenarios where every episode ending demands immediate continuation.`,
    Sports: `Sports anime fans love how the genre transforms athletic competition into deeply emotional storytelling. Even viewers with no interest in the actual sport find themselves cheering, crying, and celebrating with the characters. The genre's structure of training, setbacks, and triumph creates reliable emotional payoffs without feeling formulaic. Team dynamics and rivalries add layers of interpersonal drama that elevate physical contests into character studies.`,
    Supernatural: `Supernatural anime fans love the "what if" quality of paranormal elements existing in a recognizable world. The genre offers just enough reality for relatability while introducing phenomena that spark imagination. Fans enjoy the variety of supernatural traditions drawn upon - from Japanese folklore to Western mythology to entirely original cosmologies. The contrast between mundane life and spiritual danger creates compelling dual-identity narratives.`,
    "Slice of Life": `Slice of life anime fans love the gentle, restorative quality of stories without artificial stakes or manufactured conflict. The genre provides a meditative viewing experience that reduces stress rather than amplifying it. Fans appreciate the careful observation of human behavior, the celebration of small joys, and the validation that ordinary life contains its own quiet beauty. These series become companions rather than mere entertainment.`,
    Mecha: `Mecha anime fans love the fusion of incredible mechanical design with intensely human drama. The genre satisfies both the aesthetic appreciation of beautifully designed machines and the emotional investment in the pilots who risk everything inside them. Iconic mecha designs become cultural touchstones, while the philosophical questions raised - about war, technology, and responsibility - ensure the genre transcends simple spectacle.`,
  };
  return reasons[genre] || `Fans of ${genre.toLowerCase()} anime appreciate the genre's unique ability to deliver experiences found nowhere else. The community around this genre is passionate and welcoming, with active discussions about favorites, hidden gems, and new releases keeping engagement high year-round.`;
}

function getGenreTips(genre: string): string {
  const tips: Record<string, string> = {
    Action: `Start with shorter series (12-25 episodes) if you are new to the genre to experience tight pacing before committing to longer shounen epics. Pay attention to the animation studios - Bones, MAPPA, and ufotable consistently deliver exceptional action animation. If you enjoy one series' power system, look for similar mechanical depth in others rather than just matching surface-level themes.`,
    Adventure: `For newcomers, begin with completed series to enjoy a full journey without waiting for new episodes. Adventure anime rewards patience, so give shows at least 3-5 episodes before judging. If you love one adventure anime, check whether it is part of a larger franchise with spin-offs that expand the world further.`,
    Comedy: `Comedy is highly subjective, so do not be discouraged if a popular series does not match your humor. Try watching the first episode of several comedy anime to find your preferred style - absurdist, deadpan, parody, or character-driven. Many comedy anime benefit from Japanese cultural knowledge, so community discussions can enhance jokes you might otherwise miss.`,
    Drama: `Give drama anime time to build its emotional foundation; early episodes often feel slow because they are investing in characters who will pay off later. Watch when you are in the right headspace for emotional stories. Check content warnings if you are sensitive to specific themes, as drama anime can tackle heavy subjects unflinchingly.`,
    Fantasy: `If you feel overwhelmed by complex world-building, start with isekai (transported to another world) entries that explain rules alongside the protagonist. For deeper fantasy, keep a mental note of the magic system's rules - they usually become important for plot resolution. Do not skip world-building episodes early on; they contain the foundation for later payoffs.`,
    Horror: `Check content ratings before watching, as horror anime varies dramatically in intensity. Start with psychological horror if you dislike gore, or atmospheric horror if you prefer dread over shock. Watch horror anime in a dark room with headphones for the intended experience. The genre benefits enormously from going in blind, so avoid spoiler-heavy reviews.`,
    Romance: `If a romance anime feels too slow, check whether it is a "will they/won't they" style or a "relationship development" style - knowing what to expect helps set proper expectations. Completed manga adaptations often have satisfying conclusions, while ongoing adaptations may end ambiguously. Pay attention to the sub-genre tags (shoujo, josei, seinen) as they indicate the target audience and emotional maturity.`,
    "Sci-Fi": `Hard sci-fi series reward attention to technical details - if something is explained early, it will likely matter later. For space operas, give them at least one full arc before judging as they require time to establish their universe. Older sci-fi anime (80s-90s) often has exceptional writing despite dated animation, so do not dismiss classics based on visuals alone.`,
    Mystery: `Avoid spoilers at all costs - mystery anime lives and dies by its reveals. Take notes while watching if you enjoy theorizing, and join episode discussion threads for the communal puzzle-solving experience. Rewatch after completion to appreciate the foreshadowing you missed. If a mystery feels unfair, check if it is classified as a thriller instead, where surprise takes priority over solvability.`,
    Thriller: `Do not binge too many thriller episodes in one sitting - the genre works best when you have time to process and anticipate between episodes. Pay close attention to character motivations, as thrillers often have multiple perspectives that recontextualize earlier scenes. The first episode usually establishes the rules of the game being played, so rewatch it if you feel lost later.`,
    Sports: `You do not need to understand or care about the actual sport to enjoy sports anime - the genre uses competition as a vehicle for character development. Start with the sport you find most visually interesting. Sports anime with completed source material tend to have more satisfying conclusions. The genre is excellent for motivation and can genuinely inspire physical activity.`,
    Supernatural: `Pay attention to the specific mythology being used - many supernatural anime draw from Japanese folklore (youkai, shinigami, onmyoji) that enriches the experience when understood. The genre blends well with others, so check tags to know whether you are getting horror-supernatural, comedy-supernatural, or action-supernatural. Seasonal and cultural references often carry thematic weight.`,
    "Slice of Life": `Approach slice of life anime with patience and an open mind - the genre rewards viewers who slow down and observe rather than those seeking constant stimulation. These series are perfect for winding down before sleep. Match your mood to the tone: healing slice of life for relaxation, comedic for lightness, bittersweet for thoughtful evenings.`,
    Mecha: `If the mechanical design intimidates you, start with character-focused mecha anime rather than military-heavy entries. Real robot and super robot are essentially different genres despite sharing the mecha label - try both to find your preference. Classic mecha series (Gundam, Evangelion) have large communities with viewing guides that help navigate decades of content.`,
  };
  return tips[genre] || `Start with the highest-rated entries in the genre to understand what defines excellence here, then branch out to discover your personal favorites among lesser-known titles. Community recommendations and discussion threads can help guide your journey through the genre's diverse offerings.`;
}

export function generateYearPageContent(year: number, animeCount: number): string {
  const overviewText = year >= 2020
    ? `${year} was a standout year for anime with high-quality productions across multiple genres and studios pushing creative boundaries.`
    : year >= 2010
      ? `${year} represented the modern era of anime with improved production quality and diverse storytelling.`
      : `${year} was part of anime's classic era, producing timeless series that continue to influence the medium today.`;

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Best Anime of ${year}</h2>
<p class="text-gray-300 leading-relaxed mb-4">Explore the top <strong class="text-purple-400 font-semibold">${animeCount}</strong> anime series that aired in <strong class="text-purple-400 font-semibold">${year}</strong>. From action-packed adventures to emotional dramas, ${year} brought us some incredible anime worth watching.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">${year} Anime Overview</h3>
<p class="text-gray-300 leading-relaxed mb-4">${overviewText}</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">How to Use This Page</h3>
<p class="text-gray-300 leading-relaxed mb-4">Browse our curated selection of ${year}'s best anime below. Each entry includes key information like genre, episode count, and synopsis to help you find your next watch.</p>`;
}

export function generateAnimeLikeContent(anime: AnimeData, similarAnime: { title: string; slug: string }[]): string {
  const title = escapeHtml(anime.titleEnglish || anime.title);

  return `<h2 class="text-xl font-bold text-white mt-6 mb-3">Anime Like ${title}</h2>
<p class="text-gray-300 leading-relaxed mb-4">Looking for anime similar to <strong class="text-white font-semibold">${title}</strong>? Here are ${similarAnime.length} anime recommendations that share similar themes, genres, or storytelling styles.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Why These Recommendations?</h3>
<p class="text-gray-300 leading-relaxed mb-4">We selected these anime based on shared genres (${anime.genres.slice(0, 3).map(g => escapeHtml(g)).join(", ")}), similar narrative structures, comparable art styles, and positive fan overlap. If you enjoyed ${title}, these series should appeal to your taste.</p>
<h3 class="text-lg font-semibold text-white mt-5 mb-2">Our Top Picks</h3>`;
}

function formatStatus(status: string | null | undefined): string {
  const statusMap: Record<string, string> = {
    FINISHED: "Completed",
    RELEASING: "Currently Airing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  return statusMap[status || ""] || "Unknown";
}

function getGenreDescription(genre: string): string {
  const descriptions: Record<string, string> = {
    Action: "Action anime features intense combat sequences, epic battles, and high-stakes confrontations. These series typically follow protagonists who must fight to protect what they believe in, featuring impressive choreography and power systems.",
    Adventure: "Adventure anime takes viewers on journeys through vast worlds, following characters as they explore unknown territories, discover ancient secrets, and grow through their experiences on the road.",
    Comedy: "Comedy anime aims to entertain through humor, featuring witty dialogue, absurd situations, slapstick moments, and clever parodies that keep viewers laughing episode after episode.",
    Drama: "Drama anime explores deep emotional themes, complex character relationships, and realistic portrayals of human struggles. These series often tackle heavy subjects with nuance and sensitivity.",
    Fantasy: "Fantasy anime transports viewers to magical worlds filled with supernatural elements, mythical creatures, and extraordinary powers. These series often feature complex magic systems and epic world-building.",
    Romance: "Romance anime focuses on love stories and relationships, exploring the development of romantic connections between characters through tender moments, misunderstandings, and emotional growth.",
    "Sci-Fi": "Science fiction anime explores futuristic technologies, space exploration, artificial intelligence, and speculative scenarios that challenge our understanding of reality and humanity's potential.",
    Horror: "Horror anime creates atmospheric dread and terror through supernatural threats, psychological horror, and disturbing imagery designed to unsettle and frighten viewers.",
    Mystery: "Mystery anime engages viewers with puzzles, investigations, and hidden truths waiting to be uncovered. These series reward attentive viewers who enjoy piecing together clues.",
    Thriller: "Thriller anime keeps viewers on the edge of their seats with suspenseful plots, psychological mind games, and unexpected twists that create a sense of urgency and tension.",
    Sports: "Sports anime captures the excitement of athletic competition, following dedicated athletes as they train, compete, and push their limits while building teamwork and rivalries.",
    Supernatural: "Supernatural anime deals with phenomena beyond natural explanation, featuring ghosts, demons, psychic abilities, and otherworldly forces that exist alongside or threaten the everyday world.",
    Slice_of_Life: "Slice of Life anime portrays everyday experiences in a relatable and often heartwarming way, finding beauty and meaning in ordinary moments and everyday interactions.",
    Mecha: "Mecha anime features giant robots and mechanical suits, often set against the backdrop of war or alien invasions, combining action with themes of technology and humanity.",
  };
  return descriptions[genre] || `${genre} anime encompasses a wide range of series that share thematic elements and storytelling approaches unique to this genre, offering viewers diverse experiences within a focused narrative framework.`;
}

// SEO Meta generators
export function generateMetaTitle(type: string, anime?: AnimeData, extra?: string): string {
  switch (type) {
    case "filler":
      return `${anime?.titleEnglish || anime?.title} Filler List - Episodes to Skip`;
    case "watch-order":
      return `${anime?.titleEnglish || anime?.title} Watch Order Guide (${new Date().getFullYear()})`;
    case "episodes":
      return `${anime?.titleEnglish || anime?.title} Episode Guide - All ${anime?.totalEpisodes} Episodes`;
    case "anime":
      return `${anime?.titleEnglish || anime?.title} - Synopsis, Episodes & Guides`;
    case "genre":
      return `Best ${extra} Anime - Top Series Ranked`;
    case "year":
      return `Best Anime of ${extra}`;
    case "anime-like":
      return `Anime Like ${anime?.titleEnglish || anime?.title} - Similar Recommendations`;
    default:
      return "AniYume";
  }
}

export function generateMetaDescription(type: string, anime?: AnimeData, extra?: string): string {
  switch (type) {
    case "filler":
      return `Complete ${anime?.titleEnglish || anime?.title} filler episode list. Find out which episodes are filler, canon, or mixed. Skip filler and watch only what matters.`;
    case "watch-order":
      return `The definitive ${anime?.titleEnglish || anime?.title} watch order guide. Learn the correct order to watch all series, movies, and OVAs in the franchise.`;
    case "episodes":
      return `Full episode guide for ${anime?.titleEnglish || anime?.title} with all ${anime?.totalEpisodes} episodes listed. Includes filler markers and arc breakdowns.`;
    case "anime":
      return `Everything about ${anime?.titleEnglish || anime?.title}: synopsis, episode count, filler guide, watch order, and recommendations for similar anime.`;
    case "genre":
      return `Discover the best ${extra?.toLowerCase()} anime series. Ranked list of top ${extra?.toLowerCase()} anime with ratings, episode counts, and descriptions.`;
    case "year":
      return `The best anime series from ${extra}. Complete ranked list of top anime that aired in ${extra} with ratings and descriptions.`;
    case "anime-like":
      return `Looking for anime similar to ${anime?.titleEnglish || anime?.title}? Here are our top recommendations based on genre, themes, and fan ratings.`;
    default:
      return "Comprehensive anime guides including filler lists, watch orders, and episode guides for all popular anime series.";
  }
}

export function generateMetaKeywords(type: string, anime?: AnimeData, extra?: string): string[] {
  const baseKeywords = ["anime", "guide", "AniYume"];
  const currentYear = new Date().getFullYear().toString();

  switch (type) {
    case "filler": {
      const title = anime?.titleEnglish || anime?.title || "";
      const keywords = [
        title,
        `${title} filler list`,
        `${title} filler guide`,
        `${title} episodes to skip`,
        `${title} canon episodes`,
        ...baseKeywords,
      ];
      if (anime?.genres) {
        keywords.push(...anime.genres.slice(0, 3).map(g => `${g.toLowerCase()} anime`));
      }
      return keywords;
    }
    case "genre": {
      const genre = extra || "";
      return [
        `${genre} anime`,
        `best ${genre.toLowerCase()} anime`,
        `top ${genre.toLowerCase()} anime`,
        `${genre.toLowerCase()} anime ${currentYear}`,
        `${genre.toLowerCase()} anime recommendations`,
        ...baseKeywords,
      ];
    }
    case "anime": {
      const title = anime?.titleEnglish || anime?.title || "";
      const keywords = [title, ...baseKeywords];
      if (anime?.title && anime.title !== anime.titleEnglish) {
        keywords.push(anime.title);
      }
      if (anime?.genres) {
        keywords.push(...anime.genres.slice(0, 3));
      }
      if (anime?.status) {
        keywords.push(anime.status === "RELEASING" ? "currently airing" : "completed anime");
      }
      return keywords;
    }
    case "year": {
      return [
        `best anime ${extra}`,
        `top anime ${extra}`,
        `anime ${extra}`,
        `${extra} anime list`,
        ...baseKeywords,
      ];
    }
    default:
      return baseKeywords;
  }
}