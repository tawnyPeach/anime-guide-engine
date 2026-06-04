-- CreateTable
CREATE TABLE "Anime" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "titleEnglish" TEXT,
    "titleJapanese" TEXT,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "genres" TEXT NOT NULL,
    "totalEpisodes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT,
    "season" TEXT,
    "seasonYear" INTEGER,
    "coverImage" TEXT,
    "bannerImage" TEXT,
    "malId" INTEGER,
    "anilistId" INTEGER,
    "averageScore" INTEGER,
    "popularity" INTEGER,
    "format" TEXT,
    "source" TEXT,
    "studios" TEXT,
    "externalLinks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "title" TEXT,
    "isFiller" BOOLEAN NOT NULL DEFAULT false,
    "isMixedCanonFiller" BOOLEAN NOT NULL DEFAULT false,
    "arcName" TEXT,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchOrder" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "orderList" TEXT NOT NULL,

    CONSTRAINT "WatchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FillerMapping" (
    "id" SERIAL NOT NULL,
    "animeId" INTEGER NOT NULL,
    "fillerEpisodes" TEXT NOT NULL,
    "mixedEpisodes" TEXT,
    "canonEpisodes" TEXT,
    "totalFiller" INTEGER NOT NULL DEFAULT 0,
    "totalMixed" INTEGER NOT NULL DEFAULT 0,
    "totalCanon" INTEGER NOT NULL DEFAULT 0,
    "fillerPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "FillerMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeRelation" (
    "id" SERIAL NOT NULL,
    "fromAnimeId" INTEGER NOT NULL,
    "toAnimeId" INTEGER NOT NULL,
    "relationType" TEXT NOT NULL,

    CONSTRAINT "AnimeRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SEOPage" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "animeId" INTEGER,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDesc" TEXT NOT NULL,
    "contentHtml" TEXT,
    "keywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SEOPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Anime_slug_key" ON "Anime"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_malId_key" ON "Anime"("malId");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_anilistId_key" ON "Anime"("anilistId");

-- CreateIndex
CREATE INDEX "Anime_slug_idx" ON "Anime"("slug");

-- CreateIndex
CREATE INDEX "Anime_seasonYear_idx" ON "Anime"("seasonYear");

-- CreateIndex
CREATE INDEX "Anime_status_idx" ON "Anime"("status");

-- CreateIndex
CREATE INDEX "Anime_popularity_idx" ON "Anime"("popularity");

-- CreateIndex
CREATE INDEX "Episode_animeId_idx" ON "Episode"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_animeId_episodeNumber_key" ON "Episode"("animeId", "episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WatchOrder_animeId_key" ON "WatchOrder"("animeId");

-- CreateIndex
CREATE INDEX "WatchOrder_animeId_idx" ON "WatchOrder"("animeId");

-- CreateIndex
CREATE UNIQUE INDEX "FillerMapping_animeId_key" ON "FillerMapping"("animeId");

-- CreateIndex
CREATE INDEX "FillerMapping_animeId_idx" ON "FillerMapping"("animeId");

-- CreateIndex
CREATE INDEX "AnimeRelation_fromAnimeId_idx" ON "AnimeRelation"("fromAnimeId");

-- CreateIndex
CREATE INDEX "AnimeRelation_toAnimeId_idx" ON "AnimeRelation"("toAnimeId");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeRelation_fromAnimeId_toAnimeId_relationType_key" ON "AnimeRelation"("fromAnimeId", "toAnimeId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "SEOPage_slug_key" ON "SEOPage"("slug");

-- CreateIndex
CREATE INDEX "SEOPage_slug_idx" ON "SEOPage"("slug");

-- CreateIndex
CREATE INDEX "SEOPage_type_idx" ON "SEOPage"("type");

-- CreateIndex
CREATE INDEX "SEOPage_animeId_idx" ON "SEOPage"("animeId");

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchOrder" ADD CONSTRAINT "WatchOrder_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FillerMapping" ADD CONSTRAINT "FillerMapping_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeRelation" ADD CONSTRAINT "AnimeRelation_fromAnimeId_fkey" FOREIGN KEY ("fromAnimeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeRelation" ADD CONSTRAINT "AnimeRelation_toAnimeId_fkey" FOREIGN KEY ("toAnimeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SEOPage" ADD CONSTRAINT "SEOPage_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
