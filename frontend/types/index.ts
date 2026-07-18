export type UserRole = "citizen" | "dispatcher" | "responder" | "hospital" | "admin";

export type EmergencySeverity = "low" | "medium" | "critical";

export type EmergencyStatus =
  | "reported"
  | "assigned"
  | "on_the_way"
  | "arrived_at_scene"
  | "patient_picked_up"
  | "at_hospital"
  | "resolved"
  | "cancelled";

export type ResponderType = "ambulance" | "police" | "fire";
export type ResponderStatus = "available" | "busy" | "offline";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  is_staff?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface EmergencyStatusHistory {
  id: number;
  status: EmergencyStatus;
  timestamp: string;
  note: string;
}

export interface Emergency {
  id: number;
  citizen: number;
  citizen_name?: string;
  description: string;
  image: string | null;
  voice_file: string | null;
  lat: number;
  lng: number;
  severity: EmergencySeverity;
  severity_score: number;
  confidence: number;
  priority: "P1" | "P2" | "P3";

  recommended_responder_type: ResponderType;

  possible_conditions: string[];

  required_units: string[];

  recommended_hospital_type: string;

  estimated_response_minutes: number;
  status: EmergencyStatus;
  responder: number | null;
  created_at: string;
  status_history: EmergencyStatusHistory[];
}

export interface Responder {
  id: number;
  user: number;
  username?: string;
  type: ResponderType;
  status: ResponderStatus;
  lat: number;
  lng: number;
}

export interface Hospital {
  id: number;
  name: string;
  lat: number;
  lng: number;
  total_beds: number;
  available_beds: number;
}

export interface HospitalPatient {
  id: number;
  hospital: number;
  emergency: number;
  emergency_details?: Emergency;
  eta_minutes: number;
  severity: EmergencySeverity;
  arrived: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  user: number;
  message: string;
  is_read: boolean;
  emergency: number | null;
  created_at: string;
}

 
export interface AIAnalysis {
  severity: EmergencySeverity;
  severity_score: number;
  confidence: number;
  priority: "P1" | "P2" | "P3";

  responder_type: ResponderType;

  required_units: string[];
  possible_conditions: string[];

  recommended_hospital_type: string;
  estimated_response_minutes: number;

  explanation: string;
  transcribed_text?: string;
}

export interface DispatchRecommendation {
  recommended_type: ResponderType;
  recommendations: {
    responder: Responder;
    distance_km: number;
    is_recommended_type: boolean;
  }[];
}

export interface HospitalRecommendation {
  recommendations: {
    hospital: Hospital;
    distance_km: number;
    eta_minutes: number;
  }[];
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "emergency" | "responder" | "hospital";
  severity?: EmergencySeverity;
  label: string;
  status?: string;
}

export interface DashboardStats {
  activeEmergencies: number;
  criticalIncidents: number;
  availableResponders: number;
  hospitalCapacity: number;
}

export interface AnalyticsSnapshot {
  active_emergencies: number;
  critical_incidents: number;
  available_responders: number;
  hospital_capacity_pct: number;
  severity_breakdown: { critical: number; medium: number; low: number };
  responder_breakdown: { available: number; busy: number; offline: number };
  total_hospitals: number;
  timestamp: string;
}
