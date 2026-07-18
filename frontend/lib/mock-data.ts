import type { DashboardStats, Emergency, Hospital, Notification, Responder, User } from "@/types";

export const mockUser: User = {
  id: 1,
  username: "dispatcher1",
  email: "dispatcher1@example.com",
  first_name: "Shiwani",
  last_name: "Dispatcher",
  phone: "+91XXXXXXXXXX",
  role: "dispatcher",
};

export const mockEmergencies: Emergency[] = [
  {
    id: 101,
    citizen: 1,
    citizen_name: "citizen1",
    description:
      "Road accident involving two vehicles near IIIT Naya Raipur with one unconscious victim.",
    image: null,
    voice_file: null,
    lat: 21.1289,
    lng: 81.7650,
    severity: "critical",
    status: "reported",
    responder: null,
    created_at: new Date().toISOString(),
    status_history: [
      {
        id: 1,
        status: "reported",
        timestamp: new Date().toISOString(),
        note: "AI Analysis: Critical road accident detected.",
      },
    ],
  },
  {
    id: 102,
    citizen: 2,
    citizen_name: "citizen2",
    description:
      "Fire reported near Magneto Mall parking area.",
    image: null,
    voice_file: null,
    lat: 21.2379,
    lng: 81.6805,
    severity: "medium",
    status: "assigned",
    responder: 2,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    status_history: [],
  },
];

export const mockResponders: Responder[] = [
  {
    id: 1,
    user: 3,
    username: "Ambulance Unit-1",
    type: "ambulance",
    status: "available",
    lat: 21.2579,
    lng: 81.5785,
  },
  {
    id: 2,
    user: 4,
    username: "Police Unit-1",
    type: "police",
    status: "busy",
    lat: 21.2446,
    lng: 81.6352,
  },
  {
    id: 3,
    user: 5,
    username: "Fire Unit-1",
    type: "fire",
    status: "available",
    lat: 21.2010,
    lng: 81.7415,
  },
];

export const mockHospitals: Hospital[] = [
  {
    id: 1,
    name: "AIIMS Raipur",
    lat: 21.2579,
    lng: 81.5785,
    total_beds: 500,
    available_beds: 145,
  },
  {
    id: 2,
    name: "Dr. B. R. Ambedkar Memorial Hospital",
    lat: 21.2446,
    lng: 81.6352,
    total_beds: 700,
    available_beds: 83,
  },
  {
    id: 3,
    name: "Ramkrishna Care Hospital",
    lat: 21.2458,
    lng: 81.6413,
    total_beds: 300,
    available_beds: 54,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user: 1,
    message:
      "Critical emergency reported near IIIT Naya Raipur. AI recommends immediate ambulance dispatch.",
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
  {
    id: 2,
    username: "citizen1",
    email: "citizen@example.com",
    first_name: "Rahul",
    last_name: "Verma",
    phone: "",
    role: "citizen",
  },
  {
    id: 3,
    username: "Ambulance Unit-1",
    email: "ambulance@example.com",
    first_name: "Ambulance",
    last_name: "Team",
    phone: "",
    role: "responder",
  },
];