import "@testing-library/jest-dom";
import { vi } from "vitest";

// Set dummy DATABASE_URL for tests to prevent prisma initialization errors
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/testdb";

// Mock auth to prevent next-auth from trying to load next/server in jsdom
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

// Add any global test setup here
// Mocking the Next.js router globally
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as Error & { digest?: string };
    error.digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw error;
  }),
}));
