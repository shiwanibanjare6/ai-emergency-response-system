"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAssignEmergency } from "@/hooks/useEmergencies";
import type { DispatchRecommendation } from "@/types";

export function AssignResponderModal({
  open,
  onOpenChange,
  emergencyId,
  dispatch,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyId: number;
  dispatch: DispatchRecommendation | null;
}) {
  const assign = useAssignEmergency();
  const [selected, setSelected] = useState<number | null>(null);

  const handleAssign = async () => {
    if (!selected) return;
    try {
      await assign.mutateAsync({ id: emergencyId, responderId: selected });
      toast.success("Responder assigned successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to assign responder");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Responder Unit</DialogTitle>
          <DialogDescription>
            Recommended type: <strong className="text-red-400">{dispatch?.recommended_type ?? "—"}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {dispatch?.recommendations.map((rec) => (
            <button
              key={rec.responder.id}
              type="button"
              onClick={() => setSelected(rec.responder.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selected === rec.responder.id
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-200">{rec.responder.username ?? `Unit #${rec.responder.id}`}</span>
                <Badge variant="outline">{rec.responder.type}</Badge>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {rec.distance_km} km away · {rec.responder.status}
                {rec.is_recommended_type && " · AI recommended"}
              </p>
            </button>
          ))}
        </div>
        <Button onClick={handleAssign} disabled={!selected || assign.isPending} className="w-full">
          {assign.isPending ? "Assigning..." : "Confirm Assignment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
