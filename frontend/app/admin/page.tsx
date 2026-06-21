"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/dashboard/stat-card";
import { SeverityChart, ResponseTimeChart } from "@/components/dashboard/charts";
import { mockAdminUsers, mockEmergencies, mockHospitals, mockResponders, mockStats } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_staff && user.role !== "dispatcher") {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <DashboardLayout title="Admin Command" subtitle="System oversight & analytics" roles={["dispatcher"]}>
      <div className="space-y-6">
        <StatsGrid stats={mockStats} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>System Severity Overview</CardTitle></CardHeader>
            <CardContent><SeverityChart emergencies={mockEmergencies} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Performance Metrics</CardTitle></CardHeader>
            <CardContent><ResponseTimeChart /></CardContent>
          </Card>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Users ({mockAdminUsers.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockAdminUsers.map((u) => (
                <div key={u.id} className="flex justify-between rounded-lg border border-zinc-800 p-2 text-sm">
                  <span>{u.username}</span>
                  <Badge variant="outline">{u.role}</Badge>
                </div>
              ))}
              <p className="pt-2 text-xs text-zinc-600">Full CRUD via Django Admin at /admin/</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Responders</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockResponders.map((r) => (
                <div key={r.id} className="flex justify-between rounded-lg border border-zinc-800 p-2 text-sm">
                  <span>{r.username}</span>
                  <Badge variant="outline">{r.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hospitals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockHospitals.map((h) => (
                <div key={h.id} className="rounded-lg border border-zinc-800 p-2 text-sm">
                  <p className="font-medium">{h.name}</p>
                  <p className="text-xs text-zinc-500">{h.available_beds}/{h.total_beds} beds</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
