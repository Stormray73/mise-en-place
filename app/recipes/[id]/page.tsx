/**
 * FILE: app/recipes/[id]/page.tsx
 * DESCRIPTION: Server component for the recipe detail view.
 * STANDARDS: TDD, Clean Architecture.
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { calculateMacros } from "@/lib/recipes";
import RecipeView from "@/components/RecipeView";
import { Recipe, RecipeStep, RecipeComponent } from "@/types";

import FavoriteToggle from "@/components/FavoriteToggle";

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scale?: string }>;
}) {
  const { id } = await params;
  const { scale: scaleStr } = await searchParams;
  const initialScale = scaleStr ? parseFloat(scaleStr) : 1;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      tags: true,
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

  const recipeWithTypes = {
    ...recipe,
    components: recipe.components.map((c) => ({
      ...c,
      type: c.ingredientId ? "ingredient" : "sub-recipe",
    })),
  };

  const macros = await calculateMacros(recipeWithTypes as Partial<Recipe>);

  return (
    <main className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{recipe.title}</h1>
            <FavoriteToggle
              recipeId={recipe.id}
              initialIsFavorite={recipe.isFavorite}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <p className="text-zinc-400">
              Yield: {recipe.yieldAmount} {recipe.yieldUnit}
              {recipe.servings && ` • ${recipe.servings} servings`}
            </p>
            {recipe.tags.map((t) => (
              <span
                key={t.id}
                className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full flex items-center"
              >
                #{t.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/recipes/${id}/play?scale=${initialScale}`}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md font-bold transition-colors"
          >
            Cook it!
          </Link>
          <Link
            href={`/recipes/${id}/edit`}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md font-bold transition-colors"
          >
            Edit
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            &larr; Back
          </Link>
        </div>
      </div>

      <RecipeView
        recipe={
          recipeWithTypes as Recipe & {
            steps: RecipeStep[];
            components: RecipeComponent[];
          }
        }
        macros={macros}
        initialScale={initialScale}
      />
    </main>
  );
}
