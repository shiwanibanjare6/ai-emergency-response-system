"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmergencyFeed } from "@/components/dashboard/emergency-feed";
import { useMyEmergencies } from "@/hooks/useEmergencies";
import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenHistoryPage() {
  const { data: emergencies = [], isLoading } = useMyEmergencies();

  return (
    <DashboardLayout title="Emergency History" subtitle="All your reported incidents" roles={["citizen"]}>
      <Card>
        <CardHeader>
          <CardTitle>{emergencies.length} Total Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-32 w-full" /> : <EmergencyFeed emergencies={emergencies} detailPath="/citizen/emergency" />}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
