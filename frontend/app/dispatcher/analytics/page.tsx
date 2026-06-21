"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/dashboard/stat-card";
import { SeverityChart, ResponseTimeChart, HospitalCapacityChart } from "@/components/dashboard/charts";
import { ConnectionStatus, LiveIndicator } from "@/components/dashboard/connection-status";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useSocket } from "@/components/providers/socket-provider";
import { hospitalService } from "@/services/hospital.service";
import { USE_MOCK } from "@/lib/constants";
import { mockHospitals } from "@/lib/mock-data";
import type { DashboardStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export default function DispatcherAnalyticsPage() {
  const { connected } = useSocket();
  const { data: analytics, isLoading, isLive } = useAnalytics();
  const { data: emergencies = [] } = useEmergencies();
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockHospitals) : hospitalService.list()),
  });

  const active = emergencies.filter((e) => !["resolved", "cancelled"].includes(e.status));

  const stats: DashboardStats | null = analytics
    ? {
        activeEmergencies: analytics.active_emergencies,
        criticalIncidents: analytics.critical_incidents,
        availableResponders: analytics.available_responders,
        hospitalCapacity: analytics.hospital_capacity_pct,
      }
    : null;

  return (
    <DashboardLayout title="Analytics Dashboard" subtitle="Real-time operations metrics" roles={["dispatcher"]}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ConnectionStatus connected={connected} />
        {isLive && <LiveIndicator />}
        {analytics?.timestamp && (
          <p className="text-xs text-zinc-600">Last update: {formatDate(analytics.timestamp)}</p>
        )}
      </div>

      {isLoading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Severity Distribution</CardTitle></CardHeader>
          <CardContent>
            <SeverityChart emergencies={active.length ? active : []} />
            {analytics && !active.length && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div><p className="text-red-400 font-bold">{analytics.severity_breakdown.critical}</p><p className="text-zinc-500">Critical</p></div>
                <div><p className="text-amber-400 font-bold">{analytics.severity_breakdown.medium}</p><p className="text-zinc-500">Medium</p></div>
                <div><p className="text-emerald-400 font-bold">{analytics.severity_breakdown.low}</p><p className="text-zinc-500">Low</p></div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Response Time Trends</CardTitle></CardHeader>
          <CardContent><ResponseTimeChart /></CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Unit Availability</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {analytics && (
              <>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-emerald-400">Available</span>
                    <span>{analytics.responder_breakdown.available}</span>
                  </div>
                  <Progress value={(analytics.responder_breakdown.available / Math.max(1, Object.values(analytics.responder_breakdown).reduce((a, b) => a + b, 0))) * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-amber-400">Busy</span>
                    <span>{analytics.responder_breakdown.busy}</span>
                  </div>
                  <Progress value={(analytics.responder_breakdown.busy / Math.max(1, Object.values(analytics.responder_breakdown).reduce((a, b) => a + b, 0))) * 100} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-zinc-400">Offline</span>
                    <span>{analytics.responder_breakdown.offline}</span>
                  </div>
                  <Progress value={(analytics.responder_breakdown.offline / Math.max(1, Object.values(analytics.responder_breakdown).reduce((a, b) => a + b, 0))) * 100} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hospital Capacity</CardTitle></CardHeader>
          <CardContent><HospitalCapacityChart hospitals={hospitals} /></CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
