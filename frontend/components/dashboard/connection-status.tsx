"use client";

import { Activity, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConnectionStatus({ connected, label = "Live" }: { connected: boolean; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        connected
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
      )}
    >
      {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {connected ? `${label} connected` : "Offline mode"}
    </span>
  );
}

export function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-400">
      <Activity className="h-3 w-3 animate-pulse" />
      LIVE
    </span>
  );
}
