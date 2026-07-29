"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Sparkles, Target, TrendingUp, Calendar, Flame, Plus,
  Check, ChevronRight, X, Trophy, Clock, BookMarked, Zap,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicGeometricPattern } from "@/components/shared/islamic-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  useKhatma, useCreateKhatma, useUpdateKhatma, useDeleteKhatma,
  type KhatmaActive, type KhatmaHistoryItem,
} from "@/lib/hooks";
import { useUpdateQuran } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const SCOPE_OPTIONS: {
  key: string;
  label: string;
  description: string;
  pages: number;
  recommendedDays: number;
  arabic: string;
}[] = [
  { key: "full_quran", label: "Al-Quran Penuh", description: "Semua 604 halaman, Khatma lengkap", pages: 604, recommendedDays: 30, arabic: "القرآن كاملاً" },
  { key: "juz_amma", label: "Juz Amma", description: "Juz ke-30 — surah pendek", pages: 22, recommendedDays: 7, arabic: "جزء عمَّ" },
  { key: "last_30", label: "30 Halaman Terakhir", description: "Tahap akhir Al-Quran", pages: 30, recommendedDays: 10, arabic: "آخر ثلاثون صفحة" },
  { key: "first_5_juz", label: "5 Juz Pertama", description: "Dari Al-Fatihah sampai An-Nisa", pages: 100, recommendedDays: 14, arabic: "أول خمسة أجزاء" },
  { key: "al_kahf", label: "Surah Al-Kahf", description: "Al-Kahf — 12 halaman", pages: 12, recommendedDays: 4, arabic: "سورة الكهف" },
  { key: "al_mulk", label: "Surah Al-Mulk", description: "Al-Mulk — 3 halaman", pages: 3, recommendedDays: 1, arabic: "سورة الملك" },
];

