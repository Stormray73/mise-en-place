import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";
import { getAdminStatsAction } from "./actions";

export default async function AdminPage() {
  const session = await auth();

  // Route protection
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const statsResponse = await getAdminStatsAction();
  const stats = statsResponse.success
    ? statsResponse.data
    : { totalAiUsage: 0, totalUsers: 0 };

  const initialUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      tier: true,
    },
    orderBy: { email: "asc" },
  });

  return (
    <div className="w-full px-4 md:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Admin Portal
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage users, limits, and system health.
          </p>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AdminDashboard stats={stats as any} initialUsers={initialUsers as any} />
    </div>
  );
}
