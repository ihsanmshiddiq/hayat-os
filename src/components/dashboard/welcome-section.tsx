"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles, Sunrise, Target, TrendingUp, BookOpen } from "lucide-react";
import { useDashboard } from "@/lib/hooks";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicGeometricPattern, AnimatedGradientBorder } from "@/components/shared/islamic-pattern";
import {
  computePrayerTimes,
  formatCountdown,
  formatTimeInZone,
  getDailyMotivation,
  getHijriDate,
  getNextPrayer,
  getLocationTimezoneHours,
  getVerseOfTheDay,
  greetingByHour,
  CALC_METHODS,
} from "@/lib/islamic";
import { useNow } from "@/hooks/use-now";

type CalcMethodKey = keyof typeof CALC_METHODS;

export function WelcomeSection() {
  const { data } = useDashboard();
  const now = useNow(1000);

  const name = data?.user.name ?? "sahabat";
  const lat = data?.user.latitude ?? -6.2088;
  const lng = data?.user.longitude ?? 106.8456;
  const method = (data?.user.method as CalcMethodKey | undefined) ?? "Kemenag";
  const tz = getLocationTimezoneHours(lng);
  const greeting = now ? greetingByHour(now, tz) : "Assalamu'alaikum";
  const hijri = now ? getHijriDate(new Date(now.getTime() + tz * 3600000)) : null;

  const next = (() => {
    if (!now) return null;
    const times = computePrayerTimes({
      date: now, lat, lng,
      timezone: tz, method,
    });
    const base = getNextPrayer(times, now);
    if (base.isToday) return base;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tt = computePrayerTimes({ date: tomorrow, lat, lng, timezone: tz, method });
    return { name: "Fajr" as const, time: tt.Fajr, isToday: false, msRemaining: tt.Fajr.getTime() - now.getTime() };
  })();

  const verse = now ? getVerseOfTheDay(new Date(now.getTime() + tz * 3600000)) : getVerseOfTheDay();

  const stats = [
    {
      label: "Runtutan saat ini",
      value: data?.today.streak ?? 0,
      suffix: "hari",
      icon: Flame,
      tint: "text-amber-500",
      bg: "bg-amber-500/10",
      animate: true,
    },
    {
      label: "Penyelesaian hari ini",
      value: data?.today.completion.percent ?? 0,
      suffix: "%",
      icon: TrendingUp,
      tint: "text-primary",
      bg: "bg-primary/10",
      animate: true,
    },
    {
      label: "Fokus hari ini",
      value: data?.today.focus ?? "—",
      suffix: "",
      icon: Target,
      tint: "text-rose-500",
      bg: "bg-rose-500/10",
      isText: true,
    },
    {
      label: "Shalat berikutnya",
      value: next ? formatCountdown(next.msRemaining) : "—",
      suffix: next ? `· ${next.name}` : "",
      icon: Sunrise,
      tint: "text-sky-500",
      bg: "bg-sky-500/10",
      isText: true,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft"
    >
      <div className="absolute inset-0 hero-glow opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid opacity-[0.5] pointer-events-none" />
      <IslamicGeometricPattern className="text-primary" opacity={0.04} size={72} strokeWidth={0.8} />

      <div className="relative p-7 sm:p-10">
        <div className="flex flex-col gap-1.5">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {hijri ? hijri.formattedLong : "—"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-display text-3xl sm:text-4xl font-medium tracking-tight"
          >
            {greeting},{" "}
            <span className="text-primary">{name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-[15px] text-muted-foreground max-w-xl leading-relaxed"
          >
            {getDailyMotivation()}
          </motion.p>
        </div>

        {/* Ayat Hari Ini */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="mt-6"
        >
          <AnimatedGradientBorder className="block">
            <div className="relative flex items-center gap-4 rounded-2xl bg-primary/5 p-4 sm:p-5">
              <div className="shrink-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-1">Ayat Hari Ini</p>
                <p className="text-arabic text-lg sm:text-xl text-primary leading-relaxed text-right mb-1.5">
                  {verse.arabic}
                </p>
                <p className="text-sm text-foreground/80 italic leading-relaxed">&ldquo;{verse.translation}&rdquo;</p>
                <p className="text-[11px] text-muted-foreground mt-1">— {verse.reference} · Terjemahan Kemenag RI</p>
              </div>
            </div>
          </AnimatedGradientBorder>
        </motion.div>

        {/* Statistik */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group relative rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-border hover:bg-background/80"
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.bg}`}>
                    <Icon className={`h-4 w-4 ${s.tint}`} />
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  {s.animate ? (
                    <AnimatedNumber
                      value={s.value as number}
                      className={`text-display font-semibold tracking-tight ${s.isText ? "text-lg" : "text-2xl"}`}
                    />
                  ) : (
                    <span className={`text-display font-semibold tracking-tight ${s.isText ? "text-lg" : "text-2xl"}`}>
                      {s.value}
                    </span>
                  )}
                  {s.suffix ? (
                    <span className="text-xs text-muted-foreground truncate">{s.suffix}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </motion.div>

        {next && now ? (
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {next.name} pukul {formatTimeInZone(next.time, tz)} ·{" "}
            <span className="text-foreground/80">{formatCountdown(next.msRemaining)}</span> lagi
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}
