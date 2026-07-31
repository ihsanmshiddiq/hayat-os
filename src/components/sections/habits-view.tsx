"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Repeat, Plus, Check, Flame, Trash2, X, Heart, Activity, BookOpen, Users, Circle } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDashboard, useToggleHabit, useCreateHabit, useDeleteHabit } from "@/lib/hooks";
import { HabitIcon, habitColor } from "@/components/shared/icon-map";
import { HABIT_CATEGORIES, getHabitCategoryStyle } from "@/lib/islamic";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = ["CheckCircle", "Moon", "Sunrise", "BookOpen", "Sparkles", "Droplet", "Dumbbell", "Heart", "Leaf", "Star", "Flame", "Clock"];
const COLOR_OPTIONS = ["emerald", "amber", "rose", "sky", "violet", "cyan"];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Activity, BookOpen, Users, Circle,
};

export function HabitsView() {
  const { data } = useDashboard();
  const toggleHabit = useToggleHabit();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("CheckCircle");
  const [color, setColor] = React.useState("emerald");
  const [category, setCategory] = React.useState("general");
  const [cue, setCue] = React.useState("");
  const [reward, setReward] = React.useState("");
  const [filterCat, setFilterCat] = React.useState<string | null>(null);

  const allHabits = React.useMemo(() => data?.habits ?? [], [data?.habits]);
  const habits = React.useMemo(
    () => (filterCat ? allHabits.filter((h) => h.category === filterCat) : allHabits),
    [filterCat, allHabits]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const submit = () => {
    if (!name.trim()) return;
    createHabit.mutate({ name, icon, color, category, cue, reward });
    setName(""); setIcon("CheckCircle"); setColor("emerald"); setCategory("general"); setCue(""); setReward("");
    setOpen(false);
  };

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of allHabits) {
      const cat = h.category ?? "general";
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }, [allHabits]);

  // ----- 90-day contribution heatmap data -----
  // For each of the last 90 days, count how many habits were completed vs. total active.
  const heatmap = React.useMemo(() => {
    const days: { date: Date; done: number; total: number; intensity: number }[] = [];
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    for (let i = 89; i >= 0; i--) {
      const d = new Date(todayMidnight);
      d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      let done = 0;
      let total = 0;
      for (const h of allHabits) {
        // Only count habits that existed on that day (best-effort: include all for now)
        total += 1;
        const log = h.logs.find((l) => new Date(l.date).toDateString() === ds);
        if (log?.done) done += 1;
      }
      const intensity = total === 0 ? 0 : done / total;
      days.push({ date: d, done, total, intensity });
    }
    return days;
  }, [allHabits]);

  const heatmapStats = React.useMemo(() => {
    const activeDays = heatmap.filter((d) => d.total > 0);
    const completedDays = activeDays.filter((d) => d.done > 0).length;
    const totalDone = activeDays.reduce((a, d) => a + d.done, 0);
    const avgPerDay = activeDays.length ? totalDone / activeDays.length : 0;
    const bestDay = activeDays.reduce<{ done: number; date: Date } | null>(
      (best, d) => (!best || d.done > best.done ? { done: d.done, date: d.date } : best),
      null
    );
    return { completedDays, totalDone, avgPerDay, bestDay };
  }, [heatmap]);

  return (
    <div>
      <ViewHeader
        title="Kebiasaan"
        subtitle="Tindakan kecil, diulang setiap hari, membentuk dirimu."
        icon={<Repeat className="h-5 w-5" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Kebiasaan baru</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-display">Buat kebiasaan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Nama kebiasaan</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="misalnya Tahajjud" className="mt-1.5" />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {HABIT_CATEGORIES.map((cat) => {
                      const CatIcon = CATEGORY_ICONS[cat.icon] ?? Circle;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                            category === cat.id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          <CatIcon className="h-3 w-3" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Ikon</Label>
                  <div className="mt-1.5 grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((ic) => (
                      <button key={ic} onClick={() => setIcon(ic)} className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", icon === ic ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted")}>
                        <HabitIcon name={ic} className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Warna</Label>
                  <div className="mt-1.5 flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button key={c} onClick={() => setColor(c)} className={cn("h-8 w-8 rounded-full", habitColor(c).dot, color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/40" : "")} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Pemicu (kapan)</Label>
                  <Input value={cue} onChange={(e) => setCue(e.target.value)} placeholder="Setelah Subuh" className="mt-1.5" />
                </div>
                <div>
                  <Label>Penghargaan</Label>
                  <Input value={reward} onChange={(e) => setReward(e.target.value)} placeholder="Seketika ketenangan" className="mt-1.5" />
                </div>
                <Button onClick={submit} className="w-full">Buat kebiasaan</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Category filter row */}
      {allHabits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <button
            onClick={() => setFilterCat(null)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              filterCat === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            Semua ({allHabits.length})
          </button>
          {HABIT_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            if (count === 0) return null;
            const CatIcon = CATEGORY_ICONS[cat.icon] ?? Circle;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                  filterCat === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                )}
              >
                <CatIcon className="h-3 w-3" />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 90-day contribution heatmap */}
      {allHabits.length > 0 && (
        <SectionCard className="mb-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <p className="text-display text-base font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Konsistensi 90 Hari
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {heatmapStats.completedDays} hari aktif · {heatmapStats.totalDone} total · {heatmapStats.avgPerDay.toFixed(1)} rata-rata/hari
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Sedikit</span>
              <div className="h-3 w-3 rounded-sm bg-muted" />
              <div className="h-3 w-3 rounded-sm bg-primary/20" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/70" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>Banyak</span>
            </div>
          </div>

          <div className="overflow-x-auto scroll-slim pb-1">
            <div className="inline-grid grid-flow-col grid-rows-7 gap-[3px] min-w-fit">
              {heatmap.map((day, i) => {
                const intensity = day.intensity;
                const bg = intensity === 0
                  ? "bg-muted"
                  : intensity < 0.25
                    ? "bg-primary/20"
                    : intensity < 0.5
                      ? "bg-primary/40"
                      : intensity < 0.75
                        ? "bg-primary/70"
                        : "bg-primary";
                const label = `${day.date.toLocaleDateString("id-ID", { weekday: "short", month: "short", day: "numeric" })} — ${day.done}/${day.total} done`;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.005, 0.4), duration: 0.2 }}
                    title={label}
                    className={cn("h-3 w-3 rounded-sm hover:ring-1 hover:ring-primary hover:ring-offset-1 hover:ring-offset-background cursor-pointer transition-all", bg)}
                  />
                );
              })}
            </div>
          </div>

          {heatmapStats.bestDay && heatmapStats.bestDay.done > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-amber-500" />
                Hari terbaik: <span className="font-medium text-foreground">{heatmapStats.bestDay.done} kebiasaan</span>
                <span className="text-muted-foreground/70">·</span>
                <span>{heatmapStats.bestDay.date.toLocaleDateString("id-ID", { month: "short", day: "numeric" })}</span>
              </span>
              <span className="text-primary font-medium">
                {Math.round((heatmapStats.completedDays / 90) * 100)}% dari 90 hari terakhir
              </span>
            </div>
          )}
        </SectionCard>
      )}

      {habits.length === 0 ? (
        <SectionCard>
          <div className="text-center py-12">
            <p className="text-display text-lg font-medium">Belum ada kebiasaan</p>
            <p className="text-sm text-muted-foreground mt-1">Mulai dengan satu tindakan konsisten kecil.</p>
          </div>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {habits.map((h) => {
            const clr = habitColor(h.color);
            const catStyle = getHabitCategoryStyle(h.category ?? "general");
            const catLabel = HABIT_CATEGORIES.find((c) => c.id === (h.category ?? "general"))?.label ?? "General";
            const last7 = h.logs.slice(-7);
            const doneToday = last7.some((l) => new Date(l.date).toDateString() === today.toDateString() && l.done);
            const weekCount = last7.filter((l) => l.done).length;
            return (
              <SpotlightCard key={h.id} className="p-5">
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", clr.bg, clr.text)}>
                    <HabitIcon name={h.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{h.name}</p>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", catStyle.bg, catStyle.text)}>
                        {catLabel}
                      </span>
                    </div>
                    {h.cue ? <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1"><span className="text-primary/60">↳</span><span className="truncate">{h.cue}</span></p> : null}
                  </div>
                  <button onClick={() => deleteHabit.mutate(h.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span className="tabular-nums font-medium text-foreground">{h.streak}d</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{weekCount}/7 minggu ini</span>
                  </div>
                  <button
                    onClick={() => toggleHabit.mutate({ habitId: h.id, done: !doneToday })}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      doneToday ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" /> {doneToday ? "Selesai" : "Tandai selesai"}
                  </button>
                </div>

                {/* weekly trend */}
                <div className="flex items-center gap-1">
                  {last7.map((l, i) => (
                    <div key={i} className="flex-1">
                      <div className={cn("h-8 rounded-md", l.done ? clr.dot : "bg-muted")} />
                      <p className="text-[9px] text-center text-muted-foreground mt-1">
                        {new Date(l.date).toLocaleDateString("id-ID", { weekday: "narrow" })}
                      </p>
                    </div>
                  ))}
                </div>
                </motion.div>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
