"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Brain, Building2, Truck } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { EmergencyTimeline } from "@/components/emergency/emergency-timeline";
import { AssignResponderModal } from "@/components/emergency/assign-responder-modal";
import { EmergencyMap } from "@/components/maps/map-loader";
import { useEmergency } from "@/hooks/useEmergencies";
import { aiService } from "@/services/ai.service";
import { hospitalService } from "@/services/hospital.service";
import type { AIAnalysis, DispatchRecommendation, HospitalRecommendation } from "@/types";
import { formatStatus } from "@/lib/utils";

export default function DispatcherEmergencyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const emergencyId = parseInt(id, 10);
  const { data: emergency, isLoading } = useEmergency(emergencyId);
  const [assignOpen, setAssignOpen] = useState(false);
  const qc = useQueryClient();

  const { data: dispatch } = useQuery({
    queryKey: ["ai-dispatch", emergencyId],
    queryFn: () => aiService.suggestDispatch(emergencyId),
    enabled: emergencyId > 0,
  });

  const { data: hospitals } = useQuery({
    queryKey: ["ai-hospital", emergencyId],
    queryFn: () => aiService.suggestHospital(emergencyId),
    enabled: emergencyId > 0,
  });

  const analyze = useMutation({
    mutationFn: () => aiService.analyze(emergencyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emergencies", emergencyId] });

      qc.invalidateQueries({
        queryKey: ["ai-dispatch", emergencyId],
      });

      toast.success("AI analysis updated");
    },
  });

  const notifyHospital = useMutation({
    mutationFn: ({ hospitalId, eta }: { hospitalId: number; eta: number }) =>
      hospitalService.notify(hospitalId, emergencyId, eta),
    onSuccess: () => toast.success("Hospital notified"),
  });

  if (isLoading || !emergency) {
    return (
      <DashboardLayout title="Emergency Detail" roles={["dispatcher"]}>
        <Skeleton className="h-96 w-full" />
      </DashboardLayout>
    );
  }

  const markers = [
    { id: "e", lat: emergency.lat, lng: emergency.lng, type: "emergency" as const, severity: emergency.severity, label: `#${emergency.id}`, status: emergency.status },
  ];

  return (
    <DashboardLayout title={`Emergency #${emergency.id}`} subtitle={formatStatus(emergency.status)} roles={["dispatcher"]}>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Incident Overview</CardTitle>
              <SeverityBadge severity={emergency.severity} />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">{emergency.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-xs text-zinc-500">Citizen</p><p>{emergency.citizen_name}</p></div>
                <div><p className="text-xs text-zinc-500">Status</p><p>{formatStatus(emergency.status)}</p></div>
              </div>
              {emergency.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={emergency.image} alt="Evidence" className="max-h-64 rounded-lg border border-zinc-800 object-cover" />
              )}
              {emergency.voice_file && (
                <audio controls src={emergency.voice_file} className="w-full" />
              )}
              <EmergencyMap markers={markers} center={{ lat: emergency.lat, lng: emergency.lng }} className="h-56 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Action Timeline</CardTitle></CardHeader>
            <CardContent><EmergencyTimeline history={emergency.status_history} /></CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-red-400" /> AI Analysis</CardTitle>
              <Button size="sm" variant="outline" onClick={() => analyze.mutate()} disabled={analyze.isPending}>
                Re-analyze
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">

  <div className="grid grid-cols-2 gap-3">

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">Severity</p>
      <SeverityBadge severity={emergency.severity} />
    </div>

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">Priority</p>
      <Badge
  className={
    emergency.priority === "P1"
      ? "bg-red-600"
      : emergency.priority === "P2"
      ? "bg-yellow-600"
      : "bg-green-600"
  }
>
  {emergency.priority}
</Badge>
    </div>

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">
        Severity Score
      </p>
      <p className="text-xl font-bold text-red-400">
        {emergency.severity_score}/100
      </p>
    </div>

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">
        Confidence
      </p>
      <p className="text-xl font-bold">
        {emergency.confidence}%
      </p>
    </div>

  </div>

  <div>
    <p className="mb-1 text-xs text-zinc-500">
      Recommended Unit
    </p>

    <Badge variant="outline">
      {emergency.recommended_responder_type}
    </Badge>
  </div>

  <div>
    <p className="mb-1 text-xs text-zinc-500">
      Required Units
    </p>

    <div className="flex flex-wrap gap-2">
      {emergency.required_units.map((unit) => (
        <Badge
          key={unit}
          variant="secondary"
        >
          {unit}
        </Badge>
      ))}
    </div>
  </div>

  <div>
    <p className="mb-1 text-xs text-zinc-500">
      Possible Conditions
    </p>

    <div className="flex flex-wrap gap-2">
      {emergency.possible_conditions.map((condition) => (
        <Badge
          key={condition}
          variant="outline"
        >
          {condition}
        </Badge>
      ))}
    </div>
  </div>

  <div className="grid grid-cols-2 gap-3">

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">
        Hospital
      </p>

      <p className="font-medium">
        {emergency.recommended_hospital_type}
      </p>
    </div>

    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="text-xs text-zinc-500">
        Estimated Response
      </p>

      <p className="font-medium">
        {emergency.estimated_response_minutes} min
      </p>
    </div>

  </div>

  {analyze.data?.ai_result && (
    <div className="rounded-lg border border-zinc-800 p-3">
      <p className="mb-2 text-xs text-zinc-500">
        AI Explanation
      </p>

      <p className="text-sm text-zinc-300">
        {(analyze.data.ai_result as AIAnalysis).explanation}
      </p>
    </div>
  )}

</CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Dispatch</CardTitle>
              <Button size="sm" onClick={() => setAssignOpen(true)}>Assign Unit</Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {(dispatch as DispatchRecommendation | undefined)?.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.responder.id} className="rounded-lg border border-zinc-800 p-2 text-sm">
                  <p className="font-medium">{rec.responder.username}</p>
                  <p className="text-xs text-zinc-500">{rec.responder.type} · {rec.distance_km} km</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Hospitals</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(hospitals as HospitalRecommendation | undefined)?.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.hospital.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-2 text-sm">
                  <div>
                    <p className="font-medium">{rec.hospital.name}</p>
                    <p className="text-xs text-zinc-500">{rec.distance_km} km · ETA {rec.eta_minutes}m · {rec.hospital.available_beds} beds</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => notifyHospital.mutate({ hospitalId: rec.hospital.id, eta: rec.eta_minutes })}
                  >
                    Notify
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AssignResponderModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        emergencyId={emergencyId}
        dispatch={dispatch ?? null}
      />
    </DashboardLayout>
  );
}
