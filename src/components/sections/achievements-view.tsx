"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Crown, Sparkles, Flame, Award, BookOpen, BookMarked, Library, Infinity as InfinityIcon,
  Repeat, Trophy, PenLine, Star, Sunrise, Lock, Check,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { useAchievements, useDashboard, type AchievementsData } from "@/lib/hooks";
import { ACHIEVEMENTS, TIER_STYLES, type Achievement } from "@/lib/islamic";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  Sparkles, Flame, Award, BookOpen, BookMarked, Library, Infinity: InfinityIcon,
  Repeat, Trophy, Crown, PenLine, Star, Sunrise,
};

const CATEGORY_LABELS: Record<Achievement["category"], string> = {
  prayer: "Shalat",
  quran: "Quran",
  habit: "Kebiasaan",
  journal: "Jurnal",
  streak: "Runtutan",
  special: "Istimewa",
};

const TIER_ORDER: Achievement["tier"][] = ["bronze", "silver", "gold", "platinum"];

/** Map an achievement id → progress value from lifetime stats. */
function getProgress(a: Achievement, stats: AchievementsData, todayPercent: number): number {
  switch (a.id) {
    case "first-prayer": return stats.totalPrayersDone;
    case "prayer-7": return stats.prayerStreak;
    case "prayer-30": return stats.prayerStreak;
    case "prayer-100": return stats.prayerStreak;
    case "quran-first": return stats.totalQuranPages;
    case "quran-60": return stats.totalQuranPages;
    case "quran-300": return stats.totalQuranPages;
    case "quran-604": return stats.totalQuranPages;
    case "habit-7": return stats.bestHabitCheckins;
    case "habit-30": return stats.bestHabitCheckins;
    case "habit-100": return stats.bestHabitCheckins;
    case "journal-7": return stats.totalJournalEntries;
    case "journal-30": return stats.totalJournalEntries;
    case "perfect-day": return stats.perfectDays;
    case "perfect-week": return stats.perfectWeekStreak;
    case "early-riser": return stats.fajrOnTimeStreak;
    default: return 0;
  }
}

export function AchievementsView() {
  const { data: stats, isLoading } = useAchievements();
  const { data: dash } = useDashboard();
  const [filter, setFilter] = React.useState<"all" | Achievement["tier"]>("all");

  const todayPercent = dash?.today.completion.percent ?? 0;
  const emptyStats: AchievementsData = {
    prayerStreak: 0, totalPrayersDone: 0, perfectDays: 0, perfectWeekStreak: 0,
    fajrOnTimeStreak: 0, totalQuranPages: 0,
    bestHabitCheckins: 0, totalHabitCheckins: 0, totalJournalEntries: 0,
  };
  const s = stats ?? emptyStats;

  const computed = ACHIEVEMENTS.map((a) => {
    const value = getProgress(a, s, todayPercent);
    const pct = Math.min(100, Math.round((value / a.goal) * 100));
    const unlocked = value >= a.goal;
    return { ...a, value, pct, unlocked };
  });

  const unlockedCount = computed.filter((a) => a.unlocked).length;
  const filtered = filter === "all" ? computed : computed.filter((a) => a.tier === filter);
  const totalXp = computed.reduce((total, achievement) => total + (achievement.unlocked ? ({ bronze: 100, silver: 250, gold: 500, platinum: 1000 }[achievement.tier]) : 0), 0);
  const level = Math.floor(totalXp / 500) + 1;

  // Hero stats
  const heroStats = [
    { label: `Level ${level}`, value: totalXp, unit: "XP", icon: Sparkles, color: "text-primary" },
    { label: "Terbuka", value: unlockedCount, total: ACHIEVEMENTS.length, icon: Trophy, color: "text-amber-500" },
    { label: "Runtutan shalat", value: s.prayerStreak, unit: "days", icon: Flame, color: "text-rose-500" },
    { label: "Halaman Quran", value: s.totalQuranPages, icon: BookOpen, color: "text-emerald-500" },
  ];

  return (
    <div>
      <ViewHeader
        title="Pencapaian"
        subtitle="Pencapaianmu di jalan ini. Setiap amal kecil, dilakukan secara konsisten, menjadi besar."
        icon={<Crown className="h-5 w-5" />}
      />

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {heroStats.map((h, i) => {
          const Icon = h.icon;
          return (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <SectionCard padded={false} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60", h.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">{h.label}</p>
                    <p className="text-display text-xl font-semibold tabular-nums">
                      <AnimatedNumber value={h.value} duration={1000} />
                      {h.total ? <span className="text-sm text-muted-foreground">/{h.total}</span> : null}
                      {h.unit ? <span className="text-xs text-muted-foreground ml-1">{h.unit}</span> : null}
                    </p>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          );
        })}
      </div>

      {/* Tier filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
            filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
          )}
        >
          All ({ACHIEVEMENTS.length})
        </button>
        {TIER_ORDER.map((t) => {
          const count = computed.filter((a) => a.tier === t).length;
          const unlocked = computed.filter((a) => a.tier === t && a.unlocked).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all capitalize",
                filter === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", t === "bronze" ? "bg-amber-700" : t === "silver" ? "bg-slate-400" : t === "gold" ? "bg-amber-500" : "bg-emerald-500")} />
              {TIER_STYLES[t].label}
              <span className="text-[10px] opacity-70">{unlocked}/{count}</span>
            </button>
          );
        })}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a, i) => {
          const Icon = ICONS[a.icon] ?? Sparkles;
          const tierStyle = TIER_STYLES[a.tier];
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionCard
                padded={false}
                className={cn(
                  "relative overflow-hidden p-5 transition-all",
                  a.unlocked && tierStyle.glow,
                  !a.unlocked && "opacity-90"
                )}
              >
                {/* Tier gradient backdrop */}
                <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", tierStyle.ring)} />

                <div className="relative flex items-start gap-4">
                  {/* Badge icon with ring */}
                  <div className="relative shrink-0">
                    <ProgressRing
                      value={a.pct}
                      size={68}
                      strokeWidth={4}
                      trackClassName={a.unlocked ? "stroke-primary/20" : "stroke-muted"}
                    >
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-all",
                        a.unlocked
                          ? cn("bg-gradient-to-br text-primary-foreground", a.tier === "bronze" ? "from-amber-600 to-amber-800" : a.tier === "silver" ? "from-slate-300 to-slate-500" : a.tier === "gold" ? "from-amber-400 to-yellow-600" : "from-emerald-400 to-teal-600")
                          : "bg-muted text-muted-foreground"
                      )}>
                        {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      </div>
                    </ProgressRing>
                    {a.unlocked && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
                      >
                        <Check className="h-3 w-3" />
                      </motion.span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-display text-sm font-semibold truncate">{a.title}</p>
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", tierStyle.text, "bg-muted/60")}>
                        {tierStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-2">{a.description}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {CATEGORY_LABELS[a.category]}
                      </span>
                      <span className={cn("text-xs font-semibold tabular-nums", a.unlocked ? tierStyle.text : "text-muted-foreground")}>
                        {Math.min(a.value, a.goal).toLocaleString()}/{a.goal.toLocaleString()} {a.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative mt-3 h-1 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${a.pct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.03, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      a.tier === "bronze" ? "bg-amber-600" : a.tier === "silver" ? "bg-slate-400" : a.tier === "gold" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
              </SectionCard>
            </motion.div>
          );
        })}
      </div>

      {isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-sm text-muted-foreground">Loading achievements…</div>
      )}
    </div>
  );
}
