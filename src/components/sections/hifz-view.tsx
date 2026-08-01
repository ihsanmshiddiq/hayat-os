"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  Search,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Loader,
  Circle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Flame,
  Plus,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import {
  IslamicPatternMoroccan,
  IslamicPatternArabesque,
} from "@/components/shared/islamic-pattern";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useHifz,
  useUpdateHifz,
  type HifzStatus,
  type HifzSurahItem,
} from "@/lib/hooks";
import { HIFZ_STATUS_META } from "@/lib/islamic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FILTERS: { id: HifzStatus | "all"; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "memorized", label: "Terkhafal" },
  { id: "in_progress", label: "Menghafal" },
  { id: "needs_review", label: "Perlu Diulang" },
  { id: "not_started", label: "Belum Dimulai" },
];

const REVELATION_FILTERS = [
  { id: "all", label: "Semua" },
  { id: "meccan", label: "Makkiyah" },
  { id: "medinan", label: "Madaniyah" },
] as const;

function StatusIcon({
  status,
  className,
}: {
  status: HifzStatus;
  className?: string;
}) {
  switch (status) {
    case "memorized":
      return <Check className={className} />;
    case "in_progress":
      return <Loader className={className} />;
    case "needs_review":
      return <AlertCircle className={className} />;
    default:
      return <Circle className={className} />;
  }
}

