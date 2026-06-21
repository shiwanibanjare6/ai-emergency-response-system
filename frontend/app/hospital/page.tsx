"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { hospitalService } from "@/services/hospital.service";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { USE_MOCK } from "@/lib/constants";
import { mockHospitals } from "@/lib/mock-data";

export default function HospitalDashboard() {
  const { data: incoming = [], isLoading: loadingIncoming } = useQuery({
    queryKey: ["hospital-incoming"],
    queryFn: () => hospitalService.incoming(),
    refetchInterval: 8000,
  });
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockHospitals) : hospitalService.list()),
  });

  return (
    <DashboardLayout title="Hospital Intake" subtitle="Incoming patient alerts & queue" roles={["hospital"]}>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Queue ({incoming.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingIncoming ? <Skeleton className="h-32" /> : !incoming.length ? (
              <p className="py-8 text-center text-sm text-zinc-500">No incoming patients</p>
            ) : (
              incoming.map((p) => (
                <div key={p.id} className="glass-panel rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100">Emergency #{p.emergency}</span>
                    <SeverityBadge severity={p.severity as "low" | "medium" | "critical"} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    ETA: <strong className="text-amber-400">{p.eta_minutes} min</strong>
                  </p>
                  {p.emergency_details && (
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{p.emergency_details.description}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-600">{formatDate(p.created_at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bed Availability</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {hospitals.map((h) => {
              const pct = h.total_beds ? Math.round((h.available_beds / h.total_beds) * 100) : 0;
              return (
                <div key={h.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-300">{h.name}</span>
                    <span className="text-zinc-500">{h.available_beds}/{h.total_beds}</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
