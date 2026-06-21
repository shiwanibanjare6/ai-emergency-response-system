"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBackLink, getNavItems, isMainNavPage } from "@/lib/navigation";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";

export function PageNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role, pathname);
  const back = getBackLink(pathname, role);
  const onMain = isMainNavPage(pathname, items);

  return (
    <div className="mb-5 space-y-3">
      {back && (
        <Button variant="ghost" size="sm" className="gap-2 px-0 text-zinc-400 hover:text-zinc-100" asChild>
          <Link href={back.href}>
            <ArrowLeft className="h-4 w-4" />
            {back.label}
          </Link>
        </Button>
      )}

      <nav
        aria-label="Section navigation"
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
      >
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== items[0].href && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-red-500/40 bg-red-500/15 text-red-300"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </nav>

      {!onMain && !back && (
        <p className="text-xs text-zinc-600">Use the links above to switch sections.</p>
      )}
    </div>
  );
}
