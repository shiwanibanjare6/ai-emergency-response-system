"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Ambulance, Building2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const icons = [Radio, AlertTriangle, Ambulance, Building2];
const colors = ["text-sky-400", "text-red-400", "text-emerald-400", "text-amber-400"];

export function StatCard({
  label,
  value,
  index = 0,
  trend,
}: {
  label: string;
  value: string | number;
  index?: number;
  trend?: string;
}) {
  const Icon = icons[index % icons.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-panel rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-zinc-100">{value}</p>
          {trend && <p className="mt-1 text-xs text-zinc-500">{trend}</p>}
        </div>
        <div className={cn("rounded-lg bg-zinc-800/80 p-2.5", colors[index % colors.length])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Active Emergencies" value={stats.activeEmergencies} index={0} trend="Live feed" />
      <StatCard label="Critical Incidents" value={stats.criticalIncidents} index={1} trend="Requires dispatch" />
      <StatCard label="Available Units" value={stats.availableResponders} index={2} trend="Ready to deploy" />
      <StatCard label="Hospital Capacity" value={`${stats.hospitalCapacity}%`} index={3} trend="System-wide avg" />
    </div>
  );
}
