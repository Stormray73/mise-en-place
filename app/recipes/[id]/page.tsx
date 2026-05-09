import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { calculateMacros } from "@/lib/recipes";

export default async function RecipeDetailPage({
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

  const macros = await calculateMacros(recipe);

  return (
    <main className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          <p className="text-zinc-400">
            Yield: {recipe.yieldAmount} {recipe.yieldUnit}
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/recipes/${id}/play`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Ingredients / Components */}
        <div className="lg:col-span-1 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-zinc-800">
              Ingredients
            </h2>
            <ul className="space-y-4">
              {recipe.components.map((comp) => (
                <li key={comp.id} className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-zinc-200">
                      {comp.ingredient?.name || comp.childRecipe?.title}
                    </span>
                    <p className="text-sm text-zinc-500">
                      {comp.quantity} {comp.unit}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Nutrition Facts
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Calories
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(macros.calories)}
                </p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Protein
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(macros.protein)}g
                </p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Fat
                </p>
                <p className="text-2xl font-bold">{Math.round(macros.fat)}g</p>
              </div>
              <div className="bg-zinc-800/50 p-3 rounded-lg">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                  Carbs
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(macros.carbs)}g
                </p>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-zinc-600 leading-tight">
              * Nutrients are calculated based on ingredients and sub-recipes.
              Data provided by USDA.
            </p>
          </section>
        </div>

        {/* Steps */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-zinc-800">
            Instructions
          </h2>
          <div className="space-y-8">
            {recipe.steps.map((step) => (
              <div key={step.id} className="flex gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold border border-zinc-700">
                  {step.order}
                </div>
                <div>
                  <p className="text-lg leading-relaxed">{step.instruction}</p>
                  {step.timerInSeconds && (
                    <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {Math.floor(step.timerInSeconds / 60)} minutes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
