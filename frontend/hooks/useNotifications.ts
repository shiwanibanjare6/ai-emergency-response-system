"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { USE_MOCK } from "@/lib/constants";
import { mockNotifications } from "@/lib/mock-data";
import { useSocket } from "@/components/providers/socket-provider";

export function useNotifications() {
  const { connected } = useSocket();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => (USE_MOCK ? Promise.resolve(mockNotifications) : notificationService.list()),
    refetchInterval: connected ? false : 8000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
