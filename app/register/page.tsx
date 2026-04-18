"use client";

import { useState } from "react";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await registerUser({ username, password });

      // If it's a redirect, the server action will handle it
      // but if there's an error, it will return it.
      if (result && result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      // Server actions 'redirect' throws an error that Next.js catches,
      // but if we catch it here manually we might block the redirect.
      // However, we want to catch actual errors.
      if (err instanceof Error && err.message === "NEXT_REDIRECT") {
        throw err;
      }
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Create an account
          </h1>
          <p className="mt-2 text-zinc-400">Join Mise-en-place today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-400"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="chef_gusteau"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-400"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-white hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
