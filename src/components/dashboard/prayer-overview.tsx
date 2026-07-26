"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, CloudSun, Check } from "lucide-react";
import { useDashboard } from "@/lib/hooks";
import {
  computePrayerTimes,
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

const PRAYER_ICONS: Record<PrayerName, React.ElementType> = {
  Fajr: CloudSun,
  Sunrise: Sunrise,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunset,
  Isha: Moon,
};

export function PrayerOverview() {
  const { data } = useDashboard();
  const now = useNow(1000);

  const lat = data?.user.latitude ?? -6.2088;
  const lng = data?.user.longitude ?? 106.8456;
  const method = (data?.user.method as CalcMethodKey | undefined) ?? "Kemenag";
  const tz = getLocationTimezoneHours(lng);

  const times = React.useMemo(() => {
    if (!now) return null;
    return computePrayerTimes({
      date: now, lat, lng,
      timezone: tz, method,
    });
  }, [now, lat, lng, tz, method]);

  const next = React.useMemo(() => {
    if (!times || !now) return null;
    return getNextPrayer(times, now);
  }, [times, now]);

  const prayers = data?.today.prayers;
  const history = data?.prayerHistory ?? [];

  const weekly = history.slice(-7);
  const weekTotal = weekly.length * 5;
  const weekDone = weekly.reduce(
    (acc, p) => acc + [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length,
    0
  );
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6 h-full"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-display text-lg font-medium tracking-tight">Ringkasan Shalat</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {next && now ? (
              <>Berikutnya: <span className="text-foreground font-medium">{next.name}</span> · {formatTimeInZone(next.time, tz)}</>
            ) : (
              "Memuat…"
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-display text-2xl font-semibold tabular-nums">{weekPct}%</p>
          <p className="text-[11px] text-muted-foreground">minggu ini</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-3">
          {OBLIGATORY_PRAYERS.map((name) => {
            const Icon = PRAYER_ICONS[name];
            const time = times?.[name];
            const done = prayers?.[name.toLowerCase() as "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"] ?? false;
            const isNext = next?.name === name && next.isToday;
            const past = time && now && time.getTime() < now.getTime();
            return (
              <li key={name} className="relative flex items-center gap-3">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors",
                    done ? "border-primary bg-primary text-primary-foreground" : isNext ? "border-primary text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-arabic text-xs text-muted-foreground">{PRAYER_AR[name]}</span>
                      {isNext ? (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">berikutnya</span>
                      ) : null}
                      {past && !done ? (
                        <span className="rounded-full bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-500">terlewat</span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {time ? formatTimeInZone(time, tz) : "—"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Konsistensi Mingguan */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Konsistensi mingguan</span>
          <span className="text-[11px] text-muted-foreground tabular-nums">{weekDone}/{weekTotal}</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-20">
          {weekly.map((p, i) => {
            const count = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length;
            const pct = (count / 5) * 100;
            const day = new Date(p.date);
            const isToday = now && day.toDateString() === new Date(now).toDateString();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "w-full rounded-md transition-colors",
                      isToday ? "bg-primary" : count === 5 ? "bg-primary/70" : count >= 3 ? "bg-primary/50" : "bg-muted-foreground/30"
                    )}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {day.toLocaleDateString("id-ID", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
          {weekly.length === 0 && (
            <div className="w-full text-center text-xs text-muted-foreground py-6">Belum ada data</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
