import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import DeleteButton from "@/components/DeleteButton";
import RecipeStoreHeader from "./RecipeStoreHeader";
import { RecipeStatus } from "@prisma/client";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    favorites?: string;
    tag?: string;
    drafts?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const { q, favorites, tag, drafts, page: pageStr } = await searchParams;

  if (!session) {
    redirect("/login");
  }

  const isDrafts = drafts === "true";
  const page = parseInt(pageStr || "1", 10);
  const pageSize = 12;

  const whereClause = {
    userId: session.user?.id,
    status: isDrafts
      ? ("DRAFT" as RecipeStatus)
      : ("PUBLISHED" as RecipeStatus),
    isFavorite: favorites === "true" ? true : undefined,
    tags: tag
      ? {
          some: {
            name: tag,
          },
        }
      : undefined,
    title: q
      ? {
          contains: q,
          mode: "insensitive" as const,
        }
      : undefined,
  };

  const recipes = await prisma.recipe.findMany({
    where: whereClause,
    include: {
      tags: true,
    },
    orderBy: { updatedAt: "desc" },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  const totalRecipes = await prisma.recipe.count({
    where: whereClause,
  });

  const totalPages = Math.max(1, Math.ceil(totalRecipes / pageSize));

  const allTags = await prisma.tag.findMany({
    where: { userId: session.user?.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1
            className={`text-3xl font-extrabold tracking-tight ${
              isDrafts
                ? "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent"
            }`}
          >
            {isDrafts ? "Draft Recipes" : "My Recipes"}
          </h1>
          {isDrafts && (
            <p className="text-zinc-500 text-xs mt-1">
              Showing recipes imported in bulk. Review, modify, and click
              &quot;Save&quot; to publish them to your main store.
            </p>
          )}
        </div>

        <div className="flex-1 w-full flex flex-col items-center gap-4">
          <SearchBar />
          <div className="flex gap-2 flex-wrap justify-center">
            <Link
              href="/recipes"
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                !favorites && !tag && !isDrafts
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              All
            </Link>
            <Link
              href={`/recipes?favorites=true${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                favorites === "true"
                  ? "bg-yellow-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              ★ Favorites
            </Link>
            <Link
              href={`/recipes?drafts=true${q ? `&q=${q}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                isDrafts
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              📝 Drafts
            </Link>
            {allTags.map((t) => (
              <Link
                key={t.id}
                href={`/recipes?tag=${encodeURIComponent(t.name)}${isDrafts ? "&drafts=true" : ""}${
                  q ? `&q=${q}` : ""
                }`}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  tag === t.name
                    ? "bg-green-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                #{t.name}
              </Link>
            ))}
          </div>
        </div>

        <RecipeStoreHeader />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">
            {q || favorites || tag
              ? "No recipes found matching your filters."
              : isDrafts
                ? "No imported drafts yet. Try uploading a batch of recipes!"
                : "No recipes yet. Create your first one!"}
          </div>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`group relative bg-zinc-900 border rounded-xl overflow-hidden transition-all min-h-[280px] flex flex-col ${
                isDrafts
                  ? "border-purple-900/30 hover:border-purple-500/50 bg-gradient-to-b from-zinc-900 to-purple-950/10"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              <Link
                href={
                  isDrafts
                    ? `/recipes/${recipe.id}/edit`
                    : `/recipes/${recipe.id}`
                }
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 pr-16">
                    <h3
                      className={`text-xl font-bold transition-colors line-clamp-2 ${isDrafts ? "group-hover:text-purple-400" : "group-hover:text-blue-400"}`}
                    >
                      {recipe.title}
                    </h3>
                    {isDrafts ? (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-[10px] font-extrabold uppercase tracking-wide">
                        Draft
                      </span>
                    ) : (
                      recipe.isFavorite && (
                        <span
                          className="text-yellow-500 text-xl"
                          title="Favorite"
                        >
                          ★
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 mt-2">
                    {recipe.yieldAmount} {recipe.yieldUnit}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {recipe.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full"
                      >
                        #{t.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-zinc-600">
                  Last updated {new Date(recipe.updatedAt).toLocaleDateString()}
                </div>
              </Link>

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                  title="Edit Recipe"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Link>
                <DeleteButton id={recipe.id} />
              </div>

              <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-between items-center">
                {isDrafts ? (
                  <Link
                    href={`/recipes/${recipe.id}/edit`}
                    className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors animate-pulse"
                  >
                    Review & Publish →
                  </Link>
                ) : (
                  <Link
                    href={`/recipes/${recipe.id}/play`}
                    className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Cook it! →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12 border-t border-zinc-800 pt-8">
          <Link
            href={`/recipes?page=${page - 1}${isDrafts ? "&drafts=true" : ""}${favorites === "true" ? "&favorites=true" : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${q ? `&q=${q}` : ""}`}
            className={`px-4 py-2 rounded bg-zinc-800 text-sm font-bold transition-colors ${
              page <= 1
                ? "opacity-50 pointer-events-none text-zinc-600"
                : "text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            ← Previous
          </Link>
          <span className="text-sm text-zinc-400 font-medium">
            Page <strong className="text-zinc-200">{page}</strong> of{" "}
            <strong className="text-zinc-200">{totalPages}</strong>
          </span>
          <Link
            href={`/recipes?page=${page + 1}${isDrafts ? "&drafts=true" : ""}${favorites === "true" ? "&favorites=true" : ""}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}${q ? `&q=${q}` : ""}`}
            className={`px-4 py-2 rounded bg-zinc-800 text-sm font-bold transition-colors ${
              page >= totalPages
                ? "opacity-50 pointer-events-none text-zinc-600"
                : "text-zinc-200 hover:bg-zinc-700"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
