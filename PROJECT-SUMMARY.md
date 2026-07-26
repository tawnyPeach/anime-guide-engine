# AniYume - Complete Project Summary

## What Is This Project?

**AniYume** (anime + yume "dream" in Japanese) is a **programmatic SEO anime guide website** built with Next.js. It provides filler episode lists, watch orders, episode guides, "anime like X" recommendations, genre/year/studio browsing, and anime comparison tools.

**Live URL:** https://aniyume.net  
**Domain:** aniyume.net (no www)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| ORM | Prisma 5.22 |
| Database | PostgreSQL on Aiven |
| Hosting | Vercel |
| Styling | Tailwind CSS (dark theme) |
| Analytics | Google Analytics 4 (G-M04J8CGEMR) |
| SEO Verification | Google Search Console (K3fpGV_ip9kTOU9QK9hBVdRi3-Cr5tSAWSE3eg9iQmc) |
| Ads | Google AdSense (optional, not yet active) |

---

## Credentials & URLs

### GitHub
- **Account:** tawnyPeach
- **Repo:** https://github.com/tawnyPeach/anime-guide-engine.git
- **PAT:** *(stored locally in .git-credentials, not in repo)*
- **Git user:** `tawnyPeach` / `tawnyPeach@users.noreply.github.com`
- **Branches:**
  - `ui` ← **PRODUCTION branch** (Vercel deploys from here)
  - `v2` ← **NEW feature suite** (based on ui, 47 files, 7900 insertions)
  - `feat/anime-guide-engine` ← original dev branch
  - `main` ← default/unused

### Aiven Database
- **Host:** `pg-13aeb9bf-ayoubmox33-8f2a.j.aivencloud.com`
- **Port:** `11664`
- **User:** `avnadmin`
- **Password:** *(stored in .env DATABASE_URL, not in repo)*
- **Database:** `defaultdb`
- **Full URL:** *(stored in .env as DATABASE_URL, not in repo)*
- **IP Allowlist:** 0.0.0.0/0 (open to all)
- **Note:** Free tier has limited connection slots (~4-6). Can hit "remaining connection slots reserved for SUPERUSER" errors.

### Vercel
- **Project:** anime-guide-engine
- **Deploy branch:** ui
- **Environment variable:** `DATABASE_URL` = Aiven connection string (already set)
- **Build command:** `npx prisma generate && next build`

### Google Services
- **GA4:** G-M04J8CGEMR
- **Search Console verification:** K3fpGV_ip9kTOU9QK9hBVdRi3-Cr5tSAWSE3eg9iQmc

---

## Current Database State

| Table | Count | Description |
|-------|-------|-------------|
| Anime | 1,000 | Top 1000 anime from AniList API |
| Episode | 17,779+ | Episode placeholders + some with Jikan titles |
| FillerMapping | 8 | Only 8 anime matched with filler data (needs improvement) |
| WatchOrder | 86 | Generated from anime relations |
| AnimeRelation | 588 | Sequel/prequel/side-story connections |
| SEOPage | 254 | Generated filler/episode/genre/year SEO pages |

**Note:** A seed script is currently running in background (PID check with `ps aux | grep seed.ts`). It's fetching episode titles from Jikan API for anime with MAL IDs. The main 1000 anime are already seeded.

---

## Project Structure

```
anime-guide-engine/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage (popular, recent, filler guides, airing)
│   │   ├── anime/[slug]/       # Individual anime page
│   │   ├── anime/[slug]/filler-list/
│   │   ├── anime/[slug]/episodes/
│   │   ├── anime/[slug]/watch-order/
│   │   ├── anime-like/[slug]/  # "Anime like X" recommendations
│   │   ├── after/[slug]/       # "What to watch after X"
│   │   ├── compare/[slugs]/    # Compare two anime
│   │   ├── genre/[genre]/      # Genre browse pages
│   │   ├── year/[year]/        # Year browse pages
│   │   ├── season/[season]/    # Season browse (WINTER/SPRING/SUMMER/FALL)
│   │   ├── studio/[slug]/      # Studio browse pages
│   │   ├── top/[type]/         # Top anime lists
│   │   ├── calendar/           # Anime airing calendar
│   │   ├── search/             # Search page
│   │   ├── blog/               # Blog (markdown)
│   │   ├── bookmarks/          # User bookmarks (localStorage)
│   │   ├── api/og/             # OG image generation
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   ├── robots.ts           # Robots.txt
│   │   └── loading.tsx         # Loading skeletons (13 files)
│   ├── components/             # React components (26 files)
│   ├── lib/                    # Utility libraries
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── anilist.ts          # AniList GraphQL API
│   │   ├── filler-data.ts      # 27 filler anime entries (27 with data, 78 empty ones removed)
│   │   ├── recommendations.ts  # Genre-based recommendation engine
│   │   ├── content-generator.ts # SEO content generation
│   │   ├── calendar.ts         # Airing schedule
│   │   ├── cache.ts            # In-memory cache (not useful on serverless)
│   │   └── rate-limiter.ts     # API rate limiting
│   └── content/blog/           # Markdown blog posts
├── prisma/
│   └── schema.prisma           # Database schema (PostgreSQL)
├── scripts/
│   ├── seed.ts                 # Main seed script (AniList + Jikan + filler)
│   └── seed-filler.ts          # Filler data scraper
└── .env                        # DATABASE_URL (gitignored)
```

