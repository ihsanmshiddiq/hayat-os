"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, ChevronRight, Sparkles, Trophy, Flame, Lock } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { useAchievements } from "@/lib/hooks";
import { ACHIEVEMENTS, TIER_STYLES } from "@/lib/islamic";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Sparkles, Flame, Trophy, Crown, Lock,
};

/** Dashboard preview: shows total unlocked + the next achievement to chase. */
export function AchievementsPreview() {
  const { data: stats } = useAchievements();
  const { setActiveView } = useAppStore();

  if (!stats) {
    return (
      <SectionCard className="h-full">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="h-4 w-4 text-primary" />
          <h3 className="text-display text-lg font-medium">Achievements</h3>
        </div>
        <div className="h-24 animate-pulse rounded-xl bg-muted/50" />
      </SectionCard>
    );
  }

  const total = ACHIEVEMENTS.length;
  // Compute progress for each achievement to find the "next to unlock"
  const progressMap: Record<string, number> = {
    "first-prayer": stats.totalPrayersDone,
    "prayer-7": stats.prayerStreak,
    "prayer-30": stats.prayerStreak,
    "prayer-100": stats.prayerStreak,
    "quran-first": stats.totalQuranPages,
    "quran-60": stats.totalQuranPages,
    "quran-300": stats.totalQuranPages,
    "quran-604": stats.totalQuranPages,
    "dhikr-100": stats.totalDhikrCounts,
    "dhikr-1000": stats.totalDhikrCounts,
    "dhikr-10000": stats.totalDhikrCounts,
    "habit-7": stats.bestHabitCheckins,
    "habit-30": stats.bestHabitCheckins,
    "habit-100": stats.bestHabitCheckins,
    "journal-7": stats.totalJournalEntries,
    "journal-30": stats.totalJournalEntries,
    "perfect-day": stats.perfectDays,
    "perfect-week": stats.perfectWeekStreak,
    "early-riser": stats.fajrOnTimeStreak,
  };

  const computed = ACHIEVEMENTS.map((a) => {
    const value = progressMap[a.id] ?? 0;
    const pct = Math.min(100, Math.round((value / a.goal) * 100));
    const unlocked = value >= a.goal;
    return { ...a, value, pct, unlocked };
  });

  const unlockedCount = computed.filter((a) => a.unlocked).length;
  const overallPct = Math.round((unlockedCount / total) * 100);

  // Next to unlock: highest pct among unlocked === false
  const next = computed
    .filter((a) => !a.unlocked)
    .sort((a, b) => b.pct - a.pct)[0];

  const NextIcon = ICONS[next?.icon ?? "Lock"] ?? Sparkles;

  return (
    <SectionCard
      interactive
      className="h-full cursor-pointer relative overflow-hidden"
      onClick={() => setActiveView("pencapaian")}
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-400/5 text-amber-600 dark:text-amber-400">
            <Crown className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h3 className="text-display text-lg font-medium">Achievements</h3>
            <p className="text-xs text-muted-foreground">{unlockedCount} of {total} unlocked</p>
          </div>
        </div>
        <ProgressRing value={overallPct} size={48} strokeWidth={4}>
          <span className="text-[10px] font-bold tabular-nums">{overallPct}%</span>
        </ProgressRing>
      </div>

      {/* Next to unlock */}
      {next ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/60 bg-gradient-to-r from-amber-500/5 to-transparent p-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <ProgressRing value={next.pct} size={44} strokeWidth={3}>
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground bg-muted"
                )}>
                  <NextIcon className="h-4 w-4" />
                </div>
              </ProgressRing>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-semibold truncate">{next.title}</p>
                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", TIER_STYLES[next.tier].text, "bg-muted/60")}>
                  {TIER_STYLES[next.tier].label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{next.description}</p>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${next.pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
                <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {Math.min(next.value, next.goal).toLocaleString()}/{next.goal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <Trophy className="h-6 w-6 mx-auto text-primary mb-1.5" />
          <p className="text-sm font-medium">All achievements unlocked!</p>
          <p className="text-[11px] text-muted-foreground">MashaAllah — you've completed the path.</p>
        </div>
      )}

      <button
        onClick={() => setActiveView("pencapaian")}
        className="mt-3 flex items-center justify-center gap-1 w-full text-xs font-medium text-primary hover:underline"
      >
        View all achievements <ChevronRight className="h-3 w-3" />
      </button>
    </SectionCard>
  );
}
