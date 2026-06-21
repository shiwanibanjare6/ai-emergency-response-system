"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import type { UserRole } from "@/types";

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role, pathname);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950/50 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-900/40">
          <Siren className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-zinc-100">ERS COMMAND</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Operations Center</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (pathname.startsWith(`${item.href}/`) && item.href !== items[0].href) ||
            (/\/emergency\/\d+$/.test(pathname) && item.href === items[0].href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="relative block">
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg border border-red-500/30 bg-red-600/15"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "text-red-300" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
