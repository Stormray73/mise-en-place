import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RecipeEditor } from "@/components/RecipeEditor";

export default async function NewRecipePage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">New Recipe</h1>
            <p className="mt-2 text-zinc-400">
              Build your next masterpiece. Add ingredients from the USDA
              database or use your own sub-recipes.
            </p>
          </div>
          <RecipeEditor />
        </div>
      </main>
    </div>
  );
}
