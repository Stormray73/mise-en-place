import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import DeleteButton from "@/components/DeleteButton";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const { q } = await searchParams;

  if (!session) {
    redirect("/login");
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.user?.id,
      title: q
        ? {
            contains: q,
            mode: "insensitive",
          }
        : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400">Welcome, {session.user?.name}!</p>
        </div>

        <div className="flex-1 w-full flex justify-center">
          <SearchBar />
        </div>

        <div className="flex-1 flex justify-end">
          <Link
            href="/recipes/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold transition-colors whitespace-nowrap"
          >
            + New Recipe
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">
            {q
              ? `No recipes found matching "${q}"`
              : "No recipes yet. Create your first one!"}
          </div>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all aspect-square flex flex-col"
            >
              <Link
                href={`/recipes/${recipe.id}`}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-2">
                    {recipe.yieldAmount} {recipe.yieldUnit}
                  </p>
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
                <Link
                  href={`/recipes/${recipe.id}/play`}
                  className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Cook it! →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
