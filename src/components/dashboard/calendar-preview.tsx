"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";
import { useCalendar, useDashboard } from "@/lib/hooks";
import { getHijriDate, ISLAMIC_EVENTS } from "@/lib/islamic";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarPreview() {
  const { setActiveView } = useAppStore();
  const { data } = useDashboard();
  const today = new Date();
  const [cursor, setCursor] = React.useState({ year: today.getFullYear(), month: today.getMonth() });
  const { data: cal } = useCalendar(cursor);

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();

  const eventsByDay = React.useMemo(() => {
    const map = new Map<number, { title: string; type: string }[]>();
    cal?.events.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push({ title: e.title, type: e.type });
    });
    cal?.islamic.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push({ title: e.name, type: e.type });
    });
    return map;
  }, [cal]);

  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const isToday = (d: number) =>
    d === today.getDate() &&
    cursor.month === today.getMonth() &&
    cursor.year === today.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <CalendarDays className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">{monthName}</h3>
            <p className="text-xs text-muted-foreground">
              {getHijriDate(new Date(cursor.year, cursor.month, 1)).formatted}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.year, c.month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c.year, c.month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground uppercase py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const events = eventsByDay.get(day) ?? [];
          const today_ = isToday(day);
          return (
            <button
              key={day}
              onClick={() => setActiveView("kalender")}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors",
                today_ ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted",
                events.length > 0 && !today_ && "font-medium"
              )}
            >
              {day}
              {events.length > 0 ? (
                <span className="absolute bottom-1 flex gap-0.5">
                  {events.slice(0, 3).map((e, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "h-1 w-1 rounded-full",
                        e.type === "fasting" ? "bg-amber-500" : e.type === "islamic" ? "bg-emerald-500" : today_ ? "bg-primary-foreground/70" : "bg-foreground/40"
                      )}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Upcoming */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">Upcoming</p>
        <div className="space-y-2">
          {(data?.upcomingEvents ?? []).slice(0, 3).map((e) => (
            <div key={e.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center w-10 shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase">
                  {new Date(e.date).toLocaleDateString("id-ID", { month: "short" })}
                </span>
                <span className="text-display text-base font-semibold leading-none">
                  {new Date(e.date).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{e.title}</p>
                {e.time ? (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {e.time}
                  </p>
                ) : null}
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  e.type === "fasting" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : e.type === "islamic" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
                )}
              >
                {e.type}
              </span>
            </div>
          ))}
          {(!data?.upcomingEvents || data.upcomingEvents.length === 0) && (
            <p className="text-xs text-muted-foreground">No upcoming events.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
