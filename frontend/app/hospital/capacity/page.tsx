"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HospitalCapacityChart } from "@/components/dashboard/charts";
import { Progress } from "@/components/ui/progress";
import { hospitalService } from "@/services/hospital.service";
import { USE_MOCK } from "@/lib/constants";
import { mockHospitals } from "@/lib/mock-data";

export default function HospitalCapacityPage() {
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockHospitals) : hospitalService.list()),
  });

  return (
    <DashboardLayout title="Capacity Dashboard" subtitle="System-wide bed availability" roles={["hospital"]}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Capacity Overview</CardTitle></CardHeader>
          <CardContent><HospitalCapacityChart hospitals={hospitals} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Facility Status</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {hospitals.map((h) => {
              const availPct = h.total_beds ? (h.available_beds / h.total_beds) * 100 : 0;
              const status = availPct > 20 ? "Normal" : availPct > 5 ? "Limited" : "Critical";
              const color = availPct > 20 ? "text-emerald-400" : availPct > 5 ? "text-amber-400" : "text-red-400";
              return (
                <div key={h.id} className="glass-panel rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-zinc-200">{h.name}</h3>
                    <span className={`text-sm font-semibold ${color}`}>{status}</span>
                  </div>
                  <Progress value={availPct} className="mt-3" />
                  <p className="mt-2 text-xs text-zinc-500">{h.available_beds} beds available of {h.total_beds}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
