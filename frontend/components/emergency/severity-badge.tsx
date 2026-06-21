import type { EmergencySeverity } from "@/types";
import { Badge } from "@/components/ui/badge";

export function SeverityBadge({ severity }: { severity: EmergencySeverity }) {
  const variant = severity === "critical" ? "critical" : severity === "medium" ? "medium" : "low";
  return <Badge variant={variant}>{severity}</Badge>;
}
