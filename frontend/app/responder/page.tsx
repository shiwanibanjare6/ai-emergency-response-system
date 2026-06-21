"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmergencyFeed } from "@/components/dashboard/emergency-feed";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { useAssignedEmergencies, useUpdateEmergencyStatus } from "@/hooks/useEmergencies";
import { responderService } from "@/services/responder.service";
import { RESPONDER_STATUS_OPTIONS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResponderDashboard() {
  const { data: assignments = [], isLoading } = useAssignedEmergencies();
  const { data: profile } = useQuery({ queryKey: ["responder-me"], queryFn: () => responderService.me() });
  const updateStatus = useUpdateEmergencyStatus();

  const updateLocation = async () => {
    if (!profile) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await responderService.updateLocation(profile.id, pos.coords.latitude, pos.coords.longitude);
        toast.success("Location updated");
      },
      () => toast.error("GPS unavailable")
    );
  };

  const primary = assignments[0];

  return (
    <DashboardLayout title="Responder Unit" subtitle={profile ? `${profile.type.toUpperCase()} · ${profile.status}` : "Loading..."} roles={["responder"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Button onClick={updateLocation} className="gap-2"><MapPin className="h-4 w-4" /> Update Location</Button>
          {primary && (
            <Button variant="secondary" asChild className="gap-2">
              <Link href="/responder/map"><Navigation className="h-4 w-4" /> Open Navigation</Link>
            </Button>
          )}
        </div>

        {primary && (
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Active Assignment #{primary.id}
                <SeverityBadge severity={primary.severity} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">{primary.description}</p>
              <p className="text-sm text-zinc-500">Location: {primary.lat.toFixed(4)}, {primary.lng.toFixed(4)}</p>
              <Select
                onValueChange={(status) =>
                  updateStatus.mutate({ id: primary.id, status, note: `Status updated to ${status}` })
                }
              >
                <SelectTrigger><SelectValue placeholder="Update response status" /></SelectTrigger>
                <SelectContent>
                  {RESPONDER_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>All Assignments</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : (
              assignments.length ? (
                <EmergencyFeed emergencies={assignments} detailPath="/responder/emergency" />
              ) : (
                <p className="text-sm text-zinc-500">No active assignments. Stand by.</p>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
