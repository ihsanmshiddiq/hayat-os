"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, RefreshCw, Quote, Sparkles } from "lucide-react";
import { getHadithOfTheDay, HADITHS_OF_THE_DAY } from "@/lib/islamic";
import { IslamicPatternMoroccan } from "@/components/shared/islamic-pattern";
import { useNow } from "@/hooks/use-now";

/**
 * Hadith of the Day — premium card with rotating authentic hadith.
 * Deterministically picks one per day; user can shuffle through others.
 * Full-width 2-column layout: Arabic on the right, English + narrator on the left.
 */
export function HadithOfTheDay() {
  const now = useNow(60_000);
  const todays = React.useMemo(() => {
    const d = now ? new Date(now.getTime()) : new Date();
    return getHadithOfTheDay(d);
  }, [now]);

  const [current, setCurrent] = React.useState(todays);
  const [index, setIndex] = React.useState(() => HADITHS_OF_THE_DAY.findIndex((h) => h.id === todays.id));

  React.useEffect(() => {
    setCurrent(todays);
    setIndex(HADITHS_OF_THE_DAY.findIndex((h) => h.id === todays.id));
  }, [todays]);

  const shuffle = React.useCallback(() => {
    const nextIdx = (index + 1) % HADITHS_OF_THE_DAY.length;
    setIndex(nextIdx);
    setCurrent(HADITHS_OF_THE_DAY[nextIdx]);
  }, [index]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft"
    >
      {/* ambient gradient */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 320px at 100% -10%, rgba(16,185,129,0.14), transparent 60%), radial-gradient(700px 280px at -10% 110%, rgba(245,158,11,0.12), transparent 60%)",
        }}
      />
      <IslamicPatternMoroccan className="text-primary" opacity={0.04} />

      <div className="relative p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <BookMarked className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">
                Hadith of the Day
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                {current.theme}
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  {current.grade}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={shuffle}
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background hover:border-primary/30 transition-all"
            title="Next hadith"
            aria-label="Show another hadith"
          >
            <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center"
          >
            {/* English / Left column */}
            <div className="md:order-1 md:border-r md:border-border/60 md:pr-8">
              <Quote className="h-6 w-6 text-primary/40 mb-2" />
              <p className="text-[15px] sm:text-base text-foreground/85 italic leading-relaxed">
                &ldquo;{current.english}&rdquo;
              </p>
              {/* Attribution */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2 py-1 ring-1 ring-primary/15">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="font-medium text-foreground/80">{current.narrator}</span>
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span>{current.source}</span>
              </div>
            </div>

            {/* Arabic / Right column */}
            <div className="md:order-2 md:text-right">
              <p className="text-arabic text-2xl sm:text-3xl leading-[2.1] text-foreground" dir="rtl">
                {current.arabic}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer: indicator dots + counter */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {HADITHS_OF_THE_DAY.map((h, i) => (
              <button
                key={h.id}
                onClick={() => {
                  setIndex(i);
                  setCurrent(HADITHS_OF_THE_DAY[i]);
                }}
                className="group/dot py-1.5"
                aria-label={`Hadith ${i + 1}`}
              >
                <span
                  className={
                    i === index
                      ? "block h-1.5 w-5 rounded-full bg-primary transition-all"
                      : "block h-1.5 w-1.5 rounded-full bg-muted-foreground/30 group-hover/dot:bg-muted-foreground/60 transition-all"
                  }
                />
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {index + 1} <span className="opacity-60">/</span> {HADITHS_OF_THE_DAY.length}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
