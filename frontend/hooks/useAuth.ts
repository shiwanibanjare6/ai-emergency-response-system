"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { roleDashboardPath } from "@/lib/utils";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clear } = useAuthStore();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => {
        authService.logout();
        clear();
      });
  }, [setUser, setLoading, clear]);

  return { user, isLoading, setUser, clear };
}

export function useRequireAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      router.replace(roleDashboardPath(auth.user.role));
    }
  }, [auth.user, auth.isLoading, allowedRoles, router]);

  return auth;
}
