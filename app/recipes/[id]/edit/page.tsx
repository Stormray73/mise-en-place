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

  const recipeWithTypes = {
    ...recipe,
    components: recipe.components.map((c) => ({
      ...c,
      type: c.ingredientId ? "ingredient" : ("sub-recipe" as const),
    })),
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
