"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";

import { useAuth } from "@/hooks/useAuth";
import { roleDashboardPath } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [user, isLoading, router]);

  if (user) return null;

  return (
    <>
      <Hero />
      <Stats />
    </>
  );
}