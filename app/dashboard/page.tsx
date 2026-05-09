import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const recipes = await prisma.recipe.findMany({
    where: { userId: session.user?.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400">Welcome, {session.user?.name}!</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/recipes/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-bold transition-colors"
          >
            + New Recipe
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        {recipes.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center text-zinc-500">
            No recipes yet. Create your first one!
          </div>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex justify-between items-center hover:border-zinc-700 transition-colors"
            >
              <Link href={`/recipes/${recipe.id}`} className="flex-1 group">
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-sm text-zinc-500">
                  Yield: {recipe.yieldAmount} {recipe.yieldUnit}
                </p>
              </Link>
              <div className="flex gap-3">
                <Link
                  href={`/recipes/${recipe.id}/play`}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-sm transition-colors"
                >
                  Cook it!
                </Link>
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md text-sm transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
