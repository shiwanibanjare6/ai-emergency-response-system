"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/emergency/severity-badge";
import { formatDate, formatStatus, severityDot } from "@/lib/utils";
import type { Emergency } from "@/types";

export function EmergencyFeed({
  emergencies,
  detailPath = "/dispatcher/emergency",
}: {
  emergencies: Emergency[];
  detailPath?: string;
}) {
  if (!emergencies.length) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-sm text-zinc-500">
        No active emergencies in the feed.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {emergencies.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={`${detailPath}/${e.id}`}
            className="glass-panel group flex items-start gap-4 rounded-xl p-4 transition hover:border-red-500/30"
          >
            <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${severityDot(e.severity)} ${e.severity === "critical" ? "pulse-critical" : ""}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-100">#{e.id}</span>
                <SeverityBadge severity={e.severity} />
                <span className="text-xs text-zinc-500">{formatStatus(e.status)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{e.description}</p>
              <p className="mt-2 text-xs text-zinc-600">{formatDate(e.created_at)} · {e.citizen_name ?? `Citizen #${e.citizen}`}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:text-red-400" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
