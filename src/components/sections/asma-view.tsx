"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem, Search, X, Sparkles, BookOpen, Heart, Copy, Check, ChevronLeft, ChevronRight,
  CheckCircle2, Filter, Volume2, Loader2,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Input } from "@/components/ui/input";
import {
  ASMA_UL_HUSNA,
  getNameOfDay,
  type DivineName,
} from "@/lib/islamic";
import { useTTS } from "@/hooks/use-tts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIERS = [
  { label: "All", range: [1, 99] as const },
  { label: "1\u201325", range: [1, 25] as const },
  { label: "26\u201350", range: [26, 50] as const },
  { label: "51\u201375", range: [51, 75] as const },
  { label: "76\u201399", range: [76, 99] as const },
];

function getMotivationalMessage(percent: number): string {
  if (percent >= 100) return "Alhamdulillah, selesai!";
  if (percent >= 75) return "Hampir sampai!";
  if (percent >= 50) return "Subhan'Allah, halfway there!";
  if (percent >= 25) return "Masha'Allah!";
  return "Teruskan!";
}

export function AsmaView() {
  const [query, setQuery] = React.useState("");
  const [tier, setTier] = React.useState<string>("All");
  const [selected, setSelected] = React.useState<DivineName | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [showMemorizedOnly, setShowMemorizedOnly] = React.useState(false);

  const [favorites, setFavorits] = React.useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem("hayat-asma-favorites");
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const [memorized, setMemorized] = React.useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem("hayat:asma-memorized");
      return raw ? new Set((JSON.parse(raw) as string[]).map(Number)) : new Set();
    } catch {
      return new Set();
    }
  });

  const nameOfDay = React.useMemo(() => getNameOfDay(), []);
  const memorizedCount = memorized.size;
  const memorizedPercent = Math.round((memorizedCount / 99) * 100);
  const tts = useTTS();

  const filtered = React.useMemo(() => {
    const t = TIERS.find((x) => x.label === tier);
    return ASMA_UL_HUSNA.filter((n) => {
      const inTier = !t || (n.number >= t.range[0] && n.number <= t.range[1]);
      const inSearch =
        !query ||
        n.translit.toLowerCase().includes(query.toLowerCase()) ||
        n.meaning.toLowerCase().includes(query.toLowerCase()) ||
        n.arabic.includes(query);
      const inMemFilter = !showMemorizedOnly || memorized.has(n.number);
      return inTier && inSearch && inMemFilter;
    });
  }, [query, tier, showMemorizedOnly, memorized]);

  const toggleFav = (n: number) => {
    setFavorits((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      try { window.localStorage.setItem("hayat-asma-favorites", JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const toggleMemorized = (n: number) => {
    setMemorized((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      try { window.localStorage.setItem("hayat:asma-memorized", JSON.stringify([...next].map(String))); } catch {}
      return next;
    });
  };

  const copyName = (d: DivineName) => {
    navigator.clipboard.writeText(`${d.arabic}\n${d.translit}\n${d.meaning}`);
    setCopied(true);
    toast.success("Nama tersalin ke papan klip");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <ViewHeader
        title="Asma'ul Husna"
        subtitle="99 Nama Allah \u2014 setiap nama adalah pintu untuk mengenal-Nya. Renungkan satu nama setiap hari."
        icon={<Gem className="h-5 w-5" />}
        badge={
          <span className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary tabular-nums">
            <CheckCircle2 className="h-3 w-3" />
            {memorizedCount} / 99 memorized
          </span>
        }
      />

      {/* Memorization progress card */}
      <SectionCard className="mb-6">
        <div className="flex items-center gap-5">
          <ProgressRing value={memorizedPercent} size={72} strokeWidth={6}>
            <span className="text-lg font-semibold tabular-nums text-primary">{memorizedCount}</span>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Progres Menghafal</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {memorizedPercent}% dari 99 Nama
            </p>
            <p className="text-xs font-medium text-primary mt-1">
              {getMotivationalMessage(memorizedPercent)}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Nama Hari Ini hero */}
      <SectionCard className="mb-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
          >
            <span className="text-arabic text-3xl text-primary">{nameOfDay.arabic}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
              {"✦ Nama Hari Ini · No. "}{nameOfDay.number}
            </p>
            <h2 className="text-display text-2xl font-medium tracking-tight">{nameOfDay.translit}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{nameOfDay.meaning}</p>
          </div>
          <button
            onClick={() => setSelected(nameOfDay)}
            className="shrink-0 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity shadow-soft"
          >
            Refleksi
          </button>
          <button
            onClick={() => {
              tts.speak(`${nameOfDay.translit}. ${nameOfDay.meaning}.`, `asma-${nameOfDay.number}`);
              toast.success(`Pronouncing ${nameOfDay.translit}`);
            }}
            disabled={tts.isLoading}
            aria-label="Ucapkan nama"
            className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            {tts.isLoading && tts.activeKey === `asma-${nameOfDay.number}` ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </SectionCard>

      {/* Search + tier filters + memorized filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, makna, atau Arab\u2026"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIERS.map((t) => (
            <button
              key={t.label}
              onClick={() => setTier(t.label)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                tier === t.label
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => setShowMemorizedOnly(!showMemorizedOnly)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1",
              showMemorizedOnly
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            <Filter className="h-3 w-3" />
            Sudah dihafal saja
          </button>
        </div>
      </div>

      {/* Names grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const isFav = favorites.has(n.number);
            const isMem = memorized.has(n.number);
            const isDay = n.number === nameOfDay.number;
            return (
              <motion.button
                key={n.number}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.015, 0.25) }}
                onClick={() => setSelected(n)}
                className={cn(
                  "group relative text-center rounded-2xl border bg-card p-4 transition-all",
                  "hover:shadow-premium hover:-translate-y-0.5 hover:border-primary/40",
                  isDay ? "border-primary/50 ring-1 ring-primary/20" : "border-border/70 shadow-soft",
                  isMem && "border-primary/30 bg-primary/[0.03]"
                )}
              >
                {isDay && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px]">
                    <Sparkles className="h-3 w-3" />
                  </span>
                )}
                {/* Favorit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(n.number); }}
                  className={cn(
                    "absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                    isFav ? "text-rose-500 opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted"
                  )}
                  aria-label="Favorit"
                >
                  <Heart className={cn("h-3.5 w-3.5", isFav && "fill-current")} />
                </button>
                {/* Memorized button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMemorized(n.number); }}
                  className={cn(
                    "absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                    isMem ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted"
                  )}
                  aria-label="Dihafal"
                >
                  <CheckCircle2 className={cn("h-3.5 w-3.5", isMem && "fill-current")} />
                </button>
                <p className="text-arabic text-2xl text-primary mb-2 leading-none">{n.arabic}</p>
                <p className="text-xs font-semibold truncate">{n.translit}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{n.meaning}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1.5 tabular-nums">#{n.number}</p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Gem className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-display text-lg font-medium">Nama tidak ditemukan</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or range.</p>
        </div>
      ) : null}

      {/* Detail / reflect modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-premium max-h-[85vh] overflow-y-auto scroll-slim"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Nav between names */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => {
                    const prev = ASMA_UL_HUSNA.find((x) => x.number === selected.number - 1) ?? ASMA_UL_HUSNA[ASMA_UL_HUSNA.length - 1];
                    setSelected(prev);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Name {selected.number} of 99
                </span>
                <button
                  onClick={() => {
                    const next = ASMA_UL_HUSNA.find((x) => x.number === selected.number + 1) ?? ASMA_UL_HUSNA[0];
                    setSelected(next);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Arabic hero */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15 p-6 mb-5 text-center">
                <motion.p
                  key={selected.number}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-arabic text-4xl sm:text-5xl text-primary leading-loose"
                >
                  {selected.arabic}
                </motion.p>
              </div>

              {/* Translit + meaning */}
              <div className="mb-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Transliterasi</p>
                <p className="text-display text-xl font-medium">{selected.translit}</p>
              </div>
              <div className="mb-5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Makna</p>
                <p className="text-base text-foreground/90">{selected.meaning}</p>
              </div>

              {/* Refleksiion */}
              <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-4 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Refleksi</p>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Allah is <span className="font-semibold">{selected.meaning.toLowerCase()}</span>. How does knowing this
                  name change how you see your day, your struggles, and your hopes? Call upon Him by this name in your next dua.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    tts.speak(`${selected.translit}. ${selected.meaning}.`, `asma-${selected.number}`);
                    toast.success(`Pronouncing ${selected.translit}`);
                  }}
                  disabled={tts.isLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  {tts.isLoading && tts.activeKey === `asma-${selected.number}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  Dengarkan
                </button>
                <button
                  onClick={() => toggleFav(selected.number)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    favorites.has(selected.number) ? "border-rose-500/40 bg-rose-500/10 text-rose-500" : "border-border hover:bg-muted"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", favorites.has(selected.number) && "fill-current")} />
                  {favorites.has(selected.number) ? "Difavoritkan" : "Favorit"}
                </button>
                <button
                  onClick={() => toggleMemorized(selected.number)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    memorized.has(selected.number) ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted"
                  )}
                >
                  <CheckCircle2 className={cn("h-3.5 w-3.5", memorized.has(selected.number) && "fill-current")} />
                  {memorized.has(selected.number) ? "Memorized" : "Tandai sudah dihafal"}
                </button>
                <button
                  onClick={() => copyName(selected)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
