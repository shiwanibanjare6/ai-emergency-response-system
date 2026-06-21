import type { DashboardStats, Emergency, Hospital, Notification, Responder, User } from "@/types";

export const mockUser: User = {
  id: 1,
  username: "dispatcher1",
  email: "dispatcher1@example.com",
  first_name: "Sarah",
  last_name: "Smith",
  phone: "+1234567891",
  role: "dispatcher",
};

export const mockEmergencies: Emergency[] = [
  {
    id: 101,
    citizen: 1,
    citizen_name: "citizen1",
    description: "Multi-vehicle collision with fire and unconscious victim on Main St.",
    image: null,
    voice_file: null,
    lat: 40.713,
    lng: -74.007,
    severity: "critical",
    status: "reported",
    responder: null,
    created_at: new Date().toISOString(),
    status_history: [
      { id: 1, status: "reported", timestamp: new Date().toISOString(), note: "Auto-analyzed: critical" },
    ],
  },
  {
    id: 102,
    citizen: 2,
    citizen_name: "citizen2",
    description: "Suspicious activity near downtown parking garage.",
    image: null,
    voice_file: null,
    lat: 40.718,
    lng: -74.002,
    severity: "medium",
    status: "assigned",
    responder: 2,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status_history: [],
  },
];

export const mockResponders: Responder[] = [
  { id: 1, user: 3, username: "responder_unit1", type: "ambulance", status: "available", lat: 40.7128, lng: -74.006 },
  { id: 2, user: 4, username: "responder_unit2", type: "police", status: "busy", lat: 40.725, lng: -74.01 },
  { id: 3, user: 5, username: "responder_unit3", type: "fire", status: "available", lat: 40.718, lng: -74.001 },
];

export const mockHospitals: Hospital[] = [
  { id: 1, name: "City General Hospital", lat: 40.715, lng: -74.009, total_beds: 100, available_beds: 25 },
  { id: 2, name: "St. Jude Medical Center", lat: 40.73, lng: -74.002, total_beds: 150, available_beds: 5 },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user: 1,
    message: "New emergency #101 reported by citizen citizen1.",
    is_read: false,
    emergency: 101,
    created_at: new Date().toISOString(),
  },
];

export const mockStats: DashboardStats = {
  activeEmergencies: 12,
  criticalIncidents: 3,
  availableResponders: 8,
  hospitalCapacity: 68,
};

export const mockAdminUsers: User[] = [
  mockUser,
  { id: 2, username: "citizen1", email: "c@e.com", first_name: "John", last_name: "Doe", phone: "", role: "citizen" },
  { id: 3, username: "responder_unit1", email: "r@e.com", first_name: "Unit", last_name: "1", phone: "", role: "responder" },
];