export function HifzView() {
  const { data, isLoading } = useHifz();
  const update = useUpdateHifz();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<HifzStatus | "all">(
    "all",
  );
  const [revFilter, setRevFilter] =
    React.useState<(typeof REVELATION_FILTERS)[number]["id"]>("all");
  const [selected, setSelected] = React.useState<HifzSurahItem | null>(null);

  const stats = data?.stats;
  const firstNewSurah = data?.surahs.find((surah) => surah.status === "not_started") ?? data?.surahs[0];

  const filtered = React.useMemo(() => {
    if (!data) return [];
    return data.surahs.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (revFilter !== "all" && s.revelation !== revFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !s.english.toLowerCase().includes(q) &&
          !String(s.number).includes(q)
        )
          return false;
      }
      return true;
    });
  }, [data, statusFilter, revFilter, query]);

  const handleStatusChange = (surah: HifzSurahItem, status: HifzStatus) => {
    update.mutate(
      { surahNumber: surah.number, status },
      {
        onSuccess: () => {
          toast.success(`${surah.name} → ${HIFZ_STATUS_META[status].label}`);
          // Update selected dialog if open
          setSelected((prev) =>
            prev && prev.number === surah.number ? { ...prev, status } : prev,
          );
        },
      },
    );
  };

  const handleMarkReviewed = (surah: HifzSurahItem) => {
    update.mutate(
      { surahNumber: surah.number, reviewed: true },
      {
        onSuccess: () => {
          toast.success(`${surah.name} ditandai sudah diulang hari ini`);
          setSelected((prev) =>
            prev && prev.number === surah.number
              ? {
                  ...prev,
                  lastReviewed: new Date().toISOString(),
                  daysUntilReview: 30,
                }
              : prev,
          );
        },
      },
    );
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <ViewHeader
          title="Hifz Al-Quran"
          subtitle="Lacak progres menghafal dan jadwal Murajaah untuk semua 114 surah."
          icon={<BookMarked className="h-5 w-5" />}
          badge={
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {stats?.memorizedSurahs ?? 0} / 114 Terkhafal
            </span>
          }
          action={
            <button
              type="button"
              onClick={() => setSelected(firstNewSurah ?? null)}
              disabled={!firstNewSurah}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah hafalan</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          }
        />

        {/* Hero stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall progress card with animated gradient border */}
          <SectionCard className="lg:col-span-2 relative overflow-hidden">
            <IslamicPatternMoroccan className="text-primary" opacity={0.05} />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <ProgressRing
                value={stats?.percentQuran ?? 0}
                size={140}
                strokeWidth={12}
              >
                <div className="text-center">
                  <p className="text-display text-2xl font-semibold tabular-nums">
                    <AnimatedNumber
                      value={stats?.percentQuran ?? 0}
                      decimals={1}
                    />
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    dari Al-Quran
                  </p>
                </div>
              </ProgressRing>
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <h3 className="text-display text-lg font-medium">
                    Perjalanan Menghafal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stats?.totalMemorizedAyahs.toLocaleString() ?? 0} dari{" "}
                    {stats?.totalQuranAyahs.toLocaleString() ?? 6236} ayat
                    Terkhafal
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-center">
                    <p className="text-display text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      <AnimatedNumber value={stats?.memorizedSurahs ?? 0} />
                    </p>
                    <p className="text-[10px] text-muted-foreground">Surah</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 px-3 py-2 text-center">
                    <p className="text-display text-lg font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      <AnimatedNumber value={stats?.inProgress ?? 0} />
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Sedang Proses
                    </p>
                  </div>
                  <div className="rounded-xl bg-rose-500/10 px-3 py-2 text-center">
                    <p className="text-display text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                      <AnimatedNumber value={stats?.needsReview ?? 0} />
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Perlu Diulang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Murajaah card */}
          <SectionCard className="relative overflow-hidden">
            <IslamicPatternArabesque
              className="text-amber-500"
              opacity={0.06}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <RotateCcw className="h-4 w-4" />
                  </span>
                  <h3 className="text-display text-base font-medium">
                    Murajaah
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Perlu diulang
                  </span>
                  <span className="text-display text-2xl font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                    <AnimatedNumber value={stats?.dueForReview ?? 0} />
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sudah diulang minggu ini
                  </span>
                  <span className="text-display text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <AnimatedNumber value={stats?.reviewedThisWeek ?? 0} />
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                  {stats && stats.dueForReview > 0
                    ? `${stats.dueForReview} surah${stats.dueForReview === 1 ? "" : "s"} perlu diulang. Buka salah satu untuk memulai.`
                    : "Semua sudah diulang. Pertahankan jadwalmu — setiap 30 hari per surah."}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Filters */}
        <SectionCard padded={false} className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari surah berdasarkan nama atau nomor..."
                className="pl-9"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    statusFilter === f.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
              <span className="mx-1 h-4 w-px bg-border" />
              {REVELATION_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRevFilter(f.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    revFilter === f.id
                      ? "bg-foreground text-background"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 114-Surah Peta Menghafal — compact at-a-glance grid */}
        {!isLoading && data && (
          <SectionCard padded={false} className="overflow-hidden">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookMarked className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="text-display text-sm font-medium">
                    Peta Menghafal
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Semua 114 surah sekilas
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
                {[
                  { label: "Terkhafal", cls: "bg-emerald-500" },
                  { label: "Sedang Proses", cls: "bg-amber-500" },
                  { label: "Perlu Diulang", cls: "bg-rose-500" },
                  { label: "Belum Dimulai", cls: "bg-muted-foreground/30" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-sm", l.cls)} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4">
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(28px, 1fr))",
                }}
              >
                {data.surahs.map((surah, i) => {
                  const meta = HIFZ_STATUS_META[surah.status];
                  const isOverdue =
                    surah.status === "memorized" && surah.daysUntilReview <= 0;
                  return (
                    <Tooltip key={surah.number}>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(i * 0.003, 0.3) }}
                          onClick={() => setSelected(surah)}
                          className={cn(
                            "relative h-7 w-7 rounded-md transition-all hover:scale-110 hover:z-10 hover:ring-2 hover:ring-primary/40",
                            surah.status === "memorized" &&
                              "bg-emerald-500/80 hover:bg-emerald-500",
                            surah.status === "in_progress" &&
                              "bg-amber-500/80 hover:bg-amber-500",
                            surah.status === "needs_review" &&
                              "bg-rose-500/80 hover:bg-rose-500",
                            surah.status === "not_started" &&
                              "bg-muted-foreground/20 hover:bg-muted-foreground/30",
                          )}
                          aria-label={`Surah ${surah.number}: ${surah.name} — ${meta.label}`}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white tabular-nums">
                            {surah.number}
                          </span>
                          {isOverdue && (
                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 ring-1 ring-background animate-pulse" />
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <div className="text-center">
                          <p className="font-medium">
                            {surah.number}. {surah.name}
                          </p>
                          <p className="text-arabic text-base leading-tight">
                            {surah.arabic}
                          </p>
                          <p className="text-muted-foreground text-[10px]">
                            {surah.ayahs} ayat ·{" "}
                            {surah.revelation === "meccan"
                              ? "Makkiyah"
                              : "Madaniyah"}{" "}
                            · {meta.label}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Surah grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((surah, i) => {
              const meta = HIFZ_STATUS_META[surah.status];
              const isMenghafal = surah.status === "in_progress";
              const progress = isMenghafal
                ? (surah.memorizedAyahs / surah.ayahs) * 100
                : surah.status === "memorized"
                  ? 100
                  : 0;
              const isOverdue =
                surah.status === "memorized" && surah.daysUntilReview <= 0;
              return (
                <SpotlightCard
                  key={surah.number}
                  onClick={() => setSelected(surah)}
                  className="p-3 text-left cursor-pointer"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.012, 0.3) }}
                    className={cn(
                      "relative",
                      surah.status === "memorized" && "bg-emerald-500/5",
                      surah.status === "in_progress" && "bg-amber-500/5",
                      surah.status === "needs_review" && "bg-rose-500/5",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">
                        {String(surah.number).padStart(3, "0")}
                      </span>
                      <StatusIcon
                        status={surah.status}
                        className={cn("h-3.5 w-3.5", meta.color)}
                      />
                    </div>
                    <p className="text-arabic text-lg leading-none mb-1.5 text-foreground">
                      {surah.arabic}
                    </p>
                    <p className="text-xs font-medium truncate">{surah.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {surah.ayahs} ayat
                      </span>
                      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                        {surah.revelation === "meccan" ? "Mk" : "Md"}
                      </span>
                    </div>
                    {/* Progress bar for in-progress */}
                    {isMenghafal && (
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-amber-500"
                        />
                      </div>
                    )}
                    {/* Overdue indicator */}
                    {isOverdue && (
                      <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </motion.div>
                </SpotlightCard>
              );
            })}
          </div>
        )}

        {/* Surah detail modal */}
        <AnimatePresence>
          {selected && (
            <SurahDetailModal
              surah={selected}
              onClose={() => setSelected(null)}
              onStatusChange={handleStatusChange}
              onMarkReviewed={handleMarkReviewed}
              isUpdating={update.isPending}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function SurahDetailModal({
  surah,
  onClose,
  onStatusChange,
  onMarkReviewed,
  isUpdating,
}: {
  surah: HifzSurahItem;
  onClose: () => void;
  onStatusChange: (s: HifzSurahItem, status: HifzStatus) => void;
  onMarkReviewed: (s: HifzSurahItem) => void;
  isUpdating: boolean;
}) {
  const meta = HIFZ_STATUS_META[surah.status];
  const progress =
    surah.status === "memorized"
      ? 100
      : (surah.memorizedAyahs / surah.ayahs) * 100;
  const isOverdue = surah.status === "memorized" && surah.daysUntilReview <= 0;
  const reviewDate = surah.lastReviewed
    ? new Date(surah.lastReviewed).toLocaleDateString("id-ID", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 12 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
        className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-premium overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden">
          <IslamicPatternMoroccan className="text-primary" opacity={0.06} />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Surah {surah.number} ·{" "}
                {surah.revelation === "meccan" ? "Makkiyah" : "Madaniyah"} ·{" "}
                {surah.ayahs} ayat
              </p>
              <h2 className="text-display text-2xl font-medium">
                {surah.name}
              </h2>
              <p className="text-sm text-muted-foreground">{surah.english}</p>
              <p className="text-arabic text-3xl mt-2 text-foreground">
                {surah.arabic}
              </p>
            </div>
            <ProgressRing value={progress} size={68} strokeWidth={6}>
              <span className="text-xs font-semibold tabular-nums">
                {Math.round(progress)}%
              </span>
            </ProgressRing>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status pills */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Status Menghafal
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(HIFZ_STATUS_META) as HifzStatus[]).map((s) => {
                const m = HIFZ_STATUS_META[s];
                const active = surah.status === s;
                return (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => onStatusChange(surah, s)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      active
                        ? cn(
                            m.bg,
                            m.ring,
                            "ring-1",
                            m.color,
                            "border-transparent",
                          )
                        : "border-border/70 bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <StatusIcon status={s} className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Terkhafal
              </p>
              <p className="text-display text-lg font-semibold tabular-nums">
                {surah.memorizedAyahs}
              </p>
              <p className="text-[10px] text-muted-foreground">
                dari {surah.ayahs}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Terakhir Diulang
              </p>
              <p className="text-display text-sm font-semibold">
                {reviewDate ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {surah.lastReviewed ? "yang lalu" : "belum"}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Ulangan Berikutnya
              </p>
              <p
                className={cn(
                  "text-display text-sm font-semibold tabular-nums",
                  isOverdue
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground",
                )}
              >
                {surah.lastReviewed
                  ? surah.daysUntilReview <= 0
                    ? "Terlambat"
                    : `${surah.daysUntilReview}d`
                  : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {surah.lastReviewed
                  ? isOverdue
                    ? "ulang sekarang"
                    : "sampai jatuh tempo"
                  : "belum dimulai"}
              </p>
            </div>
          </div>

          {/* Mark reviewed button */}
          {surah.status !== "not_started" && (
            <button
              disabled={isUpdating}
              onClick={() => onMarkReviewed(surah)}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <RotateCcw className="h-4 w-4" />
              Tandai sudah diulang hari ini
            </button>
          )}

          {/* Virtue quote */}
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nabi ﷺ bersabda:{" "}
                  <span className="italic">
                    "Orang yang mahir dalam Al-Quran akan bersama para malaikat
                    yang mulia dan taat, dan orang yang membaca Al-Quran dengan
                    kesulitan tapi terus berusaha, akan mendapatkan dua pahala."
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  — Sahih al-Bukhari & Muslim
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
