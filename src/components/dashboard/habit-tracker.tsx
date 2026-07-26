"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Plus, Check } from "lucide-react";
import { useDashboard, useToggleHabit } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { HabitIcon, habitColor } from "@/components/shared/icon-map";
import { cn } from "@/lib/utils";

export function HabitTracker() {
  const { data } = useDashboard();
  const toggleHabit = useToggleHabit();
  const { setActiveView } = useAppStore();

  const habits = data?.habits ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doneToday = habits.filter((h) =>
    h.logs.some((l) => new Date(l.date).toDateString() === today.toDateString() && l.done)
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="text-display text-lg font-medium tracking-tight">Habit Tracker</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {doneToday}/{habits.length} done today
          </p>
        </div>
        <button
          onClick={() => setActiveView("kebiasaan")}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {habits.map((h) => {
          const color = habitColor(h.color);
          const todayLog = h.logs.find((l) => new Date(l.date).toDateString() === today.toDateString());
          const done = !!todayLog?.done;
          // weekly trend: last 7 days
          const last7 = h.logs.slice(-7);
          const completed7 = last7.filter((l) => l.done).length;
          return (
            <motion.div
              key={h.id}
              whileHover={{ y: -2 }}
              className={cn(
                "group relative rounded-xl border p-4 transition-all cursor-pointer",
                done ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-border"
              )}
              onClick={() => toggleHabit.mutate({ habitId: h.id, done: !done })}
            >
              <div className="flex items-start gap-3">
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", color.bg, color.text)}>
                  <HabitIcon name={h.icon} className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{h.name}</p>
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all",
                        done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent group-hover:border-foreground/30"
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Flame className="h-3 w-3 text-amber-500" />
                      <span className="tabular-nums">{h.streak}d streak</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {completed7}/7 this week
                    </span>
                  </div>
                  {/* Weekly trend dots */}
                  <div className="flex items-center gap-1 mt-2">
                    {last7.map((l, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          l.done ? color.dot : "bg-muted-foreground/20"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No habits yet. Build your first routine.
        </div>
      ) : null}
    </motion.div>
  );
}
