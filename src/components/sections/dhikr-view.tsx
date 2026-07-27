"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc, RotateCcw, Check, ChevronRight, ChevronLeft, Sparkles, Flame, Calendar } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { useDashboard, useUpdateDhikr, useDhikrHistory } from "@/lib/hooks";
import { DHIKR_PHRASES, DHIKR_SETS, type DhikrSet } from "@/lib/islamic";
import { cn } from "@/lib/utils";

export function DhikrView() {
  const { data } = useDashboard();
  const updateDhikr = useUpdateDhikr();
  const { data: dhikrHistoryData } = useDhikrHistory(30);

  const todayDhikr = data?.today.dhikr ?? [];
  const [activePhraseIdx, setActivePhraseIdx] = React.useState(0);
  const [activeSet, setActiveSet] = React.useState<DhikrSet | null>(null);
  const [setStep, setSetStep] = React.useState(0);

  // Free mode: current phrase from DHIKR_PHRASES
  const currentPhrase = DHIKR_PHRASES[activePhraseIdx];
  const todayLog = todayDhikr.find((d) => d.phrase === currentPhrase.phrase);
  const count = todayLog?.count ?? 0;
  const target = todayLog?.target ?? currentPhrase.target;
  const pct = Math.min(100, Math.round((count / target) * 100));
  const completed = count >= target;

  // Set mode
  const setPhrase = activeSet?.phrases[setStep];
  const setPhraseData = setPhrase ? DHIKR_PHRASES.find((p) => p.phrase === setPhrase.phrase) : null;
  const setTodayLog = setPhrase ? todayDhikr.find((d) => d.phrase === setPhrase.phrase) : null;
  const setCount = setTodayLog?.count ?? 0;
  const setTarget = setPhrase?.target ?? 33;
  const setPct = Math.min(100, Math.round((setCount / setTarget) * 100));
  const setCompleted = setCount >= setTarget;

  const totalToday = todayDhikr.reduce((a, d) => a + d.count, 0);
  const completedToday = todayDhikr.filter((d) => d.count >= d.target).length;

  const increment = () => {
    if (activeSet) {
      // Set mode
      updateDhikr.mutate({ phrase: setPhrase!.phrase, count: setCount + 1, target: setTarget });
      if (setCount + 1 >= setTarget && setLangkah < activeSet.phrases.length - 1) {
        setTimeout(() => setSetStep((s) => s + 1), 400);
      }
    } else {
      // Free mode
      updateDhikr.mutate({ phrase: currentPhrase.phrase, count: count + 1, target });
    }
  };

  const reset = () => {
    if (activeSet) {
      updateDhikr.mutate({ phrase: setPhrase!.phrase, count: 0, target: setTarget });
    } else {
      updateDhikr.mutate({ phrase: currentPhrase.phrase, count: 0, target });
    }
  };

  const exitSet = () => {
    setActiveSet(null);
    setSetStep(0);
  };

  // Display values
  const displayCount = activeSet ? setCount : count;
  const displayTarget = activeSet ? setTarget : target;
  const displayPct = activeSet ? setPct : pct;
  const displayCompleted = activeSet ? setCompleted : completed;
  const displayArabic = activeSet ? setPhraseData?.ar : currentPhrase.ar;
  const displayPhrase = activeSet ? setPhrase?.phrase : currentPhrase.phrase;
  const displayMeaning = activeSet ? setPhraseData?.meaning : currentPhrase.meaning;

  return (
    <div>
      <ViewHeader
        title="Dzikir & Tasbih"
        subtitle="Ingatlah Allah, dan hati akan menemukan ketenangan. Ketuk lingkaran untuk menghitung."
        icon={<Disc className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Main counter */}
        <SectionCard className="flex flex-col items-center">
          {/* Mode badge */}
          {activeSet && (
            <div className="mb-4 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
              <span className="text-arabic text-sm text-primary">{activeSet.arabicName}</span>
              <span className="text-xs font-medium text-primary">{activeSet.name}</span>
              <span className="text-[11px] text-muted-foreground">
                · Langkah {setLangkah + 1}/{activeSet.phrases.length}
              </span>
              <button onClick={exitSet} className="ml-1 text-xs text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          )}

          {/* Phrase display */}
          <div className="text-center mb-6">
            <p className="text-arabic text-3xl sm:text-4xl text-primary leading-relaxed mb-2">
              {displayArabic}
            </p>
            <p className="text-display text-lg font-medium">{displayPhrase}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{displayMeaning}</p>
          </div>

          {/* The big tap circle */}
          <motion.button
            onClick={increment}
            whileTap={{ scale: 0.96 }}
            className="relative group select-none"
            disabled={displayCompleted && !activeSet}
          >
            <ProgressRing value={displayPct} size={240} strokeWidth={14}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={displayCount}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center"
                >
                  <span className={cn(
                    "text-display text-6xl font-semibold tabular-nums leading-none",
                    displayCompleted ? "text-primary" : "text-foreground"
                  )}>
                    {displayCount}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2">
                    of {displayTarget}
                  </span>
                </motion.div>
              </AnimatePresence>
            </ProgressRing>

            {/* ripple */}
            <motion.span
              key={`ripple-${displayCount}`}
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
            />

            {displayCompleted && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-premium"
              >
                <Check className="h-5 w-5" />
              </motion.div>
            )}
          </motion.button>

          <p className="mt-6 text-xs text-muted-foreground">
            {displayCompleted
              ? activeSet && setLangkah < activeSet.phrases.length - 1
                ? "Selesai! Lanjut ke berikutnya…"
                : "MashaAllah — target tercapai. Semoga Allah menerima."
              : "Ketuk lingkaran untuk menghitung"}
          </p>

          {/* Controls */}
          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Atur ulang
            </button>
            {!activeSet && (
              <>
                <button
                  onClick={() => setActivePhraseIdx((i) => (i - 1 + DHIKR_PHRASES.length) % DHIKR_PHRASES.length)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActivePhraseIdx((i) => (i + 1) % DHIKR_PHRASES.length)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Phrase selector (free mode) */}
          {!activeSet && (
            <div className="mt-6 w-full">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2 text-center">
                Pilih lafadz
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {DHIKR_PHRASES.map((p, i) => {
                  const log = todayDhikr.find((d) => d.phrase === p.phrase);
                  const done = log && log.count >= log.target;
                  return (
                    <button
                      key={p.phrase}
                      onClick={() => setActivePhraseIdx(i)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1 text-[11px] transition-all",
                        i === activePhraseIdx
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted",
                        done && i !== activePhraseIdx && "border-primary/30 text-primary/70"
                      )}
                    >
                      {done ? "✓ " : ""}{p.phrase}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Sidebar: stats + presets */}
        <div className="space-y-6">
          {/* Today's stats */}
          <SectionCard>
            <h3 className="text-display text-base font-medium mb-4">Dzikir Hari Ini</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Jumlah total</p>
                <p className="text-display text-2xl font-semibold tabular-nums">{totalToday}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Selesai</p>
                <p className="text-display text-2xl font-semibold tabular-nums">{completedToday}/{DHIKR_PHRASES.length}</p>
              </div>
            </div>
            {/* All phrases progress */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto scroll-slim">
              {DHIKR_PHRASES.map((p) => {
                const log = todayDhikr.find((d) => d.phrase === p.phrase);
                const c = log?.count ?? 0;
                const t = log?.target ?? p.target;
                const done = c >= t;
                const pp = Math.min(100, (c / t) * 100);
                return (
                  <div key={p.phrase} className="flex items-center gap-2.5">
                    <span className="text-arabic text-sm text-muted-foreground w-7 text-center shrink-0">{p.ar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-xs truncate", done && "text-primary font-medium")}>{p.phrase}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{c}/{t}</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", done ? "bg-primary" : "bg-primary/50")} style={{ width: `${pp}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Preset sets */}
          <SectionCard>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-display text-base font-medium">Set Adhkar</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Urutan panduan berdzikir</p>
            <div className="space-y-2">
              {DHIKR_SETS.map((set) => (
                <button
                  key={set.id}
                  onClick={() => { setActiveSet(set); setSetStep(0); }}
                  className={cn(
                    "w-full text-left rounded-xl border p-3 transition-all hover:border-border hover:bg-muted/40",
                    activeSet?.id === set.id && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-arabic text-sm text-primary">{set.arabicName}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-sm font-medium">{set.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{set.description}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {set.phrases.map((_, i) => (
                      <span key={i} className="h-1 flex-1 rounded-full bg-muted">
                        {activeSet?.id === set.id && i <= setLangkah && (
                          <span className="block h-full rounded-full bg-primary" style={{ width: "100%" }} />
                        )}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Virtue note */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Flame className="h-4 w-4 text-primary" />
              <p className="text-display text-sm font-medium">Keutamaan dzikir</p>
            </div>
            <p className="text-arabic text-base text-primary mb-1.5">
              وَلَذِكْرُ ٱللَّٰهِ أَكْبَرُ
            </p>
            <p className="text-xs text-muted-foreground italic">
              "And the remembrance of Allah is greater." — Quran 29:45
            </p>
          </div>
        </div>
      </div>

      {/* 30-day history heatmap */}
      <DhikrHistoryHeatmap history={dhikrHistoryData?.history ?? []} />
    </div>
  );
}

function DhikrHistoryHeatmap({
  history,
}: {
  history: { date: string; total: number; phrases: { phrase: string; count: number; target: number }[] }[];
}) {
  const maxTotal = Math.max(1, ...history.map((h) => h.total));
  const total30 = history.reduce((a, h) => a + h.total, 0);
  const activeDays = history.filter((h) => h.total > 0).length;

  // Group into weeks (columns of 7) for a GitHub-style heatmap
  const weeks: typeof history[] = [];
  for (let i = 0; i < history.length; i += 7) {
    weeks.push(history.slice(i, i + 7));
  }

  const level = (total: number) => {
    if (total <= 0) return "bg-muted";
    const r = total / maxTotal;
    if (r >= 0.75) return "bg-emerald-500";
    if (r >= 0.5) return "bg-emerald-500/70";
    if (r >= 0.25) return "bg-emerald-500/45";
    return "bg-emerald-500/25";
  };

  return (
    <SectionCard className="mt-6">
      <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-display text-lg font-medium">Riwayat Dzikir</h3>
            <p className="text-xs text-muted-foreground mt-0.5">30 hari terakhir berdzikir</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Jumlah totals</p>
            <p className="text-display text-xl font-semibold tabular-nums">{total30.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Hari aktif</p>
            <p className="text-display text-xl font-semibold tabular-nums">{activeDays}/30</p>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scroll-slim">
        <div className="flex gap-1.5 min-w-[480px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              {week.map((day, di) => {
                const d = new Date(day.date);
                const isToday = new Date().toDateString() === d.toDateString();
                return (
                  <div
                    key={di}
                    className={cn(
                      "relative h-7 w-7 rounded-md transition-all hover:ring-2 hover:ring-primary/30 hover:ring-offset-1 hover:ring-offset-card",
                      level(day.total),
                      isToday && "ring-2 ring-primary"
                    )}
                    title={`${d.toLocaleDateString("id-ID", { weekday: "short", month: "short", day: "numeric" })}: ${day.total} counts`}
                  >
                    {day.total > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                        {day.total > 99 ? "99+" : day.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>Sedikit</span>
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500/25" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500/45" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500/70" />
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span>Banyak</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {activeDays >= 20 ? "MashaAllah — excellent consistency!" : activeDays >= 10 ? "Great progress, keep going." : "Build the habit — start today."}
        </p>
      </div>
    </SectionCard>
  );
}
