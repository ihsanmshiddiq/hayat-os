"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Minus, Bookmark, Target, Clock, Search, Headphones, ScrollText, Sparkles } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { RecitationPlayer } from "@/components/quran/recitation-player";
import { useDashboard, useUpdateQuran } from "@/lib/hooks";
import { SURAHS } from "@/lib/islamic";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function QuranView() {
  const { data } = useDashboard();
  const updateQuran = useUpdateQuran();
  const { setActiveView } = useAppStore();
  const [query, setQuery] = React.useState("");

  const quran = data?.today.quran;
  const history = data?.quranHistory ?? [];
  const pagesToday = quran?.pagesRead ?? 0;
  const target = quran?.targetPages ?? 2;
  const pct = target ? Math.min(100, Math.round((pagesToday / target) * 100)) : 0;

  const filtered = SURAHS.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.english.toLowerCase().includes(query.toLowerCase()) ||
      String(s.number).includes(query)
  );

  const totalPages = history.reduce((a, h) => a + h.pagesRead, 0);
  const totalMinutes = history.reduce((a, h) => a + h.minutesSpent, 0);

  // Resolve the current surah object (from user's last-read, fallback to Al-Fatihah)
  const currentSurah = React.useMemo(() => {
    const ls = quran?.lastSurah;
    const found = ls ? SURAHS.find((s) => s.name === ls) : undefined;
    return found ?? SURAHS[0];
  }, [quran?.lastSurah]);

  return (
    <div>
      <ViewHeader
        title="Al-Quran"
        subtitle="Baca, renungkan, dan hafalkan. Bangun hubungan harian dengan Kitabullah."
        icon={<BookOpen className="h-5 w-5" />}
      />

      {/* Tafsir / Tentang surah ini */}
      {currentSurah?.tafsir ? (
        <SectionCard className="mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-amber-500/[0.04] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row gap-5">
            <div className="sm:w-44 shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <ScrollText className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Tentang surah ini</span>
              </div>
              <p className="text-arabic text-3xl text-primary leading-none mb-2">{currentSurah.arabic}</p>
              <p className="text-display text-lg font-medium">{currentSurah.name}</p>
              <p className="text-xs text-muted-foreground">{currentSurah.english} · {currentSurah.ayahs} ayahs</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary capitalize">{currentSurah.revelation}</span>
                {currentSurah.theme ? (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">{currentSurah.theme}</span>
                ) : null}
              </div>
            </div>
            <div className="flex-1 min-w-0 sm:border-l sm:border-border/60 sm:pl-5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Tafsir · Renungan</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{currentSurah.tafsir}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {/* Recitation player — premium placement */}
      <SectionCard className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Headphones className="h-4 w-4 text-primary" />
          <h3 className="text-display text-base font-medium">Dengarkan bacaan</h3>
          <span className="text-[11px] text-muted-foreground">· Stream from Islamic Network CDN</span>
        </div>
        <RecitationPlayer initialSurah={currentSurah.number} />
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Today */}
        <SectionCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-display text-lg font-medium">Pembacaan Hari Ini</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <ProgressRing value={pct} size={80} strokeWidth={8}>
              <span className="text-sm font-semibold">{pct}%</span>
            </ProgressRing>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs text-muted-foreground mb-1">Halaman dibaca</p>
              <div className="flex items-center justify-between">
                <p className="text-display text-2xl font-semibold tabular-nums">{pagesToday}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuran.mutate({ pagesRead: Math.max(0, pagesToday - 1) })} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                  <button onClick={() => updateQuran.mutate({ pagesRead: pagesToday + 1 })} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-xs text-muted-foreground mb-1">Target harian</p>
              <div className="flex items-center justify-between">
                <p className="text-display text-2xl font-semibold tabular-nums">{target}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuran.mutate({ targetPages: Math.max(1, target - 1) })} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border hover:bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                  <button onClick={() => updateQuran.mutate({ targetPages: target + 1 })} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90"><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <Stat icon={<Bookmark className="h-3.5 w-3.5" />} label="Surah terakhir" value={quran?.lastSurah ?? "—"} />
            <Stat icon={<Target className="h-3.5 w-3.5" />} label="Terkhafal" value={`${quran?.memorizedAyahs ?? 0} ayahs`} />
            <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Waktu hari ini" value={`${quran?.minutesSpent ?? 0} min`} />
          </div>

          {/* 14-day chart */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Halaman 14 hari</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">{totalPages} pages · {totalMinutes} min</span>
            </div>
            <div className="flex items-end justify-between gap-1 h-24">
              {history.slice(-14).map((h, i) => {
                const max = Math.max(...history.map((x) => x.pagesRead), 1);
                const p = (h.pagesRead / max) * 100;
                return (
                  <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${p}%` }} transition={{ duration: 0.5, delay: i * 0.03 }} className={cn("flex-1 rounded-sm", h.pagesRead >= h.targetPages ? "bg-emerald-500/80" : "bg-emerald-500/30")} title={`${h.pagesRead} pages`} />
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* Quick log */}
        <SectionCard>
          <h3 className="text-display text-lg font-medium mb-1">Catat Cepat</h3>
          <p className="text-sm text-muted-foreground mb-4">Perbarui bacaan terakhir</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Surah terakhir</label>
              <select
                value={quran?.lastSurah ?? ""}
                onChange={(e) => updateQuran.mutate({ lastSurah: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/40 outline-none"
              >
                <option value="">Pilih surah…</option>
                {SURAHS.map((s) => (
                  <option key={s.number} value={s.name}>{s.number}. {s.name} — {s.english}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ayah terakhir</label>
              <input
                type="number"
                min={0}
                value={quran?.lastAyah ?? ""}
                onChange={(e) => updateQuran.mutate({ lastAyah: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/40 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Terkhafal ayahs (today)</label>
              <input
                type="number"
                min={0}
                value={quran?.memorizedAyahs ?? 0}
                onChange={(e) => updateQuran.mutate({ memorizedAyahs: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/40 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Waktu yang dihabiskan</label>
              <input
                type="number"
                min={0}
                value={quran?.minutesSpent ?? 0}
                onChange={(e) => updateQuran.mutate({ minutesSpent: Number(e.target.value) })}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary/40 outline-none"
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Surah index */}
      <SectionCard>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-display text-lg font-medium">Daftar Surah</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Lompat ke surah yang sedang dibaca</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari surah…"
              className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:border-primary/40 outline-none"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filtered.map((s) => (
            <button
              key={s.number}
              onClick={() => updateQuran.mutate({ lastSurah: s.name })}
              className={cn(
                "group flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all",
                quran?.lastSurah === s.name
                  ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/15"
                  : "border-border hover:border-primary/30 hover:bg-muted/40"
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                {s.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{s.english} · {s.ayahs} ayahs</p>
                {s.theme ? (
                  <span className="inline-block mt-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400 truncate max-w-full">{s.theme}</span>
                ) : null}
              </div>
              <span className="text-arabic text-lg text-primary opacity-70 group-hover:opacity-100 transition-opacity">{s.arabic}</span>
            </button>
          ))}
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-sm text-muted-foreground py-6">Surah tidak ditemukan.</p>
          ) : null}
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">{icon} {label}</div>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}
