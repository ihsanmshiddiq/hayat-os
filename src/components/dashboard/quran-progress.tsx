"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Bookmark, Clock, Target, Plus, Minus } from "lucide-react";
import { useDashboard, useUpdateQuran } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { SURAHS } from "@/lib/islamic";
import { ProgressRing } from "@/components/shared/progress-ring";

export function QuranProgress() {
  const { data } = useDashboard();
  const updateQuran = useUpdateQuran();
  const { setActiveView } = useAppStore();

  const quran = data?.today.quran;
  const history = data?.quranHistory ?? [];
  const pagesToday = quran?.pagesRead ?? 0;
  const target = quran?.targetPages ?? 2;
  const pct = target ? Math.min(100, Math.round((pagesToday / target) * 100)) : 0;

  const lastSurah = quran?.lastSurah ? SURAHS.find((s) => s.name === quran.lastSurah) : null;

  const setPages = (n: number) => {
    const next = Math.max(0, n);
    updateQuran.mutate({ pagesRead: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6 h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BookOpen className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">Progres Al-Quran</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Bacaan hari ini</p>
          </div>
        </div>
        <ProgressRing value={pct} size={64} strokeWidth={6}>
          <span className="text-xs font-semibold">{pagesToday}/{target}</span>
        </ProgressRing>
      </div>

      {/* Page counter */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3.5 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Halaman dibaca hari ini</p>
          <p className="text-display text-2xl font-semibold tabular-nums">{pagesToday}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPages(pagesToday - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPages(pagesToday + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Last surah + memorization */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="rounded-xl border border-border/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Bookmark className="h-3.5 w-3.5" /> Surah terakhir
          </div>
          <p className="text-sm font-medium truncate">{lastSurah?.name ?? quran?.lastSurah ?? "—"}</p>
          {lastSurah ? <p className="text-arabic text-base text-primary leading-none mt-0.5">{lastSurah.arabic}</p> : null}
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Target className="h-3.5 w-3.5" /> Terhafal
          </div>
          <p className="text-sm font-medium tabular-nums">{quran?.memorizedAyahs ?? 0} ayat</p>
        </div>
      </div>

      {/* Mini trend */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tren 14 hari</span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {(history.reduce((a, h) => a + h.minutesSpent, 0))} min
          </span>
        </div>
        <div className="flex items-end justify-between gap-1 h-16">
          {history.slice(-14).map((h, i) => {
            const max = Math.max(...history.map((x) => x.pagesRead), 1);
            const pct = (h.pagesRead / max) * 100;
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.03 }}
                className={cn2("flex-1 rounded-sm", h.pagesRead >= h.targetPages ? "bg-emerald-500/70" : "bg-emerald-500/30")}
                title={`${h.pagesRead} pages`}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setActiveView("khatma")}
        className="w-full text-sm text-primary font-medium hover:underline underline-offset-4"
      >
        Buka ruang kerja Al-Quran →
      </button>
    </motion.div>
  );
}

// tiny local cn to avoid extra import cycle noise
function cn2(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
