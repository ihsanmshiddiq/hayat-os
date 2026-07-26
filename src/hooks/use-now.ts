"use client";

import { useSyncExternalStore, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* useNow — a live clock that updates every second, SSR-safe.         */
/* Implemented with useSyncExternalStore to avoid setState-in-effect.  */
/* ------------------------------------------------------------------ */

let cachedNow: Date | null = null;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  cachedNow = new Date();
  listeners.forEach((l) => l());
}

function subscribeNow(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) {
    cachedNow = new Date();
    intervalId = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
      cachedNow = null;
    }
  };
}

function getNowSnapshot(): Date | null {
  return cachedNow;
}

function getNowServerSnapshot(): Date | null {
  return null;
}

export function useNow(_intervalMs = 1000): Date | null {
  return useSyncExternalStore(subscribeNow, getNowSnapshot, getNowServerSnapshot);
}

/* ------------------------------------------------------------------ */
/* useDebounce                                                        */
/* ------------------------------------------------------------------ */

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ */
/* useMounted — true only on client, false during SSR.                */
/* ------------------------------------------------------------------ */

const subscribeMounted = () => () => {};
export function useMounted(): boolean {
  return useSyncExternalStore(subscribeMounted, () => true, () => false);
}