export function KhatmaView() {
  const { data, isLoading } = useKhatma();
  const active = data?.active ?? null;
  const history = data?.history ?? [];

  return (
    <div>
      <ViewHeader
        title="Khatma"
        subtitle="Tetapkan target baca Al-Quran. Bangun kebiasaan harian yang menyelesaikan Kitabullah."
        icon={<BookOpen className="h-5 w-5" />}
        action={active ? <NewPlanDialog triggerLabel="Rencana baru" /> : undefined}
      />

      {!active ? (
        <EmptyState />
      ) : (
        <>
          <ActivePlanHero plan={active} />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-6">
            <JuzProgressGrid plan={active} />
            <DailyPaceCard plan={active} />
          </div>
          {history.length > 0 ? (
            <div className="mt-6">
              <PlanHistory history={history} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ---------------- Empty State ---------------- */

function EmptyState() {
  return (
    <SectionCard className="relative overflow-hidden">
      <IslamicGeometricPattern className="text-primary" opacity={0.05} size={64} />
      <div className="relative text-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-4 ring-primary/5"
        >
          <BookOpen className="h-8 w-8 text-primary" />
        </motion.div>
        <h3 className="text-display text-2xl font-medium mb-2">Mulai Perjalanan Khatma</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          <span className="font-medium text-foreground">Khatma</span> adalah pembacaan lengkap
          Al-Quran dari awal sampai akhir. Tetapkan target, pilih ritmemu, dan bangun hubungan harian
          dengan kalamullah ﷻ.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>"Siapa yang membaca satu huruf dari Kitabullah, maka baginya satu kebaikan, dan setiap kebaikan dilipatgandakan sepuluh kali." — Tirmidzi</span>
        </div>
        <NewPlanDialog triggerLabel="Buat Khatma pertamamu" />
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        {[
          { icon: Target, title: "Tetapkan target", text: "Pilih Al-Quran penuh, Juz Amma, atau surah tertentu" },{icon: TrendingUp, title: "Lacak kecepatan harian", text: "Lihat runtutan bacaan dan proyeksi penyelesaian" },
          { icon: Trophy, title: "Selesaikan dengan barakah", text: "Selesaikan dengan peta progres 30 Juz yang indah" },
        ].map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              className="rounded-xl border border-border/60 bg-background/60 p-4 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium mb-1">{f.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{f.text}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/* ---------------- Active Plan Hero ---------------- */

function ActivePlanHero({ plan }: { plan: KhatmaActive }) {
  const completionPct = plan.completionPct;
  const onPace = plan.onPace;
  const startDateStr = new Date(plan.startDate).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" });
  const projectedEndStr = new Date(plan.projectedEndDate).toLocaleDateString("id-ID", { month: "short", day: "numeric" });

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-soft"
    >
      <IslamicGeometricPattern className="text-primary" opacity={0.06} size={56} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-amber-500/[0.04] pointer-events-none" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Progress ring */}
          <div className="flex flex-col items-center sm:items-start">
            <ProgressRing value={completionPct} size={132} strokeWidth={10}>
              <div className="text-center">
                <AnimatedNumber value={completionPct} className="text-display text-3xl font-semibold tabular-nums" suffix="%" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">selesai</p>
              </div>
            </ProgressRing>
            <div className="mt-3 flex items-center gap-2">
              {onPace ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> Tepat waktu
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Zap className="h-3 w-3" /> Kejar
                </span>
              )}
              {plan.streak > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <Flame className="h-3 w-3" /> {plan.streak} hari berturut
                </span>
              ) : null}
            </div>
          </div>

          {/* Plan info & stats */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2 mb-1">
              <h2 className="text-display text-2xl font-medium">{plan.name}</h2>
              <span className="text-xs text-muted-foreground capitalize">
                · {plan.scope.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Dimulai {startDateStr}
              {" · "}
              {plan.pagesReadSinceStart} / {plan.totalPages} halaman dibaca
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                icon={<BookMarked className="h-3.5 w-3.5" />}
                label="Target hari ini"
                value={`${plan.dailyTarget}`}
                unit="halaman"
                tone="primary"
              />
              <StatTile
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="Rata-rata"
                value={`${plan.avgPacePerDay}`}
                unit="halaman/hari"
                tone={onPace ? "primary" : "amber"}
              />
              <StatTile
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Hari tersisa"
                value={`${plan.daysRemaining}`}
                unit={"/ " + plan.targetDays + "d"}
                tone="teal"
              />
              <StatTile
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Perkiraan selesai"
                value={projectedEndStr}
                unit=""
                tone="rose"
              />
            </div>

            {/* Daily progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Progres keseluruhan</span>
                <span className="font-medium tabular-nums">{plan.pagesReadSinceStart} / {plan.totalPages} halaman</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function StatTile({ icon, label, value, unit, tone }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  tone: "primary" | "amber" | "teal" | "rose";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
      <div className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium mb-1.5", toneClass)}>
        {icon} {label}
      </div>
      <p className="text-display text-lg font-semibold tabular-nums leading-none">{value}</p>
      {unit ? <p className="text-[10px] text-muted-foreground mt-1">{unit}</p> : null}
    </div>
  );
}

/* ---------------- 30-Juz Progress Grid ---------------- */

function JuzProgressGrid({ plan }: { plan: KhatmaActive }) {
  const juz = plan.juzProgress;
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-display text-lg font-medium">Peta Menghafal</h3>
          <p className="text-xs text-muted-foreground mt-0.5">30 Juz · progres visual melalui Al-Quran</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-muted" /> Belum dibaca</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/40" /> Sedang berlangsung</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" /> Selesai</span>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {juz.map((j, i) => {
          const pct = j.pct;
          const complete = pct >= 100;
          const inProgress = pct > 0 && pct < 100;
          return (
            <motion.div
              key={j.juz}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.012, 0.4), duration: 0.3 }}
              whileHover={{ scale: 1.08, zIndex: 10 }}
              onHoverStart={() => setHovered(j.juz)}
              onHoverEnd={() => setHovered(null)}
              className={cn(
                "relative aspect-square rounded-lg border flex flex-col items-center justify-center cursor-default transition-colors",
                complete
                  ? "bg-primary border-primary text-primary-foreground"
                  : inProgress
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-muted/40 border-border text-muted-foreground"
              )}
            >
              <span className="text-[11px] font-semibold tabular-nums">{j.juz}</span>
              {complete ? (
                <Check className="h-3 w-3 mt-0.5" />
              ) : inProgress ? (
                <span className="text-[9px] tabular-nums mt-0.5">{pct}%</span>
              ) : null}

              {hovered === j.juz ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[10px] shadow-soft"
                >
                  <p className="font-medium">Juz {j.juz}</p>
                  <p className="text-muted-foreground tabular-nums">{j.pagesRead} / {j.totalPages} halaman</p>
                </motion.div>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="mt-5 pt-4 border-t border-border/60 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-display text-xl font-semibold tabular-nums text-primary">
            {juz.filter(j => j.pct >= 100).length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Juz selesai</p>
        </div>
        <div>
          <p className="text-display text-xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
            {juz.filter(j => j.pct > 0 && j.pct < 100).length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Sedang berlangsung</p>
        </div>
        <div>
          <p className="text-display text-xl font-semibold tabular-nums text-muted-foreground">
            {juz.filter(j => j.pct === 0).length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Belum mulai</p>
        </div>
      </div>
    </SectionCard>
  );
}

/* ---------------- Daily Pace Card ---------------- */

function DailyPaceCard({ plan }: { plan: KhatmaActive }) {
  const history = plan.dailyHistory;
  const maxPages = Math.max(...history.map((h) => h.pagesRead), plan.dailyTarget, 1);

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-display text-lg font-medium">Kecepatan Harian</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{history.length} hari terakhir vs target</p>
        </div>
        {plan.streak > 0 ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2 py-1 text-rose-600 dark:text-rose-400">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold tabular-nums">{plan.streak}</span>
          </div>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-1 h-32 mb-3">
        {history.length === 0 ? (
          <div className="w-full text-center text-xs text-muted-foreground py-12">Belum ada catatan bacaan.</div>
        ) : (
          history.map((h, i) => {
            const pct = (h.pagesRead / maxPages) * 100;
            const targetPct = (h.target / maxPages) * 100;
            const met = h.met;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* target line */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-amber-500/40"
                  style={{ bottom: `${targetPct}%` }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${pct}%` }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "w-full rounded-sm transition-colors",
                    met ? "bg-primary/80" : h.pagesRead > 0 ? "bg-primary/40" : "bg-muted"
                  )}
                />
                {/* tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] shadow-soft pointer-events-none">
                  <p className="font-medium tabular-nums">{h.pagesRead} / {h.target} halaman</p>
                  <p className="text-muted-foreground">{new Date(h.date).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{history.length > 0 ? new Date(history[0].date).toLocaleDateString("id-ID", { month: "short", day: "numeric" }) : "—"}</span>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/80" /> Tercapai</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/40" /> Kurang</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm border border-dashed border-amber-500/60" /> Target</span>
        </div>
        <span>{history.length > 0 ? new Date(history[history.length - 1].date).toLocaleDateString("id-ID", { month: "short", day: "numeric" }) : "—"}</span>
      </div>

      {/* Today's quick log */}
      <TodayQuickLog dailyTarget={plan.dailyTarget} />
    </SectionCard>
  );
}

function TodayQuickLog({ dailyTarget }: { dailyTarget: number }) {
  const updateQuran = useUpdateQuran();
  const [pages, setPages] = React.useState("");

  const log = () => {
    const n = Number(pages);
    if (!n || n <= 0) return;
    updateQuran.mutate({ pagesRead: n });
    setPages("");
  };

  return (
    <div className="mt-5 pt-4 border-t border-border/60">
      <div className="flex items-center gap-2 mb-2">
        <Plus className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Catat halaman hari ini
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder={`misalnya ${dailyTarget}`}
          className="h-9 tabular-nums"
          onKeyDown={(e) => e.key === "Enter" && log()}
        />
        <Button onClick={log} disabled={!pages || updateQuran.isPending} className="h-9 gap-1.5 shrink-0">
          {updateQuran.isPending ? <Clock className="h-3.5 w-3.5 animate-pulse" /> : <BookOpen className="h-3.5 w-3.5" />}
          Catat
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Riwayat Rencana ---------------- */

function PlanHistory({ history }: { history: KhatmaHistoryItem[] }) {
  const updateKhatma = useUpdateKhatma();
  const deleteKhatma = useDeleteKhatma();

  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-display text-lg font-medium">Riwayat Rencana</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Rencana Khatma sebelumnya dan alternatif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="group rounded-xl border border-border/60 bg-background/60 p-4 hover:border-primary/30 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{p.scope.replace(/_/g, " ")}</p>
              </div>
              {p.completedAt ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <Trophy className="h-2.5 w-2.5" />Selesai</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Dijeda
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><BookMarked className="h-3 w-3" /> {p.totalPages} halaman</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.targetDays}d</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(p.startDate).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => updateKhatma.mutate({ id: p.id, isActive: true })}
                disabled={updateKhatma.isPending}
              >
                Lanjutkan
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-muted-foreground hover:text-rose-500"
                onClick={() => deleteKhatma.mutate(p.id)}
                disabled={deleteKhatma.isPending}
              >
                Hapus
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------------- New Plan Dialog ---------------- */

function NewPlanDialog({ triggerLabel }: { triggerLabel: string }) {
  const [open, setOpen] = React.useState(false);
  const [scope, setScope] = React.useState("full_quran");
  const [dailyTarget, setDailyTarget] = React.useState(20);
  const [name, setName] = React.useState("");
  const createKhatma = useCreateKhatma();

  const selectedScope = SCOPE_OPTIONS.find((s) => s.key === scope) ?? SCOPE_OPTIONS[0];

  // Auto-set recommended daily target based on scope
  React.useEffect(() => {
    const s = SCOPE_OPTIONS.find((x) => x.key === scope);
    if (s) {
      setDailyTarget(Math.max(1, Math.ceil(s.pages / s.recommendedDays)));
      setName(s.label);
    }
  }, [scope]);

  const targetDays = Math.max(1, Math.ceil(selectedScope.pages / dailyTarget));

  const submit = () => {
    createKhatma.mutate({
      name: name.trim() || selectedScope.label,
      scope,
      dailyTarget,
      targetDays,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-display">Rencana Khatma Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Scope selector */}
          <div>
            <Label className="mb-2 block">Pilih cakupan</Label>
            <div className="grid grid-cols-2 gap-2">
              {SCOPE_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setScope(s.key)}
                  className={cn(
                    "group relative rounded-xl border p-3 text-left transition-all",
                    scope === s.key
                      ? "border-primary bg-primary/[0.04] ring-1 ring-primary/15"
                      : "border-border hover:border-primary/30 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{s.label}</p>
                    {scope === s.key ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">{s.pages} halaman</span>
                    <span className="text-arabic text-xs text-primary/70">{s.arabic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label>Nama rencana</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={selectedScope.label} className="mt-1.5" />
          </div>

          {/* Daily target */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Target harian</Label>
              <span className="text-xs text-muted-foreground">
                Perkiraan selesai: <span className="font-medium text-foreground tabular-nums">{targetDays} hari</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={60}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <div className="w-20 shrink-0 rounded-lg border border-border px-3 py-2 text-center">
                <span className="text-display text-base font-semibold tabular-nums">{dailyTarget}</span>
                <span className="text-[10px] text-muted-foreground ml-1">/hari</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Dengan {dailyTarget} halaman/hari, kamu akan menyelesaikan {selectedScope.label} dalam sekitar{" "}
              <span className="font-medium text-foreground">{targetDays} hari</span> ({selectedScope.pages} halaman total).
            </p>
          </div>

          <Button onClick={submit} className="w-full gap-2" disabled={createKhatma.isPending}>
            {createKhatma.isPending ? <Clock className="h-4 w-4 animate-pulse" /> : <Sparkles className="h-4 w-4" />}
            Mulai Khatma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
