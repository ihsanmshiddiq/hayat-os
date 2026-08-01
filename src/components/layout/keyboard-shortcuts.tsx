"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Keyboard, X } from "lucide-react";
import { useAppStore, type ViewKey } from "@/lib/store";

interface ShortcutGroup {
  label: string;
  items: { keys: string[]; label: string; action?: () => void }[];
}

export function KeyboardShortcutsOverlay() {
  const open = useKeyboardShortcutsOpen();
  const setOpen = useSetKeyboardShortcutsOpen();
  const { setActiveView, setCommandOpen, toggleSidebar } = useAppStore();

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const groups: ShortcutGroup[] = [
    {
      label: "Navigasi",
      items: [
        { keys: ["G", "D"], label: "Dasbor", action: () => setActiveView("dashboard") },
        { keys: ["G", "C"], label: "Kalender", action: () => setActiveView("kalender") },
        { keys: ["G", "J"], label: "Jurnal Harian", action: () => setActiveView("jurnal") },
        { keys: ["G", "H"], label: "Kebiasaan", action: () => setActiveView("kebiasaan") },
        { keys: ["G", "K"], label: "Khatma", action: () => setActiveView("khatma") },
        { keys: ["G", "S"], label: "Shalat", action: () => setActiveView("shalat") },
        { keys: ["G", "U"], label: "Doa", action: () => setActiveView("doa") },
        { keys: ["G", "M"], label: "Hifz Al-Quran", action: () => setActiveView("hifz") },
        { keys: ["G", "W"], label: "Tujuan", action: () => setActiveView("tujuan") },
        { keys: ["G", "E"], label: "Pencapaian", action: () => setActiveView("pencapaian") },
        { keys: ["G", "F"], label: "Fokus", action: () => setActiveView("fokus") },
        { keys: ["G", "A"], label: "Analitik", action: () => setActiveView("analitik") },
        { keys: ["G", ","], label: "Pengaturan", action: () => setActiveView("pengaturan") },
      ],
    },
    {
      label: "Aksi",
      items: [
        { keys: ["⌘", "K"], label: "Buka command palette", action: () => setCommandOpen(true) },
        { keys: ["?"], label: "Tampilkan bantuan" },
        { keys: ["B"], label: "Toggle sidebar", action: toggleSidebar },
        { keys: ["T"], label: "Ganti tema" },
        { keys: ["Esc"], label: "Tutup dialog" },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-premium"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Keyboard className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-display text-base font-semibold">Pintasan Keyboard</h3>
                  <p className="text-[11px] text-muted-foreground">Tekan tombol untuk navigasi lebih cepat</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto scroll-slim max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">
                      {group.label}
                    </p>
                    <ul className="space-y-2">
                      {group.items.map((item, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => {
                              item.action?.();
                              setOpen(false);
                            }}
                            disabled={!item.action}
                            className="flex items-center justify-between gap-3 w-full text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/60 disabled:hover:bg-transparent disabled:cursor-default"
                          >
                            <span className="text-sm text-foreground/80">{item.label}</span>
                            <span className="flex items-center gap-1 shrink-0">
                              {item.keys.map((k, i) => (
                                <kbd
                                  key={i}
                                  className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1 text-[10px] font-medium text-foreground/70"
                                >
                                  {k === "⌘" ? <Command className="h-2.5 w-2.5" /> : k}
                                </kbd>
                              ))}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 text-center">
                <p className="text-[11px] text-muted-foreground/70">
                  Tips: Tekan <kbd className="inline-flex h-4 px-1 items-center justify-center rounded border border-border bg-muted text-[9px] font-medium">?</kbd> kapan saja untuk membuka panduan ini.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Local state hook (lifted to module scope so other components can open the overlay) */
let _setOpenExternal: ((v: boolean) => void) | null = null;

export function useKeyboardShortcutsOpen() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    _setOpenExternal = setOpen;
    return () => { _setOpenExternal = null; };
  }, [setOpen]);
  return open;
}

export function useSetKeyboardShortcutsOpen() {
  return React.useCallback((v: boolean) => {
    _setOpenExternal?.(v);
  }, []);
}

/** Global keyboard listener — registers the "?" key + all G+X navigation shortcuts. */
export function useGlobalKeyboardShortcuts() {
  const { setActiveView, setCommandOpen, commandOpen, toggleSidebar } = useAppStore();
  const setOpen = useSetKeyboardShortcutsOpen();

  React.useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      // Skip if a modifier is pressed (let ⌘K etc. pass through)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toUpperCase();

      // ? → open shortcuts overlay
      if (e.key === "?" && !commandOpen) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // G + X → navigation
      if (key === "G" && !gPressed) {
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1200);
        return;
      }
      if (gPressed) {
        const navMap: Record<string, ViewKey> = {
          D: "dashboard", C: "kalender", J: "jurnal", H: "kebiasaan",
          K: "khatma", S: "shalat", U: "doa",
          F: "fokus", O: "catatan", G: "tujuan",
          A: "analitik", ",": "pengaturan",
          M: "hifz", W: "tujuan", E: "pencapaian",
        };
        const target = navMap[key] ?? navMap[e.key];
        if (target) {
          e.preventDefault();
          setActiveView(target);
        }
        gPressed = false;
        if (gTimer) clearTimeout(gTimer);
        return;
      }

      // Single-key shortcuts (only when no overlay/palette open)
      if (!commandOpen) {
        if (key === "B") { e.preventDefault(); toggleSidebar(); }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveView, setCommandOpen, commandOpen, toggleSidebar, setOpen]);
}
