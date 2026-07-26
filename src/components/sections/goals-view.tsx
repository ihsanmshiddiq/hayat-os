"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, Check, Flag, Calendar, Sparkles } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "ibadah", label: "Ibadah", tint: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "knowledge", label: "Pengetahuan", tint: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
  { key: "health", label: "Kesehatan", tint: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  { key: "wealth", label: "Keuangan", tint: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  { key: "relationships", label: "Relasi", tint: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  { key: "dakwah", label: "Dakwah", tint: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
];

export function GoalsView() {
  const { data } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("ibadah");
  const [milestone, setMilestone] = React.useState("");

  const goals = data?.goals ?? [];
  const active = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);

  const submit = () => {
    if (!title.trim()) return;
    createGoal.mutate({ title, category, milestone });
    setTitle(""); setCategory("ibadah"); setMilestone("");
    setOpen(false);
  };

  return (
    <div>
      <ViewHeader
        title="Tujuan"
        subtitle="Apa yang kamu bangun — dalam ibadah, ilmu, kesehatan, dan kehidupan."
        icon={<Target className="h-5 w-5" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Tujuan baru</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="text-display">Buat tujuan</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Judul tujuan</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Hafal Juz Amma" className="mt-1.5" />
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button key={c.key} onClick={() => setCategory(c.key)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium border", category === c.key ? cn(c.bg, c.text, "border-transparent") : "border-border hover:bg-muted")}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Current milestone</Label>
                  <Input value={milestone} onChange={(e) => setMilestone(e.target.value)} placeholder="Contoh: Setengah jalan An-Naba" className="mt-1.5" />
                </div>
                <Button onClick={submit} className="w-full">Buat tujuan</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Aktif" value={active.length} tint="text-primary" />
        <SummaryCard label="Selesai" value={done.length} tint="text-emerald-500" />
        <SummaryCard label="Rata-rata progres" value={`${active.length ? Math.round(active.reduce((a, g) => a + g.progress, 0) / active.length) : 0}%`} tint="text-amber-500" />
        <SummaryCard label="Kategori" value={new Set(goals.map((g) => g.category)).size} tint="text-sky-500" />
      </div>

      {active.length === 0 && done.length === 0 ? (
        <SectionCard><div className="text-center py-12"><p className="text-display text-lg font-medium">Belum ada tujuan</p><p className="text-sm text-muted-foreground mt-1">Set your first intention.</p></div></SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {active.map((g) => {
              const cat = CATEGORIES.find((c) => c.key === g.category) ?? CATEGORIES[0];
              return (
                <motion.div key={g.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <SectionCard interactive className="relative overflow-hidden">
                    {/* Decorative gradient tint by category */}
                    <div className={cn("absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-30 pointer-events-none", cat.tint)} />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", cat.bg, cat.text)}>
                            <Target className="h-4 w-4" />
                          </span>
                          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-medium", cat.bg, cat.text)}>{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateGoal.mutate({ id: g.id, body: { progress: Math.min(100, g.progress + 10) } })} className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors">+10%</button>
                          <button onClick={() => updateGoal.mutate({ id: g.id, body: { done: true } })} className="text-xs px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => deleteGoal.mutate(g.id)} className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <p className="text-display text-lg font-medium mb-1 leading-snug">{g.title}</p>
                      {g.milestone ? <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1"><Flag className="h-3 w-3 text-amber-500" /> {g.milestone}</p> : <div className="mb-3" />}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Progress</span>
                        <span className="text-sm font-semibold tabular-nums">{g.progress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={cn("h-full rounded-full relative", cat.tint)}>
                          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                        </motion.div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={g.progress}
                        onChange={(e) => updateGoal.mutate({ id: g.id, body: { progress: Number(e.target.value) } })}
                        className="w-full mt-3 accent-primary"
                      />
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {g.progress >= 100 ? "Selesai" : g.progress >= 75 ? "Hampir selesai" : g.progress >= 50 ? "Setengah jalan" : g.progress >= 25 ? "Sedang berjalan" : "Baru mulai"}
                        </span>
                        <span className="text-[10px] font-medium text-primary">{100 - g.progress}% to go</span>
                      </div>
                    </div>
                  </SectionCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {done.length > 0 ? (
        <div className="mt-8">
          <p className="text-display text-sm font-medium text-muted-foreground mb-3">Selesai · {done.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {done.map((g) => (
              <div key={g.id} className="rounded-xl border border-border/60 bg-card p-4 opacity-70">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></span>
                  <p className="text-sm font-medium line-through truncate">{g.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, tint }: { label: string; value: number | string; tint: string }) {
  return (
    <SectionCard padded>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn("text-display text-2xl font-semibold mt-1", tint)}>{value}</p>
    </SectionCard>
  );
}
