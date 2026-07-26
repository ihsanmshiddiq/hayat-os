"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ScrollText, ChevronRight, Check, Flame, Clock, TrendingUp, BookOpen } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicPatternMoroccan } from "@/components/shared/islamic-pattern";
import { useKhatma } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function KhatmaPreview() {
  const { setActiveView } = useAppStore();
  const { data } = useKhatma();
  const active = data?.active ?? null;

  return (
    <SectionCard
      interactive
      className="relative overflow-hidden cursor-pointer"
      {...({ onClick: () => setActiveView("khatma") } as object)}
    >
      <IslamicPatternMoroccan className="text-primary" opacity={0.05} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ScrollText className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-display text-base font-medium">Khatma</h3>
              <p className="text-[11px] text-muted-foreground">
                {active ? active.name : "Start a reading plan"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {!active ? (
          // Empty state — invite user to start
          <div className="rounded-xl border border-dashed border-border/60 bg-background/40 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium mb-1">Begin Your Khatma</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Set a Quran reading goal and build a daily habit.
            </p>
          </div>
        ) : (
          <>
            {/* Progress hero */}
            <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] to-transparent p-3 mb-3">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Progress
                  </p>
                  <p className="text-display text-xl font-semibold tabular-nums">
                    <AnimatedNumber value={active.completionPct} />%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Pages
                  </p>
                  <p className="text-display text-xl font-semibold tabular-nums">
                    {active.pagesReadSinceStart}
                    <span className="text-xs text-muted-foreground font-normal"> / {active.totalPages}</span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${active.completionPct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                />
              </div>

              {/* Mini juz indicator dots (5 segments) */}
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 30 }).map((_, i) => {
                  const j = active.juzProgress[i];
                  const pct = j?.pct ?? 0;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-colors",
                        pct >= 100 ? "bg-primary" : pct > 0 ? "bg-primary/40" : "bg-muted"
                      )}
                      title={`Juz ${i + 1}: ${pct}%`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Target</p>
                <p className="text-sm font-semibold tabular-nums">{active.dailyTarget}<span className="text-[10px] text-muted-foreground"> /day</span></p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Pace</p>
                <p className="text-sm font-semibold tabular-nums">{active.avgPacePerDay}<span className="text-[10px] text-muted-foreground"> /day</span></p>
              </div>
              <div className={cn(
                "rounded-lg border p-2 text-center",
                active.onPace
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              )}>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Status</p>
                <p className={cn(
                  "text-xs font-semibold flex items-center justify-center gap-0.5",
                  active.onPace
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                )}>
                  {active.onPace ? <Check className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {active.onPace ? "On pace" : "Catch up"}
                </p>
              </div>
            </div>

            {/* Footer: streak + days left */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                {active.streak > 0 ? (
                  <>
                    <Flame className="h-3 w-3 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400 tabular-nums">{active.streak} day streak</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{active.daysRemaining} days left</span>
                  </>
                )}
              </span>
              <span className="text-primary font-medium">Open plan →</span>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
