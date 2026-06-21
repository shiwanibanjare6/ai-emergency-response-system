"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emergencyService } from "@/services/emergency.service";
import { USE_MOCK } from "@/lib/constants";
import { mockEmergencies } from "@/lib/mock-data";
import { useSocket } from "@/components/providers/socket-provider";

export function useEmergencies() {
  const { connected } = useSocket();
  return useQuery({
    queryKey: ["emergencies"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockEmergencies) : emergencyService.list()),
    refetchInterval: connected ? false : 10000,
  });
}

export function useMyEmergencies() {
  const { connected } = useSocket();
  return useQuery({
    queryKey: ["emergencies", "mine"],
    queryFn: () => emergencyService.mine(),
    refetchInterval: connected ? false : 10000,
  });
}

export function useAssignedEmergencies() {
  const { connected } = useSocket();
  return useQuery({
    queryKey: ["emergencies", "assigned"],
    queryFn: () => emergencyService.assigned(),
    refetchInterval: connected ? false : 8000,
  });
}

export function useEmergency(id: number) {
  return useQuery({
    queryKey: ["emergencies", id],
    queryFn: () => emergencyService.get(id),
    enabled: id > 0,
  });
}

export function useReportEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: emergencyService.report,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emergencies"] });
    },
  });
}

export function useAssignEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, responderId }: { id: number; responderId: number }) =>
      emergencyService.assign(id, responderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergencies"] }),
  });
}

export function useUpdateEmergencyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: string; note?: string }) =>
      emergencyService.updateStatus(id, status, note),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["emergencies"] });
      qc.invalidateQueries({ queryKey: ["emergencies", vars.id] });
    },
  });
}
