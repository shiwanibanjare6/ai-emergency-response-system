"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageNav } from "@/components/layout/page-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { useRequireAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/types";

export function DashboardLayout({
  children,
  title,
  subtitle,
  roles,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  roles?: UserRole[];
}) {
  const { user, isLoading } = useRequireAuth(roles);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const role = user.role as UserRole;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <MobileSidebar role={role} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} subtitle={subtitle} role={role} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6 lg:pb-6 grid-bg">
          <PageNav role={role} />
          {children}
        </main>
        <MobileBottomNav role={role} />
      </div>
    </div>
  );
}
