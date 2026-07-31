"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, BookOpen, PenLine, Plus, Minus } from "lucide-react";
import { useDashboard, useTogglePrayer, useSunnah } from "@/lib/hooks";
import { ProgressRing } from "@/components/shared/progress-ring";
import { OBLIGATORY_PRAYERS, PRAYER_AR } from "@/lib/islamic";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DailyFocus() {
  const { data } = useDashboard();
  const togglePrayer = useTogglePrayer();
  const sunnah = useSunnah();
  const { setActiveView } = useAppStore();

  const completion = data?.today.completion ?? { done: 0, total: 8, percent: 0 };
  const prayers = data?.today.prayers;
  const quran = data?.today.quran;

  const prayerItems = OBLIGATORY_PRAYERS.map((p) => ({
    key: p.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
    label: p,
    arabic: PRAYER_AR[p],
    done: prayers?.[p.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"] ?? false,
  }));

  const quranDone = quran ? quran.pagesRead >= quran.targetPages : false;
  const journalDone = !!data?.today.journal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="lg:col-span-2"
    >
      <div className="h-full rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">Fokus Hari Ini</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Daftar tugas harianmu</p>
          </div>
          <ProgressRing value={completion.percent} size={72} strokeWidth={7}>
            <span className="text-display text-base font-semibold">{completion.percent}%</span>
          </ProgressRing>
        </div>

        <div className="space-y-5">
          {/* Prayers */}
          <FocusGroup title="Shalat" subtitle="Lima waktu shalat">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {prayerItems.map((p) => (
                <FocusToggle
                  key={p.key}
                  label={p.label}
                  sub={p.arabic}
                  done={p.done}
                  onToggle={() => togglePrayer.mutate({ prayer: p.key, value: !p.done })}
                />
              ))}
            </div>
          </FocusGroup>

          {/* Quran + Journal */}
          <div className="grid sm:grid-cols-2 gap-2.5">
            <FocusRow
              icon={<BookOpen className="h-4 w-4" />}
              tint="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-500/10"
              label="Al-Quran"
              value={quran ? `${quran.pagesRead}/${quran.targetPages} halaman` : "0/2 halaman"}
              done={quranDone}
              onClick={() => setActiveView("khatma")}
            />
            <FocusRow
              icon={<PenLine className="h-4 w-4" />}
              tint="text-sky-600 dark:text-sky-400"
              bg="bg-sky-500/10"
              label="Jurnal"
              value={journalDone ? "Sudah ditulis" : "Belum"}
              done={journalDone}
              onClick={() => setActiveView("jurnal")}
            />
          </div>

          {/* Sunnah counter */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/40 p-3.5">
            <div>
              <p className="text-sm font-medium">Shalat sunnah hari ini</p>
              <p className="text-xs text-muted-foreground">Pahala di luar shalat wajib</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sunnah.mutate(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="tabular-nums text-display text-lg font-semibold w-6 text-center">
                {data?.today.prayers?.sunnah ?? 0}
              </span>
              <button
                onClick={() => sunnah.mutate(1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FocusGroup({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80">{title}</span>
        {subtitle ? <span className="text-[11px] text-muted-foreground">· {subtitle}</span> : null}
      </div>
      {children}
    </div>
  );
}

function FocusToggle({
  label,
  sub,
  done,
  onToggle,
}: {
  label: string;
  sub?: string;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all",
        done
          ? "border-primary/40 bg-primary/8"
          : "border-border bg-card hover:border-border hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border transition-all",
          done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent group-hover:border-foreground/30"
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className={cn("text-xs font-medium", done ? "text-primary" : "text-foreground")}>{label}</span>
      {sub ? <span className="text-arabic text-xs text-muted-foreground leading-none">{sub}</span> : null}
    </motion.button>
  );
}

function FocusRow({
  icon,
  label,
  value,
  done,
  tint,
  bg,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  done: boolean;
  tint: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
        done ? "border-primary/40 bg-primary/8" : "border-border bg-card hover:border-border hover:bg-muted/40"
      )}
    >
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bg, tint)}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium leading-tight", done ? "text-primary" : "text-foreground")}>{value}</p>
      </div>
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
          done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"
        )}
      >
        <Check className="h-3 w-3" />
      </span>
    </button>
  );
}
