import api from "@/services/api";
import type { AnalyticsSnapshot } from "@/types";

export const analyticsService = {
  async snapshot(): Promise<AnalyticsSnapshot> {
    const { data } = await api.get<AnalyticsSnapshot>("/analytics/snapshot/");
    return data;
  },
};
