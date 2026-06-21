"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityChart, ResponseTimeChart, HospitalCapacityChart } from "@/components/dashboard/charts";
import { mockEmergencies, mockHospitals } from "@/lib/mock-data";

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout title="System Analytics" subtitle="Emergency statistics & performance" roles={["dispatcher"]}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Emergency Statistics</CardTitle></CardHeader>
          <CardContent><SeverityChart emergencies={mockEmergencies} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Response Time Analytics</CardTitle></CardHeader>
          <CardContent><ResponseTimeChart /></CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Hospital Capacity Trends</CardTitle></CardHeader>
          <CardContent><HospitalCapacityChart hospitals={mockHospitals} /></CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
