"use client";

import { useState } from "react";
import { Tier, Role, User } from "@prisma/client";
import { updateUserTierAction, updateUserRoleAction } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminDashboardProps {
  stats: {
    totalAiUsage: number;
    totalUsers: number;
  };
  initialUsers: Partial<User>[];
}

export default function AdminDashboard({
  stats,
  initialUsers,
}: AdminDashboardProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggleTier = async (userId: string, currentTier: Tier) => {
    setLoading(userId);
    const newTier = currentTier === Tier.FREE ? Tier.PRO : Tier.FREE;
    const result = await updateUserTierAction(userId, newTier);
    if (result.success) {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, tier: newTier } : u)),
      );
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const handleToggleRole = async (userId: string, currentRole: Role) => {
    setLoading(userId);
    const newRole = currentRole === Role.USER ? Role.ADMIN : Role.USER;
    const result = await updateUserRoleAction(userId, newRole);
    if (result.success) {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      alert(result.error);
    }
    setLoading(null);
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-2 text-zinc-400 uppercase tracking-wider text-sm">
            System Health
          </h2>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-4xl font-bold">{stats.totalAiUsage}</p>
              <p className="text-zinc-500 text-sm">Total AI Operations</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{stats.totalUsers}</p>
              <p className="text-zinc-500 text-sm">Active Users</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          <div className="w-64">
            <Input
              placeholder="Search by email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="p-4 border-b border-zinc-800">User</th>
                <th className="p-4 border-b border-zinc-800">Email</th>
                <th className="p-4 border-b border-zinc-800">Tier</th>
                <th className="p-4 border-b border-zinc-800">Role</th>
                <th className="p-4 border-b border-zinc-800 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="p-4 border-b border-zinc-800">
                    <div className="font-medium">
                      {user.name || "Anonymous"}
                    </div>
                  </td>
                  <td className="p-4 border-b border-zinc-800 text-zinc-400">
                    {user.email}
                  </td>
                  <td className="p-4 border-b border-zinc-800">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${user.tier === Tier.PRO ? "bg-blue-900/50 text-blue-400 border border-blue-800" : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}
                    >
                      {user.tier}
                    </span>
                  </td>
                  <td className="p-4 border-b border-zinc-800">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${user.role === Role.ADMIN ? "bg-purple-900/50 text-purple-400 border border-purple-800" : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 border-b border-zinc-800 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleTier(user.id!, user.tier!)}
                      disabled={loading === user.id}
                    >
                      Toggle Tier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleRole(user.id!, user.role!)}
                      disabled={loading === user.id}
                    >
                      Toggle Role
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
