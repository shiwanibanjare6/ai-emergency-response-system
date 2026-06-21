"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { useSocket } from "@/components/providers/socket-provider";

export function useAnalytics() {
  const { analytics: liveAnalytics } = useSocket();

  const query = useQuery({
    queryKey: ["analytics"],
    queryFn: () => analyticsService.snapshot(),
    refetchInterval: liveAnalytics ? false : 15000,
  });

  return {
    ...query,
    data: liveAnalytics ?? query.data,
    isLive: Boolean(liveAnalytics),
  };
}
