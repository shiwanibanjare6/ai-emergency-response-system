"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyMap } from "@/components/maps/map-loader";
import { useAssignedEmergencies } from "@/hooks/useEmergencies";
import { responderService } from "@/services/responder.service";
import type { MapMarker } from "@/types";

export default function ResponderMapPage() {
  const { data: assignments = [] } = useAssignedEmergencies();
  const { data: profile } = useQuery({ queryKey: ["responder-me"], queryFn: () => responderService.me() });

  const markers: MapMarker[] = useMemo(() => {
    const m: MapMarker[] = assignments.map((e) => ({
      id: `e-${e.id}`,
      lat: e.lat,
      lng: e.lng,
      type: "emergency",
      severity: e.severity,
      label: `Emergency #${e.id}`,
      status: e.status,
    }));
    if (profile) {
      m.push({
        id: "me",
        lat: profile.lat,
        lng: profile.lng,
        type: "responder",
        label: "Your Unit",
        status: profile.status,
      });
    }
    return m;
  }, [assignments, profile]);

  const center = assignments[0]
    ? { lat: assignments[0].lat, lng: assignments[0].lng }
    : profile
      ? { lat: profile.lat, lng: profile.lng }
      : undefined;

  return (
    <DashboardLayout title="Navigation" subtitle="Route to assigned incident" roles={["responder"]}>
      <Card>
        <CardHeader><CardTitle>Tactical Navigation Map</CardTitle></CardHeader>
        <CardContent>
          <EmergencyMap markers={markers} center={center} className="h-[calc(100vh-220px)] min-h-[500px] w-full" zoom={14} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
