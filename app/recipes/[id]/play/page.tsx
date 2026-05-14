import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { RecipePlayMode } from "@/components/RecipePlayMode";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Recipe, RecipeStep, RecipeComponent } from "@/types";

export default async function PlayRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scale?: string }>;
}) {
  const { id } = await params;
  const { scale: scaleStr } = await searchParams;
  const scale = scaleStr ? parseFloat(scaleStr) : 1;
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

  const recipeWithTypes = {
    ...recipe,
    components: recipe.components.map((c) => ({
      ...c,
      type: c.ingredientId ? "ingredient" : ("sub-recipe" as const),
    })),
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{recipe.title}</h1>
            <p className="text-zinc-500">Cooking Mode</p>
          </div>
          <Link
            href={`/recipes/${id}?scale=${scale}`}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors text-sm"
          >
            Exit
          </Link>
        </div>
        <RecipePlayMode
          recipe={
            recipeWithTypes as Recipe & {
              steps: RecipeStep[];
              components: RecipeComponent[];
            }
          }
          scale={scale}
        />
      </div>
    </main>
  );
}
