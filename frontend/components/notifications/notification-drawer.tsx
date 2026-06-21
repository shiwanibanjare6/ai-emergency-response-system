"use client";

import { formatDate } from "@/lib/utils";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCheck } from "lucide-react";

export function NotificationDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Notifications
            <span className="text-xs font-normal text-zinc-500">{notifications.filter((n) => !n.is_read).length} unread</span>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {isLoading && <p className="text-sm text-zinc-500">Loading...</p>}
          {!isLoading && !notifications.length && (
            <p className="py-8 text-center text-sm text-zinc-500">No notifications</p>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-3 ${n.is_read ? "border-zinc-800 bg-zinc-900/40" : "border-red-500/30 bg-red-500/5"}`}
            >
              <p className="text-sm text-zinc-300">{n.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-zinc-600">{formatDate(n.created_at)}</span>
                {!n.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={() => markRead.mutate(n.id)}
                  >
                    <CheckCheck className="h-3 w-3" /> Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
