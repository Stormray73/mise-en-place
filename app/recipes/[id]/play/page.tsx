import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { RecipePlayMode } from "@/components/RecipePlayMode";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function PlayRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      steps: {
        orderBy: { order: "asc" },
      },
      components: {
        include: {
          ingredient: true,
          childRecipe: true,
        },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

  // We allow playing any recipe, but you must be logged in.
  // (In a real app, maybe only your recipes or public recipes)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            <p className="text-zinc-500">Cooking Mode</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
          >
            Exit
          </Link>
        </div>
        <RecipePlayMode recipe={recipe} />
      </div>
    </main>
  );
}
