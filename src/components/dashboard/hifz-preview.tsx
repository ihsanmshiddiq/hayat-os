"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookMarked, ChevronRight, CheckCircle, Loader, AlertCircle, RotateCcw } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicPatternMoroccan } from "@/components/shared/islamic-pattern";
import { useHifz } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function HifzPreview() {
  const { setActiveView } = useAppStore();
  const { data } = useHifz();

  const stats = data?.stats;
  const dueForReview = stats?.dueForReview ?? 0;

  // Get top 3 surahs needing attention (memorized, due for review)
  const needsAttention = React.useMemo(() => {
    if (!data) return [];
    return data.surahs
      .filter((s) => s.status === "memorized" || s.status === "needs_review")
      .sort((a, b) => a.daysUntilReview - b.daysUntilReview)
      .slice(0, 3);
  }, [data]);

  return (
    <SectionCard interactive className="relative overflow-hidden cursor-pointer" {...({ onClick: () => setActiveView("hifz") } as object)}>
      <IslamicPatternMoroccan className="text-primary" opacity={0.04} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookMarked className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-display text-base font-medium">Hifz Progress</h3>
              <p className="text-[11px] text-muted-foreground">
                {stats?.memorizedSurahs ?? 0} surahs memorized · {stats?.percentQuran.toFixed(1) ?? "0.0"}% of Quran
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-4">
          <ProgressRing value={stats?.percentQuran ?? 0} size={84} strokeWidth={8}>
            <div className="text-center">
              <p className="text-display text-sm font-semibold tabular-nums">
                <AnimatedNumber value={stats?.percentQuran ?? 0} decimals={1} />
                <span className="text-[10px] text-muted-foreground">%</span>
              </p>
            </div>
          </ProgressRing>

          <div className="flex-1 space-y-1.5">
            {needsAttention.length > 0 ? (
              needsAttention.map((s) => (
                <div key={s.number} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {s.daysUntilReview <= 0 ? (
                      <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                    ) : s.daysUntilReview < 7 ? (
                      <RotateCcw className="h-3 w-3 text-amber-500 shrink-0" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                    )}
                    <span className="truncate font-medium">{s.name}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] tabular-nums shrink-0",
                    s.daysUntilReview <= 0 ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground"
                  )}>
                    {s.daysUntilReview <= 0 ? "Review due" : `${s.daysUntilReview}d`}
                  </span>
                </div>
              ))
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader className="h-3 w-3" />
                  <span>{stats?.inProgress ?? 0} surahs in progress</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">Start memorizing to see your review schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
