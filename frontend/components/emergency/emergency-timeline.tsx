"use client";

import { motion } from "framer-motion";
import { formatDate, formatStatus } from "@/lib/utils";
import type { EmergencyStatusHistory } from "@/types";
import { severityDot } from "@/lib/utils";

export function EmergencyTimeline({ history }: { history: EmergencyStatusHistory[] }) {
  if (!history.length) {
    return <p className="text-sm text-zinc-500">No timeline events yet.</p>;
  }

  return (
    <div className="relative space-y-4 pl-6">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-zinc-700" />
      {history.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="relative"
        >
          <div className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full ${severityDot("medium")}`} />
          <div className="glass-panel rounded-lg p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-zinc-200">{formatStatus(item.status)}</p>
              <p className="text-xs text-zinc-500">{formatDate(item.timestamp)}</p>
            </div>
            {item.note && <p className="mt-1 text-xs text-zinc-400">{item.note}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
