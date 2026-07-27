"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Check, Clock, MapPin, Flame } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";

import { useDashboard, useTogglePrayer, useSunnah } from "@/lib/hooks";
import {
  computePrayerTimes,
  formatCountdown,
  formatTimeInZone,
  getNextPrayer,
  getLocationTimezoneHours,
  OBLIGATORY_PRAYERS,
  PRAYER_AR,
  CALC_METHODS,
  type PrayerName,
} from "@/lib/islamic";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";

type CalcMethodKey = keyof typeof CALC_METHODS;

const PRAYER_ICONS: Record<string, string> = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌇",
  Isha: "🌙",
};

export function SalahView() {
  const { data } = useDashboard();
  const togglePrayer = useTogglePrayer();
  const sunnah = useSunnah();
  const now = useNow(1000);

  const lat = data?.user.latitude ?? -6.2088;
  const lng = data?.user.longitude ?? 106.8456;
  const method = (data?.user.method as CalcMethodKey | undefined) ?? "Kemenag";
  const methodName = CALC_METHODS[method]?.name ?? "Kemenag (Indonesia)";
  const tz = getLocationTimezoneHours(lng);

  const times = React.useMemo(() => {
    if (!now) return null;
    return computePrayerTimes({ date: now, lat, lng, timezone: tz, method });
  }, [now, lat, lng, tz, method]);

  const next = React.useMemo(() => {
    if (!times || !now) return null;
    return getNextPrayer(times, now);
  }, [times, now]);

  const prayers = data?.today.prayers;
  const doneCount = prayers ? [prayers.fajr, prayers.dhuhr, prayers.asr, prayers.maghrib, prayers.isha].filter(Boolean).length : 0;
  const pct = Math.round((doneCount / 5) * 100);

  const history = data?.prayerHistory ?? [];

  return (
    <div>
      <ViewHeader
        title="Shalat"
        subtitle="Lacak shalat wajib lima waktu. Konsistensi adalah amal yang paling dicintai."
        icon={<Sparkles className="h-5 w-5" />}
      />

      {/* Prayer times + countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SectionCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-display text-lg font-medium">Waktu Shalat Hari Ini</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5" /> {data?.user.location ?? "Jakarta, Indonesia"} · {methodName}
              </p>
            </div>
            {next && now ? (
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Shalat berikutnya</p>
                <p className="text-display text-xl font-semibold text-primary">{next.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {formatTimeInZone(next.time, tz)} · in {formatCountdown(next.msRemaining)}
                </p>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {OBLIGATORY_PRAYERS.map((name) => {
              const time = times?.[name];
              const done = prayers?.[name.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"] ?? false;
              const isNext = next?.name === name && next.isToday;
              const past = time && now && time.getTime() < now.getTime();
              return (
                <motion.button
                  key={name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => togglePrayer.mutate({ prayer: name.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha", value: !done })}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-2xl border p-4 transition-all",
                    done ? "border-primary/40 bg-primary/8" : isNext ? "border-primary/60 bg-primary/5" : "border-border hover:bg-muted/40"
                  )}
                >
                  <span className="text-2xl">{PRAYER_ICONS[name]}</span>
                  <span className={cn("text-sm font-medium", done ? "text-primary" : "text-foreground")}>{name}</span>
                  <span className="text-arabic text-xs text-muted-foreground">{PRAYER_AR[name]}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{time ? formatTimeInZone(time, tz) : "—"}</span>
                  {done ? (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : past ? (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                  ) : isNext ? (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          {/* Sunnah */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5">
            <div>
              <p className="text-sm font-medium">Shalat sunnah hari ini</p>
              <p className="text-xs text-muted-foreground">Tahiyatul wudu, rawatib, tahajjud…</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => sunnah.mutate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted">−</button>
              <span className="tabular-nums text-display text-lg font-semibold w-8 text-center">{prayers?.sunnah ?? 0}</span>
              <button onClick={() => sunnah.mutate(1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90">+</button>
            </div>
          </div>
        </SectionCard>

        {/* Today progress */}
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <ProgressRing value={pct} size={140} strokeWidth={11}>
              <span className="text-display text-3xl font-semibold">{doneCount}</span>
              <span className="text-xs text-muted-foreground">of 5</span>
            </ProgressRing>
            <p className="text-sm font-medium mt-4">Shalat hari ini</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneCount === 5 ? "Semua shalat selesai, mashaAllah" : `${5 - doneCount} lagi`}
            </p>
            <div className="flex items-center gap-2 mt-4 rounded-lg bg-amber-500/10 px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">{data?.today.streak ?? 0} hari berturut-turut</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* History heatmap */}
      <div className="grid grid-cols-1 gap-6">
        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Riwayat Shalat</h3>
          <p className="text-sm text-muted-foreground mb-5">14 hari terakhir · hijau = selesai</p>
          <div className="overflow-x-auto scroll-slim">
            <div className="min-w-[520px]">
              {/* Header */}
              <div className="grid grid-cols-[80px_repeat(14,1fr)] gap-1.5 mb-1.5">
                <div />
                {history.map((p, i) => (
                  <div key={i} className="text-center text-[10px] text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("en-US", { weekday: "narrow" })}
                  </div>
                ))}
              </div>
              {OBLIGATORY_PRAYERS.map((name) => (
                <div key={name} className="grid grid-cols-[80px_repeat(14,1fr)] gap-1.5 mb-1.5 items-center">
                  <div className="text-xs font-medium text-muted-foreground truncate">{name}</div>
                  {history.map((p, i) => {
                    const done = p[name.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" ] as boolean;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square rounded-md transition-colors",
                          done ? "bg-emerald-500/80" : "bg-muted"
                        )}
                        title={`${name} · ${new Date(p.date).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
