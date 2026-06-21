"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, History, Siren } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmergencyFeed } from "@/components/dashboard/emergency-feed";
import { useMyEmergencies } from "@/hooks/useEmergencies";
import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenDashboard() {
  const { data: emergencies = [], isLoading } = useMyEmergencies();
  const active = emergencies.filter((e) => !["resolved", "cancelled"].includes(e.status));

  return (
    <DashboardLayout title="Citizen Portal" subtitle="Report and track emergencies" roles={["citizen"]}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-3">
          <Card className="border-red-500/20 bg-gradient-to-br from-red-950/40 to-zinc-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-300">
                <Siren className="h-5 w-5" /> Emergency?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-zinc-400">Report an incident with location, photos, and voice notes.</p>
              <Button asChild className="w-full">
                <Link href="/citizen/report">Report Emergency</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" /> Active Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-100">{active.length}</p>
              <p className="text-xs text-zinc-500">Awaiting resolution</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-sky-400" /> Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-100">{emergencies.length}</p>
              <Button variant="ghost" size="sm" className="mt-2" asChild>
                <Link href="/citizen/history">View history</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <EmergencyFeed emergencies={emergencies.slice(0, 5)} detailPath="/citizen/emergency" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
