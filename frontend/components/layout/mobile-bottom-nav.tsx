"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/navigation";
import type { UserRole } from "@/types";

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role, pathname);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl lg:hidden"
    >
      <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (/\/emergency\/\d+$/.test(pathname) && item.href === getNavItems(role, pathname)[0].href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-red-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-red-400")} />
              <span className="truncate">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
