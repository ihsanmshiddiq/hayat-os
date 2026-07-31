"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Quote, BookOpen, ChevronRight } from "lucide-react";
import { getScholarQuoteOfTheDay, SCHOLAR_QUOTES } from "@/lib/islamic";
import { useNow } from "@/hooks/use-now";

/**
 * Scholar Quote of the Day — compact card featuring rotating wisdom
 * from classical Islamic scholars (Imam al-Shafi'i, Ibn al-Qayyim, etc.).
 * Rendered alongside the Hadith of the Day on the dashboard.
 */
export function ScholarQuoteOfTheDay() {
  const now = useNow(60_000);
  const todays = React.useMemo(() => {
    const d = now ? new Date(now.getTime()) : new Date();
    return getScholarQuoteOfTheDay(d);
  }, [now]);

  const [index, setIndex] = React.useState(() => SCHOLAR_QUOTES.findIndex((q) => q.id === todays.id));
  const [current, setCurrent] = React.useState(todays);

  React.useEffect(() => {
    setIndex(SCHOLAR_QUOTES.findIndex((q) => q.id === todays.id));
    setCurrent(todays);
  }, [todays]);

  const next = React.useCallback(() => {
    const i = (index + 1) % SCHOLAR_QUOTES.length;
    setIndex(i);
    setCurrent(SCHOLAR_QUOTES[i]);
  }, [index]);

  return (
    <motion.button
      onClick={next}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      whileHover={{ y: -2 }}
      className="group relative w-full overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-7 text-left shadow-soft transition-colors hover:border-border"
    >
      {/* subtle gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none transition-opacity group-hover:opacity-70"
        style={{
          background:
            "radial-gradient(560px 220px at 100% -20%, rgba(245,158,11,0.10), transparent 60%), radial-gradient(420px 200px at -10% 120%, rgba(16,185,129,0.08), transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600/80 dark:text-amber-400/80">
            Kutipan Hikmah Hari Ini
          </p>
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Quote className="h-5 w-5 text-amber-500/40 mb-2" />
          <p className="text-[15px] sm:text-base text-foreground/90 italic leading-relaxed">
            {current.text}
          </p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-foreground/80">— {current.author}</p>
              <p className="text-[11px] text-muted-foreground">
                {current.era}
                {current.context ? <span className="opacity-70"> · {current.context}</span> : null}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Berikutnya</span>
              <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </motion.div>

        {/* progress dots */}
        <div className="mt-5 flex items-center gap-1">
          {SCHOLAR_QUOTES.map((q, i) => (
            <span
              key={q.id}
              className={
                i === index
                  ? "h-1 w-4 rounded-full bg-amber-500 transition-all"
                  : "h-1 w-1 rounded-full bg-muted-foreground/30 transition-all"
              }
            />
          ))}
        </div>
      </div>
    </motion.button>
  );
}
