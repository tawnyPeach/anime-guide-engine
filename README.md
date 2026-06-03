# Anime Guide Engine

A production-ready programmatic SEO website that generates anime guide pages to rank on Google and monetize with AdSense. Built with Next.js App Router, Prisma, SQLite, and TailwindCSS.

## Features

- **Anime Database Pages** — `/anime/[slug]` — Full metadata, scores, genres, studios
- **Filler Episode Guides** — `/anime/[slug]/filler-list` — Canon vs filler episode breakdown
- **Watch Order Guides** — `/anime/[slug]/watch-order` — Correct viewing order for franchises
- **Episode Guides** — `/anime/[slug]/episodes` — Complete episode list with filler markers
- **Genre Pages** — `/genre/[genre]` — Programmatically generated genre collections
- **Year Pages** — `/year/[year]` — Best anime by year with seasonal breakdown
- **Similar Anime** — `/anime-like/[slug]` — Recommendations based on genre overlap

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) |
| Styling | TailwindCSS 4 |
| Database | SQLite (dev) / PostgreSQL (prod, via Prisma ORM) |
| API Sources | AniList GraphQL, Jikan (MAL), Filler Dataset |
| Deployment | Vercel-compatible |

## SEO Architecture

- **Static Generation (SSG)** with Incremental Static Regeneration (ISR)
- Auto-generated `sitemap.xml` with all page types
- `robots.txt` configuration
- JSON-LD structured data on all pages
- Schema.org BreadcrumbList navigation
- SEO-optimized meta titles and descriptions
- Internal linking strategy across all page types
- Clean slug-based URLs

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (requires running PostgreSQL)
npx prisma db push

# Seed database with top 200 anime from AniList
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://localhost:5432/anime_guide_dev"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="Anime Guide Engine"
NEXT_PUBLIC_ADSENSE_CLIENT_ID=""  # Optional
```

> **Note:** The app uses PostgreSQL. For local development, you can either run a local PostgreSQL instance or use a free Neon database. The build will succeed without a running database, but pages will only render on-demand when the database is available.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run seed` | Seed database with 200 anime from AniList |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:reset` | Reset database |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── anime/[slug]/           # Anime detail pages
│   │   ├── filler-list/        # Filler guide
│   │   ├── watch-order/        # Watch order guide
│   │   └── episodes/           # Episode guide
│   ├── anime-like/[slug]/      # Similar anime recommendations
│   ├── genre/[genre]/          # Genre collection pages
│   ├── year/[year]/            # Year collection pages
│   ├── sitemap.ts              # Dynamic sitemap
│   ├── robots.ts               # Robots.txt
│   └── layout.tsx              # Root layout with AdSense
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AnimeCard.tsx
│   ├── Breadcrumbs.tsx
│   └── AdBanner.tsx
├── lib/
│   ├── prisma.ts               # Database client
│   ├── anilist.ts              # AniList GraphQL API
│   ├── jikan.ts                # Jikan/MAL API
│   ├── filler-data.ts          # Filler episode dataset
│   └── content-generator.ts    # SEO content generation
├── scripts/
│   └── seed.ts                 # Database seeder
└── prisma/
    └── schema.prisma           # Database schema
```

## Data Models

- **Anime** — Core metadata (title, slug, genres, episodes, scores, images)
- **Episode** — Individual episodes with filler/canon markers
- **WatchOrder** — Franchise viewing order chains
- **FillerMapping** — Filler/canon episode classifications
- **AnimeRelation** — Prequel/sequel/side story connections
- **SEOPage** — Generated SEO page metadata

## Deployment (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy - Vercel handles SSG/ISR automatically

### Production Deployment (PostgreSQL)

For production, use a PostgreSQL database (recommended: [Neon](https://neon.tech) free tier):

1. **Create a Neon database** at [neon.tech](https://neon.tech) and copy the connection string.

2. **Set `DATABASE_URL` in Vercel Dashboard:**
   - Go to your project Settings > Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string:
     ```
     postgresql://user:password@ep-example.us-east-2.aws.neon.tech/dbname?sslmode=require
     ```

3. **Push the schema to your database:**
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

4. **Run the seed script against production:**
   ```bash
   DATABASE_URL="postgresql://..." npm run seed
   ```

> **Note:** For PostgreSQL deployments, use `npx prisma db push` instead of `prisma migrate dev`. The migrations folder is provider-specific. SQLite migrations are not compatible with PostgreSQL.

## Monetization

AdSense integration is built-in:
1. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in environment
2. Ad slots appear automatically in page layouts
3. Placeholder banners show in development mode

## Content Strategy

Pages include human-readable, SEO-optimized content:
- Filler guides explain what filler is and whether to skip
- Watch orders explain franchise viewing logic
- Genre pages describe the genre with curated lists
- Similar anime pages explain recommendation reasoning

## License

MIT
