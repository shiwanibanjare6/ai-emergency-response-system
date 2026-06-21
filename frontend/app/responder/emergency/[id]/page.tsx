"use client";

import { use } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { EmergencyTimeline } from "@/components/emergency/emergency-timeline";
import { EmergencyMap } from "@/components/maps/map-loader";
import { useEmergency } from "@/hooks/useEmergencies";
import { formatStatus } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResponderEmergencyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: emergency, isLoading } = useEmergency(parseInt(id, 10));

  return (
    <DashboardLayout title={`Assignment #${id}`} roles={["responder"]}>
      {isLoading || !emergency ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle>{formatStatus(emergency.status)}</CardTitle>
              <SeverityBadge severity={emergency.severity} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{emergency.description}</p>
              <p className="text-sm text-zinc-500">Citizen: {emergency.citizen_name}</p>
              <EmergencyMap
                markers={[{ id: "e", lat: emergency.lat, lng: emergency.lng, type: "emergency", severity: emergency.severity, label: `#${emergency.id}` }]}
                center={{ lat: emergency.lat, lng: emergency.lng }}
                className="h-64 w-full"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent><EmergencyTimeline history={emergency.status_history} /></CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
