"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Timer, ChevronRight, Flame, Clock, Play } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicPatternHexagram } from "@/components/shared/islamic-pattern";
import { useFocus } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FocusPreview() {
  const { setActiveView } = useAppStore();
  const { data } = useFocus(7);

  const todayCount = data?.stats.todayCount ?? 0;
  const todayMinutes = Math.round((data?.stats.todaySeconds ?? 0) / 60);
  const streak = data?.stats.streak ?? 0;
  const weekSessions = (data?.trend ?? []).reduce((a, d) => a + d.count, 0);

  return (
    <SectionCard interactive className="relative overflow-hidden cursor-pointer" {...({ onClick: () => setActiveView("focus") } as object)}>
      <IslamicPatternHexagram className="text-primary" opacity={0.04} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Timer className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-display text-base font-medium">Focus Today</h3>
              <p className="text-[11px] text-muted-foreground">
                {todayCount > 0 ? `${todayMinutes} min · ${todayCount} session${todayCount === 1 ? "" : "s"}` : "Ready to focus?"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-muted/40 px-2 py-2 text-center">
            <p className="text-display text-base font-semibold tabular-nums">
              <AnimatedNumber value={todayMinutes} />
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Today (min)</p>
          </div>
          <div className="rounded-lg bg-amber-500/10 px-2 py-2 text-center">
            <p className="text-display text-base font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              <AnimatedNumber value={streak} />
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Streak</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 px-2 py-2 text-center">
            <p className="text-display text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={weekSessions} />
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">7-day</p>
          </div>
        </div>

        {/* 7-day mini bar */}
        <div className="flex items-end gap-1 h-8">
          {(data?.trend ?? []).slice(-7).map((d, i) => {
            const minutes = Math.round(d.totalSec / 60);
            const maxMin = Math.max(50, ...(data?.trend ?? []).map((x) => x.totalSec / 60));
            const h = Math.min(100, (minutes / maxMin) * 100);
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                  "flex-1 rounded-sm",
                  minutes > 0 ? "bg-primary/60" : "bg-muted"
                )}
                title={`Day ${i + 1}: ${minutes} min`}
              />
            );
          })}
        </div>

        {/* Quick-start button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveView("focus");
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-2 text-sm font-medium"
        >
          <Play className="h-3.5 w-3.5" /> Start a focus session
        </button>
      </div>
    </SectionCard>
  );
}
