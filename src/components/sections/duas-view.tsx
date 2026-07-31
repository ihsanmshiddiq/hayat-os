"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandHeart, Search, BookOpen, Copy, Check, X, Volume2, Loader2 } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import {
  DUA_CATEGORIES,
  DUAS,
  type Dua,
} from "@/lib/duas";
import {
  Sunrise, Sparkles, Moon, UtensilsCrossed, Plane, Heart,
  RefreshCw, BookMarked, Shield, BookOpen as BookOpenIcon,
  type LucideIcon,
} from "lucide-react";
import { useTTS } from "@/hooks/use-tts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ICON_MAP: Record<string, LucideIcon> = {
  Sunrise,
  Sparkles,
  Moon,
  UtensilsCrossed,
  Plane,
  Heart,
  RefreshCw,
  BookMarked,
  Shield,
  BookOpen: BookOpenIcon,
};

const CORE_CATEGORIES = [
  { id: "morning-evening", name: "Morning & Evening", icon: "Sunrise" },
  { id: "after-prayer", name: "After Prayer", icon: "Sparkles" },
  { id: "before-sleep", name: "Before Sleep", icon: "Moon" },
  { id: "distress-forgiveness", name: "Distress & Forgiveness", icon: "Heart" },
  { id: "gratitude-protection", name: "Gratitude & Protection", icon: "Shield" },
];

function categoryOf(dua: Dua) {
  if (["distress", "forgiveness"].includes(dua.category)) return "distress-forgiveness";
  if (["gratitude", "protection", "eating", "travel", "knowledge"].includes(dua.category)) return "gratitude-protection";
  return dua.category;
}

export function DuasView() {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Dua | null>(null);
  const [copied, setCopied] = React.useState(false);
  const tts = useTTS();

  const filtered = DUAS.filter((d) => {
    const inCat = activeCategory === "all" || categoryOf(d) === activeCategory;
    const inSearch =
      !query ||
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.arabic.includes(query) ||
      d.translation.toLowerCase().includes(query.toLowerCase()) ||
      d.translit.toLowerCase().includes(query.toLowerCase());
    return inCat && inSearch;
  });

  const copyDua = (d: Dua) => {
    const text = `${d.arabic}\n\n${d.translit}\n\n${d.translation}\n\n— ${d.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Doa tersalin ke papan klip");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <ViewHeader
        title="Koleksi Doa"
        subtitle="Doa-doa shahih dari Al-Quran dan Sunnah, diorganisir berdasarkan kesempatan."
        icon={<HandHeart className="h-5 w-5" />}
      />

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari doa…"
          className="pl-9"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
            activeCategory === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted"
          )}
        >
          Semua ({DUAS.length})
        </button>
        {CORE_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] ?? BookOpen;
          const count = DUAS.filter((d) => categoryOf(d) === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                activeCategory === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.name}
              <span className={cn("text-[10px]", activeCategory === cat.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dua cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((d, i) => {
            const cat = CORE_CATEGORIES.find((c) => c.id === categoryOf(d));
            const Icon = cat ? (ICON_MAP[cat.icon] ?? BookOpen) : BookOpen;
            return (
              <motion.button
                key={d.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setSelected(d)}
                className="group text-left rounded-2xl border border-border/70 bg-card shadow-soft p-5 transition-all hover:shadow-premium hover:-translate-y-0.5 hover:border-border"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{cat?.name}</span>
                </div>
                <p className="text-arabic text-xl text-primary text-right leading-loose mb-3 line-clamp-2 break-words" dir="rtl" style={{ overflowWrap: 'anywhere' }}>
                  {d.arabic}
                </p>
                <p className="text-sm font-medium mb-1">{d.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 break-words">{d.translation}</p>
                <p className="text-[11px] text-muted-foreground mt-2 italic">— {d.reference}</p>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-display text-lg font-medium">Doa tidak ditemukan</p>
          <p className="text-sm text-muted-foreground mt-1">Coba pencarian atau kategori lain.</p>
        </div>
      ) : null}

      {/* Detail modal */}
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
              className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-premium max-h-[85vh] overflow-y-auto scroll-slim"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-display text-lg font-medium">{selected.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {CORE_CATEGORIES.find((c) => c.id === categoryOf(selected))?.name}
                  </p>
                </div>
              </div>

              {/* Arabic */}
              <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 mb-4">
                <p className="text-arabic text-2xl sm:text-3xl text-primary text-right leading-loose">
                  {selected.arabic}
                </p>
              </div>

              {/* Transliterasi */}
              <div className="mb-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Transliterasi</p>
                <p className="text-sm italic text-foreground/90 leading-relaxed">{selected.translit}</p>
              </div>

              {/* Terjemahan */}
              <div className="mb-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Terjemahan</p>
                <p className="text-sm leading-relaxed">{selected.translation}</p>
              </div>

              {/* Reference */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/60">
                <span className="text-xs text-muted-foreground italic">— {selected.reference}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      tts.speak(selected.translit, `dua-${selected.id}`);
                      toast.success("Membaca doa");
                    }}
                    disabled={tts.isLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {tts.isLoading && tts.activeKey === `dua-${selected.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                    Dengarkan
                  </button>
                  <button
                    onClick={() => copyDua(selected)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              {/* Note */}
              {selected.note ? (
                <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    <span className="font-semibold">Keutamaan: </span>{selected.note}
                  </p>
                </div>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
