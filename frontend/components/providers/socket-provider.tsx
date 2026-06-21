"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket, reconnectSocket } from "@/services/socket.service";
import { tokenStorage } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { AnalyticsSnapshot, Emergency, Notification, Responder } from "@/types";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  analytics: AnalyticsSnapshot | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  analytics: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const queryClient = useQueryClient();

  const setupListeners = useCallback(
    (s: Socket) => {
      s.on("connect", () => setConnected(true));
      s.on("disconnect", () => setConnected(false));
      s.on("connect_error", () => setConnected(false));

      s.on("notification", (payload: Notification) => {
        queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
          const exists = old?.some((n) => n.id === payload.id);
          if (exists) return old;
          return [payload, ...(old ?? [])];
        });
        toast.info(payload.message, { duration: 6000 });
      });

      s.on("responder:update", (payload: Responder) => {
        queryClient.setQueryData<Responder[]>(["responders"], (old) => {
          if (!old) return [payload];
          const idx = old.findIndex((r) => r.id === payload.id);
          if (idx === -1) return [...old, payload];
          const next = [...old];
          next[idx] = payload;
          return next;
        });
        queryClient.setQueryData<Responder>(["responder-me"], (old) =>
          old?.id === payload.id ? payload : old
        );
      });

      s.on("emergency:update", (payload: Emergency) => {
        queryClient.setQueryData<Emergency[]>(["emergencies"], (old) => {
          if (!old) return [payload];
          const idx = old.findIndex((e) => e.id === payload.id);
          if (idx === -1) return [payload, ...old];
          const next = [...old];
          next[idx] = payload;
          return next;
        });
        queryClient.setQueryData(["emergencies", payload.id], payload);
        queryClient.invalidateQueries({ queryKey: ["emergencies", "mine"] });
        queryClient.invalidateQueries({ queryKey: ["emergencies", "assigned"] });
      });

      s.on("analytics:update", (payload: AnalyticsSnapshot) => {
        setAnalytics(payload);
        queryClient.setQueryData(["analytics"], payload);
      });

      s.on("operations:refresh", () => {
        queryClient.invalidateQueries({ queryKey: ["emergencies"] });
        queryClient.invalidateQueries({ queryKey: ["responders"] });
        queryClient.invalidateQueries({ queryKey: ["hospitals"] });
        queryClient.invalidateQueries({ queryKey: ["hospital-incoming"] });
      });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      return;
    }

    const s = connectSocket();
    setSocket(s);
    setupListeners(s);

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("connect_error");
      s.off("notification");
      s.off("responder:update");
      s.off("emergency:update");
      s.off("analytics:update");
      s.off("operations:refresh");
    };
  }, [setupListeners]);

  // Reconnect when token refreshes
  useEffect(() => {
    const interval = setInterval(() => {
      if (authService.isAuthenticated() && tokenStorage.getAccess() && !connected) {
        const s = reconnectSocket();
        setSocket(s);
        setupListeners(s);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [connected, setupListeners]);

  return (
    <SocketContext.Provider value={{ socket, connected, analytics }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
