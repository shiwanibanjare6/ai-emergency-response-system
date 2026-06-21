import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  History,
  LayoutDashboard,
  MapPin,
  Radio,
  Shield,
  Siren,
  Stethoscope,
  Users,
} from "lucide-react";
import type { UserRole } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel?: string;
}

export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  citizen: [
    { href: "/citizen", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
    { href: "/citizen/report", label: "Report Emergency", shortLabel: "Report", icon: Siren },
    { href: "/citizen/history", label: "History", shortLabel: "History", icon: History },
  ],
  dispatcher: [
    { href: "/dispatcher", label: "Command Center", shortLabel: "Command", icon: Radio },
    { href: "/dispatcher/map", label: "Live Map", shortLabel: "Map", icon: MapPin },
    { href: "/dispatcher/analytics", label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
    { href: "/admin", label: "Admin", shortLabel: "Admin", icon: Shield },
  ],
  responder: [
    { href: "/responder", label: "Assignments", shortLabel: "Home", icon: Activity },
    { href: "/responder/map", label: "Navigation", shortLabel: "Map", icon: MapPin },
  ],
  hospital: [
    { href: "/hospital", label: "Intake Queue", shortLabel: "Queue", icon: Stethoscope },
    { href: "/hospital/capacity", label: "Bed Capacity", shortLabel: "Beds", icon: Building2 },
  ],
  admin: [
    { href: "/admin", label: "Overview", shortLabel: "Overview", icon: Shield },
    { href: "/admin/users", label: "Users", shortLabel: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", shortLabel: "Stats", icon: Activity },
  ],
};

/** Role used for nav when viewing admin pages as a dispatcher. */
export function resolveNavRole(role: UserRole, pathname: string): UserRole {
  if (pathname.startsWith("/admin")) return "admin";
  return role;
}

export function getNavItems(role: UserRole, pathname: string): NavItem[] {
  const navRole = resolveNavRole(role, pathname);
  return ROLE_NAV[navRole] ?? ROLE_NAV.citizen;
}

export function getRoleHome(role: UserRole, pathname: string): string {
  return getNavItems(role, pathname)[0]?.href ?? "/";
}

export function isMainNavPage(pathname: string, items: NavItem[]): boolean {
  return items.some((item) => pathname === item.href);
}

export function getBackLink(pathname: string, role: UserRole): { href: string; label: string } | null {
  const items = getNavItems(role, pathname);
  const home = getRoleHome(role, pathname);

  if (pathname === home) return null;

  if (/\/emergency\/\d+$/.test(pathname)) {
    return { href: home, label: `Back to ${items[0].label}` };
  }

  if (!isMainNavPage(pathname, items) && pathname.startsWith(`/${role}`)) {
    return { href: home, label: `Back to ${items[0].label}` };
  }

  // Sub-section main pages (e.g. /responder/map) — back to role home
  const onSecondaryMain = items.slice(1).some((item) => pathname === item.href);
  if (onSecondaryMain) {
    return { href: home, label: `Back to ${items[0].label}` };
  }

  return null;
}
