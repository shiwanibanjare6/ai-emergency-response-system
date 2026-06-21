import api from "@/services/api";
import type { Notification } from "@/types";

export const notificationService = {
  async list(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>("/notifications/");
    return data;
  },

  async markRead(id: number): Promise<Notification> {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read/`);
    return data;
  },
};
