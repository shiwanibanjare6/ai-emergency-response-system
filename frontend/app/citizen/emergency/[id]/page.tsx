"use client";

import { use } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { EmergencyTimeline } from "@/components/emergency/emergency-timeline";
import { EmergencyMap } from "@/components/maps/map-loader";
import { useEmergency } from "@/hooks/useEmergencies";
import { formatStatus } from "@/lib/utils";

export default function CitizenEmergencyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: emergency, isLoading } = useEmergency(parseInt(id, 10));

  return (
    <DashboardLayout title={`Emergency #${id}`} subtitle="Track your report" roles={["citizen"]}>
      {isLoading || !emergency ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Status: {formatStatus(emergency.status)}</CardTitle>
              <SeverityBadge severity={emergency.severity} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">{emergency.description}</p>
              {emergency.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={emergency.image} alt="Evidence" className="max-h-64 rounded-lg border border-zinc-800" />
              )}
              {emergency.voice_file && <audio controls src={emergency.voice_file} className="w-full" />}
              <EmergencyMap
                markers={[{ id: "e", lat: emergency.lat, lng: emergency.lng, type: "emergency", severity: emergency.severity, label: `#${emergency.id}` }]}
                center={{ lat: emergency.lat, lng: emergency.lng }}
                className="h-48 w-full"
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
