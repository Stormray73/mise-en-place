import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ShoppingListClient from "./ShoppingListClient";
import { generateShoppingList } from "@/lib/shopping-list";

export default async function ShoppingListPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { start, end } = await searchParams;

  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date();
  if (!end) endDate.setDate(startDate.getDate() + 7);

  const shoppingList = await generateShoppingList(
    session.user.id,
    startDate,
    endDate,
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping List</h1>
      <ShoppingListClient
        initialList={shoppingList}
        initialStart={startDate.toISOString().split("T")[0]}
        initialEnd={endDate.toISOString().split("T")[0]}
      />
    </div>
  );
}
