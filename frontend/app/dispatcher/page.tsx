"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/dashboard/stat-card";
import { EmergencyFeed } from "@/components/dashboard/emergency-feed";
import { SeverityChart, ResponseTimeChart, HospitalCapacityChart } from "@/components/dashboard/charts";
import { LiveTrackingMap } from "@/components/maps/live-map-loader";
import { ConnectionStatus, LiveIndicator } from "@/components/dashboard/connection-status";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSocket } from "@/components/providers/socket-provider";
import { hospitalService } from "@/services/hospital.service";
import { responderService } from "@/services/responder.service";
import { USE_MOCK } from "@/lib/constants";
import { mockHospitals, mockResponders, mockStats } from "@/lib/mock-data";
import type { DashboardStats, MapMarker } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, MapPin } from "lucide-react";

export default function DispatcherDashboard() {
  const { connected } = useSocket();
  const { data: emergencies = [], isLoading } = useEmergencies();
  const { data: liveAnalytics } = useAnalytics();
  const { data: responders = [] } = useQuery({
    queryKey: ["responders"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockResponders) : responderService.list()),
    refetchInterval: connected ? false : 10000,
  });
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockHospitals) : hospitalService.list()),
  });

  const active = emergencies.filter((e) => !["resolved", "cancelled"].includes(e.status));
  const stats: DashboardStats = liveAnalytics
    ? {
        activeEmergencies: liveAnalytics.active_emergencies,
        criticalIncidents: liveAnalytics.critical_incidents,
        availableResponders: liveAnalytics.available_responders,
        hospitalCapacity: liveAnalytics.hospital_capacity_pct,
      }
    : USE_MOCK
      ? mockStats
      : {
          activeEmergencies: active.length,
          criticalIncidents: active.filter((e) => e.severity === "critical").length,
          availableResponders: responders.filter((r) => r.status === "available").length,
          hospitalCapacity: hospitals.length
            ? Math.round(
                (hospitals.reduce((a, h) => a + (h.total_beds - h.available_beds), 0) /
                  hospitals.reduce((a, h) => a + h.total_beds, 0)) *
                  100
              )
            : 0,
        };

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = active.map((e) => ({
      id: `e-${e.id}`,
      lat: e.lat,
      lng: e.lng,
      type: "emergency",
      severity: e.severity,
      label: `Emergency #${e.id}`,
      status: e.status,
    }));
    responders.forEach((r) =>
      m.push({ id: `r-${r.id}`, lat: r.lat, lng: r.lng, type: "responder", label: r.username ?? `Unit ${r.id}`, status: r.status })
    );
    hospitals.forEach((h) =>
      m.push({ id: `h-${h.id}`, lat: h.lat, lng: h.lng, type: "hospital", label: h.name })
    );
    return m;
  }, [active, responders, hospitals]);

  return (
    <DashboardLayout title="Command Center" subtitle="Real-time emergency operations" roles={["dispatcher"]}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ConnectionStatus connected={connected} />
        {connected && <LiveIndicator />}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dispatcher/map"><MapPin className="mr-1 h-4 w-4" /> Full Live Map</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dispatcher/analytics"><BarChart3 className="mr-1 h-4 w-4" /> Analytics</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : (
          <StatsGrid stats={stats} />
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Live Emergency Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-48" /> : <EmergencyFeed emergencies={active} detailPath="/dispatcher/emergency" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <SeverityChart emergencies={active} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Live Operations Map</CardTitle>
              {connected && <LiveIndicator />}
            </CardHeader>
            <CardContent>
              <LiveTrackingMap markers={markers} liveResponders={responders} className="h-[360px] w-full" />
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Response Time Analytics</CardTitle></CardHeader>
              <CardContent><ResponseTimeChart /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Hospital Capacity</CardTitle></CardHeader>
              <CardContent><HospitalCapacityChart hospitals={hospitals} /></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
