"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { BarChart3, TrendingUp, Flame, BookOpen, Activity } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { useDashboard } from "@/lib/hooks";

export function AnalyticsView() {
  const { data } = useDashboard();

  const prayerHistory = (data?.prayerHistory ?? []).map((p) => ({
    day: new Date(p.date).toLocaleDateString("en-US", { weekday: "short" }),
    prayers: p.count,
    sunnah: p.sunnah,
  }));

  const quranHistory = (data?.quranHistory ?? []).map((q) => ({
    day: new Date(q.date).toLocaleDateString("en-US", { weekday: "short" }),
    pages: q.pagesRead,
    target: q.targetPages,
    minutes: q.minutesSpent,
  }));

  const habits = data?.habits ?? [];
  const radarData = habits.slice(0, 6).map((h) => ({
    subject: h.name.length > 10 ? h.name.slice(0, 10) + "…" : h.name,
    rate: Math.round((h.logs.filter((l) => l.done).length / Math.max(h.logs.length, 1)) * 100),
  }));

  const totalPrayers = prayerHistory.reduce((a, p) => a + p.prayers, 0);
  const totalPossible = prayerHistory.length * 5;
  const prayerPct = totalPossible ? Math.round((totalPrayers / totalPossible) * 100) : 0;
  const quranDays = quranHistory.filter((q) => q.pages > 0).length;
  const quranPct = quranHistory.length ? Math.round((quranDays / quranHistory.length) * 100) : 0;
  const habitLogs = habits.flatMap((h) => h.logs);
  const habitPct = habitLogs.length ? Math.round((habitLogs.filter((l) => l.done).length / habitLogs.length) * 100) : 0;

  const streakDays = data?.today.streak ?? 0;
  const kpis = [
    { label: "Konsistensi shalat", value: `${prayerPct}%`, sub: `${totalPrayers}/${totalPossible} prayers`, icon: Activity, tint: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Hari baca Quran", value: `${quranPct}%`, sub: `${quranDays}/${quranHistory.length} days`, icon: BookOpen, tint: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Penyelesaian kebiasaan", value: `${habitPct}%`, sub: `${habitLogs.filter((l) => l.done).length}/${habitLogs.length} logs`, icon: Flame, tint: "text-rose-500", bg: "bg-rose-500/10" },
    {
      label: "Runtutan saat ini",
      value: streakDays > 0 ? `${streakDays}d` : "—",
      sub: streakDays > 0 ? "prayer streak" : "start one today",
      icon: TrendingUp,
      tint: streakDays > 0 ? "text-sky-500" : "text-muted-foreground",
      bg: streakDays > 0 ? "bg-sky-500/10" : "bg-muted",
    },
  ];

  return (
    <div>
      <ViewHeader
        title="Analitik"
        subtitle="Wawasan indah tentang konsistensimu dari waktu ke waktu."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <SectionCard padded>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.bg} ${k.tint}`}><Icon className="h-4 w-4" /></span>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{k.label}</span>
                </div>
                <p className="text-display text-2xl font-semibold">{k.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
              </SectionCard>
            </motion.div>
          );
        })}
      </div>

      {/* Prayer trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Konsistensi Shalat</h3>
          <p className="text-sm text-muted-foreground mb-5">Shalat harian selesai (dari 5)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prayerHistory} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="prayerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Area type="monotone" dataKey="prayers" stroke="var(--primary)" strokeWidth={2.5} fill="url(#prayerGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Bacaan Al-Quran</h3>
          <p className="text-sm text-muted-foreground mb-5">Pages read vs target</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quranHistory} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Bar dataKey="target" fill="var(--muted)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pages" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit radar */}
        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Konsistensi Kebiasaan</h3>
          <p className="text-sm text-muted-foreground mb-5">Completion rate by habit</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Radar name="Rate" dataKey="rate" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Sunnah trend */}
        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Tren Sunnah</h3>
          <p className="text-sm text-muted-foreground mb-5">Extra prayers per day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prayerHistory} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--popover)", fontSize: 12 }} />
                <Line type="monotone" dataKey="sunnah" stroke="var(--accent-foreground)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--accent-foreground)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
