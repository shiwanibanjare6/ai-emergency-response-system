import type { EmergencyStatus } from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const EMERGENCY_STATUSES: EmergencyStatus[] = [
  "reported",
  "assigned",
  "on_the_way",
  "arrived_at_scene",
  "patient_picked_up",
  "at_hospital",
  "resolved",
  "cancelled",
];

export const RESPONDER_STATUS_OPTIONS = [
  { value: "on_the_way", label: "En Route" },
  { value: "arrived_at_scene", label: "Arrived at Scene" },
  { value: "patient_picked_up", label: "Patient Picked Up" },
  { value: "at_hospital", label: "At Hospital" },
  { value: "resolved", label: "Resolved" },
];

export const DEFAULT_MAP_CENTER = { lat: 40.7128, lng: -74.006 };
