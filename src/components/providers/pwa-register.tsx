"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { flushOfflineQueue } from "@/lib/offline-queue";

export function PwaRegister() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    const sync = async () => {
      const { data: { session } } = await createClient().auth.getSession();
      const sent = await flushOfflineQueue(session?.access_token);
      if (sent) await queryClient.invalidateQueries();
    };

    void sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [queryClient]);

  return null;
}
