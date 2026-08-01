"use client";

const STORAGE_KEY = "hayat:offline-queue";

export interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  body: string;
  createdAt: number;
}

function readQueue(): OfflineRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Storage may be unavailable or full; the online request still works.
  }
}

export function enqueueOfflineRequest(request: Omit<OfflineRequest, "id" | "createdAt">) {
  const queue = readQueue();
  queue.push({ ...request, id: crypto.randomUUID(), createdAt: Date.now() });
  writeQueue(queue);
}

export async function flushOfflineQueue(accessToken?: string | null) {
  if (typeof window === "undefined" || !navigator.onLine) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;
  const remaining: OfflineRequest[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const response = await fetch(item.url, { method: item.method, headers, body: item.body });
      if (response.ok) sent += 1;
      else remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  return sent;
}
