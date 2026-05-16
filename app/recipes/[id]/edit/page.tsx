import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { RecipeEditor } from "@/components/RecipeEditor";
import { RecipeSaveData } from "@/types";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function EditRecipePage({
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

  if (recipe.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const recipeWithTypes: RecipeSaveData = {
    ...recipe,
    isFavorite: recipe.isFavorite,
    tags: recipe.tags.map((t) => t.name),
    servings: recipe.servings || undefined,
    components: recipe.components.map((c) => {
      if (c.ingredientId && c.ingredient) {
        return {
          ...c,
          type: "ingredient" as const,
          ingredientId: c.ingredientId,
          ingredient: {
            ...c.ingredient,
            name: c.ingredient.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            baseMacros: c.ingredient.baseMacros as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            foodPortions: c.ingredient.foodPortions as any,
          },
        };
      } else {
        return {
          ...c,
          type: "sub-recipe" as const,
          childRecipeId: c.childRecipeId,
          childRecipe: c.childRecipe,
        };
      }
    }),
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <Link
          href="/dashboard"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
      <RecipeEditor
        initialData={recipeWithTypes as unknown as RecipeSaveData}
      />
    </main>
  );
}
