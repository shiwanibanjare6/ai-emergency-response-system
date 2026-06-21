import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "critical" | "medium" | "low" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        variant === "critical" && "border-red-500/40 bg-red-500/15 text-red-400",
        variant === "medium" && "border-amber-500/40 bg-amber-500/15 text-amber-400",
        variant === "low" && "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
        variant === "outline" && "border-zinc-600 text-zinc-300",
        variant === "default" && "border-zinc-700 bg-zinc-800 text-zinc-200",
        className
      )}
      {...props}
    />
  );
}
