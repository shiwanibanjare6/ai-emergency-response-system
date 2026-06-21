import api from "@/services/api";
import type { AIAnalysis, DispatchRecommendation, Emergency, HospitalRecommendation } from "@/types";

export const aiService = {
  async analyze(id: number): Promise<{ emergency: Emergency; ai_result: AIAnalysis }> {
    const { data } = await api.post(`/ai/emergencies/${id}/analyze/`);
    return data;
  },

  async suggestDispatch(id: number): Promise<DispatchRecommendation> {
    const { data } = await api.get<DispatchRecommendation>(`/ai/emergencies/${id}/suggest-dispatch/`);
    return data;
  },

  async suggestHospital(id: number): Promise<HospitalRecommendation> {
    const { data } = await api.get<HospitalRecommendation>(`/ai/emergencies/${id}/suggest-hospital/`);
    return data;
  },
};