---

## Page Types & Routes

| Route | Purpose | DB Queries | Dynamic |
|-------|---------|-----------|---------|
| `/` | Homepage: popular, recent, filler guides, airing today | Yes | Yes |
| `/anime/[slug]` | Full anime page with details, relations, streaming links | Yes | Yes |
| `/anime/[slug]/filler-list` | Filler episode breakdown | Yes | Yes |
| `/anime/[slug]/episodes` | Full episode list with titles | Yes | Yes |
| `/anime/[slug]/watch-order` | Watch order for franchise | Yes | Yes |
| `/anime-like/[slug]` | Similar anime recommendations | Yes | Yes |
| `/after/[slug]` | What to watch after finishing an anime | Yes | Yes |
| `/compare/[slugs]` | Side-by-side anime comparison | Yes | Yes |
| `/genre/[genre]` | Browse anime by genre | Yes | Yes |
| `/year/[year]` | Browse anime by year | Yes | Yes |
| `/season/[season]` | Browse by season | Yes | Yes |
| `/studio/[slug]` | Browse by studio | Yes | Yes |
| `/top/[type]` | Top anime lists | Yes | Yes |
| `/calendar` | Airing schedule | External API | Yes |
| `/search` | Search anime | Yes | Yes |
| `/blog` | Blog posts | File system | Yes |
| `/bookmarks` | User bookmarks | localStorage | Client |

**All pages use `export const dynamic = "force-dynamic"`** — no static generation at build time. This is required because Vercel's build environment cannot reach the Aiven database during build.

---

## Database Schema (Key Models)

- **Anime** — 1000 anime with title, description, genres (JSON string), episodes, status, season, cover/banner images, MAL/AniList IDs, scores, studios, externalLinks
- **Episode** — Episode placeholders with filler/mixed markers and titles (from Jikan)
- **AnimeRelation** — Links between anime (PREQUEL, SEQUEL, SIDE_STORY, SPIN_OFF, etc.)
- **WatchOrder** — JSON-ordered watch lists per anime
- **FillerMapping** — Filler/mixed/canon episode lists per anime
- **SEOPage** — Generated SEO pages (filler, episodes, genre, year)

---

## What Has Been Done

### Phase 1: Initial Build (feat/anime-guide-engine branch)
- Built complete Next.js app with 15+ page types
- AniList API integration for anime data
- Prisma schema with 6 models
- Seed script fetching top 200 anime
- Filler data for ~100 anime (embedded)
- Content generation for SEO pages
- Dark theme UI with Tailwind CSS
- OG image generation
- Google Analytics
- Search functionality
- Bookmark system (localStorage)

### Phase 2: Database Migration (sqlite → PostgreSQL)
- Switched Prisma provider from sqlite to PostgreSQL
- Created Aiven PostgreSQL instance
- Ran `prisma db push` to sync schema
- Seeded 200 anime initially

### Phase 3: Vercel Deployment Fixes
- Added `export const dynamic = "force-dynamic"` to all 13 DB-dependent pages
- Removed dead `revalidate` exports (contradicted force-dynamic)
- Added `externalLinks` column to schema
- Fixed hardcoded domain in structured data

### Phase 4: Major Improvements (latest commit 6ab8ee8)
- Added 13 loading.tsx skeleton files for all routes
- Fixed genre false-match in recommendations (`contains` → quoted JSON match)
- Enhanced year page content with year-specific milestones/trends
- Enhanced anime-like content with detailed methodology
- Updated sitemap to include all dynamic routes
- Fixed filler data slug matching (case-insensitive, fuzzy)
- Fixed broken retry catch in seed script
- Removed 78 zero-filler entries (bloat cleanup)
- Removed unused `getGenreDescription` function

### Phase 5: Full Re-seed (in progress)
- Re-running seed with 1000 anime (20 pages from AniList)
- Fetching episode titles from Jikan API
- Better filler slug matching
- Currently at ~400/1000 anime fetching episode titles (40% done)

### Phase 6: V2 Feature Suite (commit 344b0bf)
- Branch: `v2` (based on `ui`)
- 47 files changed, 7900 insertions
- **Affiliate system:** Watch Now buttons, streaming links, merch section, VPN banners
- **Interactive tools:** Anime quiz, tier list maker, random anime picker, anime comparison tool, watch time calculator
- **User features:** Watch tracker/watchlist (localStorage), user reviews & ratings
- **Content:** Anime quotes database (45 quotes), ending explained articles, manga vs anime comparisons
- **Seasonal chart:** 4 season tabs + upcoming
- **API routes:** `/api/search-anime`, `/api/anime/[slug]`, `/api/anime/random`
- **All features integrated into navigation (Header), homepage promos, and anime detail pages**
- Zero TypeScript errors

