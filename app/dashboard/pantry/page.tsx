import { auth } from "@/auth";
import { getPantry } from "@/lib/pantry";
import PantryClient from "./PantryClient";
import { redirect } from "next/navigation";

export default async function PantryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const pantry = await getPantry(session.user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pantry Inventory</h1>
      </div>
      <PantryClient initialPantry={pantry} />
    </div>
  );
}
