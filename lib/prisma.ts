import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { withRetry } from "./db-retry";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as {
  prisma: unknown | undefined;
  prismaAdapter: PrismaNeon | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const getAdapter = () => {
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
    adapter,
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

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
};

export const prisma = getPrisma();
