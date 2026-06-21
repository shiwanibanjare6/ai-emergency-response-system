"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Emergency } from "@/types";

const SEVERITY_COLORS = { critical: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export function SeverityChart({ emergencies }: { emergencies: Emergency[] }) {
  const data = [
    { name: "Critical", value: emergencies.filter((e) => e.severity === "critical").length, fill: SEVERITY_COLORS.critical },
    { name: "Medium", value: emergencies.filter((e) => e.severity === "medium").length, fill: SEVERITY_COLORS.medium },
    { name: "Low", value: emergencies.filter((e) => e.severity === "low").length, fill: SEVERITY_COLORS.low },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return <div className="flex h-48 items-center justify-center text-sm text-zinc-500">No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ResponseTimeChart() {
  const data = [
    { hour: "08", avg: 4.2 },
    { hour: "10", avg: 3.8 },
    { hour: "12", avg: 5.1 },
    { hour: "14", avg: 4.5 },
    { hour: "16", avg: 3.2 },
    { hour: "18", avg: 6.0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="hour" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} unit="m" />
        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} />
        <Bar dataKey="avg" fill="#ef4444" radius={[4, 4, 0, 0]} name="Avg Response (min)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HospitalCapacityChart({ hospitals }: { hospitals: { name: string; available_beds: number; total_beds: number }[] }) {
  const data = hospitals.map((h) => ({
    name: h.name.split(" ")[0],
    available: h.available_beds,
    occupied: h.total_beds - h.available_beds,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
        <YAxis stroke="#71717a" fontSize={12} />
        <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }} />
        <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" radius={[0, 0, 0, 0]} />
        <Bar dataKey="occupied" stackId="a" fill="#52525b" name="Occupied" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
