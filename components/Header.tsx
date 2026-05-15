import Link from "next/link";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white sm:inline-block">
              Mise-en-place
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 sm:gap-6">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Recipes
              </Link>
              <Link
                href="/meal-planner"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Meal Plan
              </Link>
              <Link
                href="/dashboard/pantry"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Pantry
              </Link>
              <Link
                href="/dashboard/shopping-list"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Shopping List
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
