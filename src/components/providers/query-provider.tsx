"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
            networkMode: "offlineFirst",
          },
        },
      });
      return queryClient;
    },
  );

  React.useEffect(() => {
    let unsubscribe: () => void = () => undefined;
    let cancelled = false;
    void createClient().auth.getUser().then(({ data: { user } }) => {
      if (cancelled || typeof window === "undefined") return;
      // Keep offline data isolated per Supabase user on shared devices.
      const storageKey = `hayat:query-cache:${user?.id ?? "anonymous"}`;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Array<{ queryKey: unknown[]; data: unknown }>;
        for (const entry of saved) {
          if (Array.isArray(entry.queryKey) && entry.data !== undefined) {
            client.setQueryData(entry.queryKey, entry.data);
          }
        }
      } catch {
        // Ignore malformed or unavailable local cache.
      }
      unsubscribe = client.getQueryCache().subscribe(() => {
        try {
          const entries = client.getQueryCache().getAll()
            .filter((query) => query.state.status === "success" && query.state.data !== undefined)
            .map((query) => ({ queryKey: query.queryKey, data: query.state.data }));
          localStorage.setItem(storageKey, JSON.stringify(entries));
        } catch {
          // Keep the in-memory cache if browser storage is unavailable.
        }
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
