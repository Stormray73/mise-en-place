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

  let startDate: Date;
  let endDate: Date;

  if (start) {
    startDate = new Date(start);
  } else {
    const initialDate = new Date();
    startDate = new Date(initialDate);
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - startDate.getUTCDay());
  }

  if (end) {
    endDate = new Date(end);
  } else {
    endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 7);
  }

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
