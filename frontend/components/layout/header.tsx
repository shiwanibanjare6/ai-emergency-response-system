"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, User, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { getBackLink, getRoleHome } from "@/lib/navigation";
import type { UserRole } from "@/types";

export function Header({
  title,
  subtitle,
  role,
  onMenuClick,
}: {
  title: string;
  subtitle?: string;
  role: UserRole;
  onMenuClick: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { connected } = useSocket();
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.is_read).length;
  const back = getBackLink(pathname, role);
  const home = getRoleHome(role, pathname);

  const logout = () => {
    authService.logout();
    useAuthStore.getState().clear();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 px-4 backdrop-blur-xl md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onMenuClick} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
          {back && (
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" asChild aria-label={back.label}>
              <Link href={back.href}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="hidden shrink-0 gap-1 text-zinc-400 lg:inline-flex" asChild>
            <Link href={home}>
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-zinc-100">{title}</h1>
            {subtitle && <p className="truncate text-xs text-zinc-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConnectionStatus connected={connected} label="Live" />
          <Button variant="ghost" size="icon" className="relative" onClick={() => setDrawerOpen(true)} aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
          <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 sm:flex">
            <User className="h-4 w-4 text-zinc-400" />
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-200">{user?.username}</p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <NotificationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
