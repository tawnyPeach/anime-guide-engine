import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDbUrl(): string {
  // Always resolve to absolute path for the SQLite database
  // The dev.db is in the prisma/ directory at the project root
  const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  return `file:${dbPath}`;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDbUrl(),
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
