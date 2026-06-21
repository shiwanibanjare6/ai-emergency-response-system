import api from "@/services/api";
import type { Emergency } from "@/types";

export interface ReportEmergencyPayload {
  description: string;
  lat: number;
  lng: number;
  image?: File | null;
  voice_file?: File | null;
}

export const emergencyService = {
  async list(): Promise<Emergency[]> {
    const { data } = await api.get<Emergency[]>("/emergencies/");
    return data;
  },

  async mine(): Promise<Emergency[]> {
    const { data } = await api.get<Emergency[]>("/emergencies/mine/");
    return data;
  },

  async assigned(): Promise<Emergency[]> {
    const { data } = await api.get<Emergency[]>("/emergencies/assigned/");
    return data;
  },

  async get(id: number): Promise<Emergency> {
    const { data } = await api.get<Emergency>(`/emergencies/${id}/`);
    return data;
  },

  async report(payload: ReportEmergencyPayload): Promise<Emergency> {
    const form = new FormData();
    form.append("description", payload.description);
    form.append("lat", String(payload.lat));
    form.append("lng", String(payload.lng));
    if (payload.image) form.append("image", payload.image);
    if (payload.voice_file) form.append("voice_file", payload.voice_file);
    const { data } = await api.post<Emergency>("/emergencies/report/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async assign(id: number, responderId: number): Promise<Emergency> {
    const { data } = await api.patch<Emergency>(`/emergencies/${id}/assign/`, {
      responder_id: responderId,
    });
    return data;
  },

  async updateStatus(id: number, status: string, note = ""): Promise<Emergency> {
    const { data } = await api.patch<Emergency>(`/emergencies/${id}/status/`, { status, note });
    return data;
  },
};
