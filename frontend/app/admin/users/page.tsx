"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockAdminUsers } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";

export default function AdminUsersPage() {
  return (
    <DashboardLayout title="User Management" subtitle="System accounts overview" roles={["dispatcher"]}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registered Users</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href={`${API_URL}/admin/`} target="_blank" rel="noreferrer">Open Django Admin</a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-500">
                  <th className="pb-3 pr-4">Username</th>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {mockAdminUsers.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-800/50">
                    <td className="py-3 pr-4 font-medium text-zinc-200">{u.username}</td>
                    <td className="py-3 pr-4 text-zinc-400">{u.first_name} {u.last_name}</td>
                    <td className="py-3 pr-4 text-zinc-400">{u.email}</td>
                    <td className="py-3"><Badge variant="outline">{u.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-600">Sample data shown. Manage users in Django Admin for production.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
