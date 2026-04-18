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
              <span className="text-xl font-bold text-black">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white sm:inline-block">
              Mise-en-place
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Register
              </Link>
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
