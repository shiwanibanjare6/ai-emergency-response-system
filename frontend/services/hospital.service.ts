import api from "@/services/api";
import type { Hospital, HospitalPatient } from "@/types";

export const hospitalService = {
  async list(): Promise<Hospital[]> {
    const { data } = await api.get<Hospital[]>("/hospitals/");
    return data;
  },

  async incoming(): Promise<HospitalPatient[]> {
    const { data } = await api.get<HospitalPatient[]>("/hospitals/incoming/");
    return data;
  },

  async notify(hospitalId: number, emergencyId: number, etaMinutes: number) {
    const { data } = await api.post("/hospitals/notify/", {
      hospital_id: hospitalId,
      emergency_id: emergencyId,
      eta_minutes: etaMinutes,
    });
    return data;
  },
};
