import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { withRetry } from "./db-retry";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaNeon | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// In standard Node.js development (like local Docker), we prefer the native driver
// for better performance and easier debugging of connection issues.
// The Neon Serverless adapter is primarily for Edge runtimes.
const useAdapter =
  process.env.NODE_ENV === "production" ||
  process.env.FORCE_NEON_ADAPTER === "true";

const getAdapter = () => {
  if (!useAdapter) return null;
  if (globalForPrisma.prismaAdapter) return globalForPrisma.prismaAdapter;
  const adapter = new PrismaNeon({ connectionString });
  if (process.env.NODE_ENV !== "production")
    globalForPrisma.prismaAdapter = adapter;
  return adapter;
};

const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const adapter = getAdapter();
  const client = new PrismaClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter: adapter as any,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          return withRetry(() => query(args));
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = client as any;
  return client as PrismaClient;
};

export const prisma = getPrisma();
