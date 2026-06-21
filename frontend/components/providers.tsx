"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { SocketProvider } from "@/components/providers/socket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5000, retry: 1, refetchOnWindowFocus: true },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <SocketProvider>
        {children}
        <Toaster theme="dark" position="top-right" richColors closeButton />
      </SocketProvider>
    </QueryClientProvider>
  );
}
