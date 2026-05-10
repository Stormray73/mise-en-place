"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.replace(`/dashboard?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search recipes..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      {isPending && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
