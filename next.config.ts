import type { NextConfig } from "next";
import path from "path";

const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres = databaseUrl.startsWith("postgres");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "img.anili.st",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
    ],
  },
  // Include the SQLite database in the serverless function bundle (only for SQLite)
  ...(isPostgres
    ? {}
    : {
        outputFileTracingIncludes: {
          "/*": [path.join(__dirname, "prisma", "dev.db")],
        },
      }),
};

export default nextConfig;
