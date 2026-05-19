/**
 * @file lib/db-retry.ts
 * @responsibility Utility for retrying Prisma queries on transient network/DNS failures.
 */

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 500,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const code = (error as { code?: string })?.code;

      const isTransient =
        message.includes("ENOTFOUND") ||
        message.includes("ECONNREFUSED") ||
        message.includes("Connection terminated") ||
        code === "P2024" || // Prisma connection timeout
        code === "P1001"; // Can't reach DB server

      if (!isTransient) throw error;

      console.warn(
        `Database connection transient error (attempt ${i + 1}/${retries}): ${message}`,
      );
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
}
