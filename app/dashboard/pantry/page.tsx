import { auth } from "@/auth";
import { getPantry } from "@/lib/pantry";
import PantryClient from "./PantryClient";
import CustomIngredientsClient from "./CustomIngredientsClient";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PantryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const pantry = await getPantry(session.user.id);

  const customIngredients = await prisma.ingredient.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      baseAmount: true,
      baseMacros: true,
      foodPortions: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pantry Inventory</h1>
      </div>
      <PantryClient initialPantry={pantry} />

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CustomIngredientsClient ingredients={customIngredients as any} />
    </div>
  );
}
