"use client";

import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";
import { useDashboard } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ibadah: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Ibadah" },
  knowledge: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400", label: "Knowledge" },
  health: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", label: "Health" },
  wealth: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Wealth" },
  relationships: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", label: "Relationships" },
  dakwah: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", label: "Dakwah" },
};

export function GoalsPreview() {
  const { data } = useDashboard();
  const { setActiveView } = useAppStore();
  const goals = (data?.goals ?? []).filter((g) => !g.done).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Target className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">Goals</h3>
            <p className="text-sm text-muted-foreground mt-0.5">What you're building toward</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView("goals")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {goals.map((g) => {
          const cat = CATEGORY_STYLES[g.category] ?? CATEGORY_STYLES.ibadah;
          return (
            <div key={g.id} className="group">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-medium", cat.bg, cat.text)}>
                    {cat.label}
                  </span>
                  <p className="text-sm font-medium truncate">{g.title}</p>
                </div>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">{g.progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.progress}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("h-full rounded-full", cat.text.replace("text-", "bg-"))}
                />
              </div>
              {g.milestone ? (
                <p className="text-[11px] text-muted-foreground mt-1 truncate">{g.milestone}</p>
              ) : null}
            </div>
          );
        })}
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">All goals complete. MashaAllah.</p>
        ) : null}
      </div>
    </motion.div>
  );
}
