"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveTrackingMap } from "@/components/maps/live-map-loader";
import { ConnectionStatus, LiveIndicator } from "@/components/dashboard/connection-status";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useSocket } from "@/components/providers/socket-provider";
import { hospitalService } from "@/services/hospital.service";
import { responderService } from "@/services/responder.service";
import { USE_MOCK } from "@/lib/constants";
import { mockHospitals, mockResponders } from "@/lib/mock-data";
import type { MapMarker } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function DispatcherLiveMapPage() {
  const { connected } = useSocket();
  const { data: emergencies = [] } = useEmergencies();
  const { data: responders = [] } = useQuery({
    queryKey: ["responders"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockResponders) : responderService.list()),
    refetchInterval: connected ? false : 8000,
  });
  const { data: hospitals = [] } = useQuery({
    queryKey: ["hospitals"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockHospitals) : hospitalService.list()),
  });

  const active = emergencies.filter((e) => !["resolved", "cancelled"].includes(e.status));

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
      m.push({
        id: `r-${r.id}`,
        lat: r.lat,
        lng: r.lng,
        type: "responder",
        label: r.username ?? `Unit ${r.id}`,
        status: r.status,
      })
    );
    hospitals.forEach((h) =>
      m.push({ id: `h-${h.id}`, lat: h.lat, lng: h.lng, type: "hospital", label: h.name })
    );
    return m;
  }, [active, responders, hospitals]);

  return (
    <DashboardLayout title="Live Tracking Map" subtitle="Real-time responder & incident positions" roles={["dispatcher"]}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ConnectionStatus connected={connected} label="Socket.IO" />
        <div className="flex flex-wrap gap-2">
          <Badge variant="critical">{active.filter((e) => e.severity === "critical").length} Critical</Badge>
          <Badge variant="outline">{responders.filter((r) => r.status === "available").length} Units Available</Badge>
          <Badge variant="low">{responders.filter((r) => r.status === "busy").length} En Route</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Tactical Overview
            {connected && <LiveIndicator />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveTrackingMap
            markers={markers}
            liveResponders={responders}
            className="h-[calc(100vh-280px)] min-h-[500px] w-full"
            zoom={12}
          />
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Critical incident</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-sky-400 animate-pulse" /> Live responder</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-400" /> Hospital</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {responders.map((r) => (
          <div key={r.id} className="glass-panel rounded-lg p-3 text-sm">
            <p className="font-medium text-zinc-200">{r.username ?? `Unit #${r.id}`}</p>
            <p className="text-xs capitalize text-zinc-500">{r.type} · {r.status}</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">{r.lat.toFixed(4)}, {r.lng.toFixed(4)}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
