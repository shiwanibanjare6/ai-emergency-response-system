import api from "@/services/api";
import type { Responder } from "@/types";

export const responderService = {
  async list(): Promise<Responder[]> {
    const { data } = await api.get<Responder[]>("/responders/");
    return data;
  },

  async me(): Promise<Responder> {
    const { data } = await api.get<Responder>("/responders/me/");
    return data;
  },

  async updateLocation(id: number, lat: number, lng: number): Promise<Responder> {
    const { data } = await api.patch<Responder>(`/responders/${id}/location/`, { lat, lng });
    return data;
  },
};
