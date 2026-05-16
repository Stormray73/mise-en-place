import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock auth to prevent next-auth from trying to load next/server in jsdom
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

// Add any global test setup here
// For example, mocking the Next.js router:
// vi.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: vi.fn(),
//     replace: vi.fn(),
//     prefetch: vi.fn(),
//   }),
//   usePathname: () => '',
//   useSearchParams: () => new URLSearchParams(),
// }))
