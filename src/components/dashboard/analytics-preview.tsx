"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AnalyticsPreview() {
  const { data } = useDashboard();
  const { setActiveView } = useAppStore();

  const history = data?.prayerHistory ?? [];
  const totalPrayers = history.reduce((a, p) => a + p.count, 0);
  const totalPossible = history.length * 5;
  const prayerPct = totalPossible ? Math.round((totalPrayers / totalPossible) * 100) : 0;

  const quranHistory = data?.quranHistory ?? [];
  const quranDays = quranHistory.filter((q) => q.pagesRead > 0).length;
  const quranPct = quranHistory.length ? Math.round((quranDays / quranHistory.length) * 100) : 0;

  const habits = data?.habits ?? [];
  const habitLogs = habits.flatMap((h) => h.logs);
  const habitDone = habitLogs.filter((l) => l.done).length;
  const habitPct = habitLogs.length ? Math.round((habitDone / habitLogs.length) * 100) : 0;

  const stats = [
    { label: "Prayer consistency", value: prayerPct, tint: "bg-emerald-500" },
    { label: "Quran days", value: quranPct, tint: "bg-amber-500" },
    { label: "Habit completion", value: habitPct, tint: "bg-sky-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.4 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <BarChart3 className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">Weekly Analytics</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Your consistency at a glance</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView("analytics")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <span className="text-sm font-semibold tabular-nums">{s.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full rounded-full", s.tint)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/40 p-3">
        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
          {prayerPct >= 70 ? "Strong week. Keep the momentum." : prayerPct >= 40 ? "Steady progress. Push for one more prayer." : "Start small. One prayer at a time."}
        </p>
      </div>
    </motion.div>
  );
}