---

## Current Seed Script Phases

1. **seedAnimeFromAniList()** — Fetches 20 pages × 50 anime = 1000 from AniList API
2. **seedFillerData()** — Matches embedded filler data to anime by slug/title
3. **seedEpisodeTitles()** — Fetches episode titles from Jikan API (MAL)
4. **generateWatchOrders()** — Creates watch order lists from relations
5. **generateSEOPages()** — Generates SEO pages for filler/episodes/genres/years

---

## Known Issues / Bugs

1. **FillerMapping count is very low (8/27)** — Many filler entries don't match anime slugs even with fuzzy matching
2. **`force-dynamic` kills all caching** — Every request hits the DB, slow and expensive
3. **Cache module is useless on serverless** — `cache.ts` uses module-level singleton
4. **No error boundaries on ad components** — AdBanner can cause hydration errors
5. **Watch order generation is naive** — No topological sort, just array index ordering
6. **Free Aiven tier** — Limited connections, can block seed script from running simultaneously with app

---

## Monetization Plan (Not Yet Implemented)

### Priority 1: Affiliate Revenue
1. **"Watch Now" buttons** — Crunchyroll/Netflix/HIDIVE affiliate links on every anime page
2. **Streaming availability checker** — JustWatch API integration
3. **Merchandise links** — Amazon affiliate for figures/manga
4. **VPN affiliate banners** — NordVPN/ExpressVPN for geo-locked content

### Priority 2: Ad Revenue Drivers
5. **Anime quiz** — "Which anime character are you?" (viral/shareable)
6. **Seasonal anime chart** — "Fall 2025 schedule" (huge seasonal search spikes)
7. **Tier list generator** — User-created, shareable lists
8. **"How long to watch X?" calculator** — Unique tool, highly searchable
9. **Anime comparison content** — Flesh out the `/compare` route
10. **Random anime picker** — "Pick for me" feature

### Priority 3: Retention
11. **Watch tracker** — Log episodes watched, daily return visits
12. **Watchlist/wishlist** — Plan to watch / currently watching / completed
13. **Anime schedule notifications** — Email/push when tracked anime airs
14. **User reviews and ratings** — UGC for SEO + retention
15. **Forum/discussion per anime** — Community engagement

### Priority 4: SEO Plays
16. **Anime quotes database** — "Best Naruto quotes" (massive long-tail)
17. **Anime ending explained articles** — Spike traffic after finales
18. **Manga vs anime differences** — Underserved niche
19. **Browser extension** — Filler info overlay on AniList/MAL pages

---

## Git History (Recent)

```
344b0bf feat: v2 - complete feature suite (47 files, 7900 insertions)
6ab8ee8 feat: major improvements - loading skeletons, better content, fixed recommendations, cleanup
17432ed fix: add force-dynamic to remaining 5 pages
07fdbc1 merge: bring postgresql + force-dynamic changes into ui branch
dd924ef fix: force-dynamic on all pages to skip DB at build time for Vercel
5049e40 feat: switch db provider from sqlite to postgresql for Aiven
```

**Branches:**
- `v2` ← NEW feature suite (current)
- `ui` ← PRODUCTION (Vercel deploys from here)
- `feat/anime-guide-engine` ← original dev branch

---

## Commands Reference

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Seed database (full - takes ~15-20 min)
npm run seed

# Prisma commands
npx prisma db push          # Sync schema to DB
npx prisma generate         # Generate Prisma client
npx prisma studio           # Visual DB editor

# Check seed progress
tail -f seed-output.log

# Connect to DB directly (credentials in .env)
# Use DATABASE_URL from .env
```

---

## Key Design Decisions

1. **`force-dynamic` on all pages** — Required because Vercel build can't reach Aiven DB during static generation. Trade-off: no ISR caching, every request hits DB.
2. **Genres stored as JSON string** — `genres` column is `"["Action","Fantasy"]"` not a Postgres array. This causes matching issues (fixed with quoted contains).
3. **Filler data embedded in code** — 27 anime with hardcoded filler episodes in `filler-data.ts`. Not fetched from external source.
4. **External links from AniList** — Streaming links stored as JSON in `externalLinks` column.
5. **No authentication** — Bookmarks are localStorage-only. No user accounts yet.
6. **Dark theme only** — No light mode toggle needed for anime audience.

---

## What To Do Next Session

1. **Check if seed completed** — `tail -f seed-output.log` or check DB counts
2. **Verify filler matching improved** — Check `FillerMapping` count
3. **Configure affiliate tags** — Replace placeholder `?ref=aniyume` with real Crunchyroll/Amazon/etc affiliate tags
4. **Merge v2 → ui** — Once tested, merge v2 into ui for Vercel deployment
5. **Push v2 to Vercel** — Or set up Vercel to deploy from v2 temporarily
6. **Consider adding user accounts** — For watch tracker persistence across devices
