import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EmergencySeverity, EmergencyStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(severity: EmergencySeverity) {
  switch (severity) {
    case "critical":
      return "text-red-400 bg-red-500/15 border-red-500/40";
    case "medium":
      return "text-amber-400 bg-amber-500/15 border-amber-500/40";
    default:
      return "text-emerald-400 bg-emerald-500/15 border-emerald-500/40";
  }
}

export function severityDot(severity: EmergencySeverity) {
  switch (severity) {
    case "critical":
      return "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]";
    case "medium":
      return "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]";
    default:
      return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]";
  }
}

export function statusColor(status: EmergencyStatus) {
  if (status === "resolved") return "text-emerald-400";
  if (status === "cancelled") return "text-zinc-400";
  if (["assigned", "on_the_way"].includes(status)) return "text-sky-400";
  return "text-zinc-300";
}

export function formatStatus(status: EmergencyStatus) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function roleDashboardPath(role: string) {
  switch (role) {
    case "citizen":
      return "/citizen";
    case "dispatcher":
      return "/dispatcher";
    case "responder":
      return "/responder";
    case "hospital":
      return "/hospital";
    case "admin":
      return "/admin";
    default:
      return "/login";
  }
}
