"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewKey =
  | "dashboard"
  | "kalender"
  | "jurnal"
  | "kebiasaan"
  | "khatma"
  | "hifz"
  | "shalat"
  | "doa"
  | "catatan"
  | "tujuan"
  | "fokus"
  | "keuangan"
  | "siklus"
  | "pencapaian"
  | "analitik"
  | "pengaturan";

interface AppState {
  activeView: ViewKey;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandOpen: boolean;
  pixelCompanionEnabled: boolean;
  setActiveView: (v: ViewKey) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
  setCommandOpen: (v: boolean) => void;
  togglePixelCompanion: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: "dashboard",
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      commandOpen: false,
      pixelCompanionEnabled: true,
      setActiveView: (v) => set({ activeView: v, mobileSidebarOpen: false }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      togglePixelCompanion: () => set((s) => ({ pixelCompanionEnabled: !s.pixelCompanionEnabled })),
    }),
    {
      name: "hayat-app-store",
      partialize: (s) => ({
        activeView: s.activeView,
        sidebarCollapsed: s.sidebarCollapsed,
        pixelCompanionEnabled: s.pixelCompanionEnabled,
      }),
    }
  )
);
