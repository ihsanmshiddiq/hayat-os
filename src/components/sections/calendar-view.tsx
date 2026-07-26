"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, Trash2,
  Sparkles, MoonStar, Sunrise, Sun, Sunset, Moon, MapPin, BookOpen,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { IslamicGeometricPattern } from "@/components/shared/islamic-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useCalendar, useCreateEvent, useDeleteEvent } from "@/lib/hooks";
import { useDashboard } from "@/lib/hooks";
import {
  getHijriDate, getUpcomingIslamicEvents, getIslamicEventDescription,
  computePrayerTimes, getLocationTimezoneHours, formatTimeInZone,
  OBLIGATORY_PRAYERS, PRAYER_AR, getSuggestedFastsForDate,
} from "@/lib/islamic";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TYPE_STYLES: Record<string, string> = {
  fasting: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  islamic: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  reminder: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  goal: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  salah: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
};

const TYPE_DOT: Record<string, string> = {
  fasting: "bg-amber-500",
  islamic: "bg-emerald-500",
  reminder: "bg-sky-500",
  goal: "bg-rose-500",
  salah: "bg-violet-500",
};

const PRAYER_ICON: Record<string, React.ReactNode> = {
  Fajr: <Sunrise className="h-3.5 w-3.5" />,
  Sunrise: <Sunrise className="h-3.5 w-3.5" />,
  Dhuhr: <Sun className="h-3.5 w-3.5" />,
  Asr: <Sun className="h-3.5 w-3.5" />,
  Maghrib: <Sunset className="h-3.5 w-3.5" />,
  Isha: <Moon className="h-3.5 w-3.5" />,
};

export function CalendarView() {
  const today = new Date();
  const [cursor, setCursor] = React.useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = React.useState<number | null>(today.getDate());
  const { data: cal, isLoading } = useCalendar(cursor);
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [time, setTime] = React.useState("");
  const [type, setType] = React.useState("reminder");
  const [note, setNote] = React.useState("");

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const hijriMonth = getHijriDate(new Date(cursor.year, cursor.month, 1));

  const eventsByDay = React.useMemo(() => {
    const map = new Map<number, { id?: string; title: string; type: string; time?: string | null; note?: string | null; isIslamic?: boolean }[]>();
    cal?.events.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push({ id: e.id, title: e.title, type: e.type, time: e.time, note: e.note });
    });
    cal?.islamic.forEach((e) => {
      const d = new Date(e.date).getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push({ title: e.name, type: e.type, isIslamic: true });
    });
    return map;
  }, [cal]);

  const selectedEvents = selectedDay ? (eventsByDay.get(selectedDay) ?? []) : [];

  const submit = () => {
    if (!title.trim() || !selectedDay) return;
    const date = new Date(cursor.year, cursor.month, selectedDay);
    createEvent.mutate({ title, date: date.toISOString(), time: time || undefined, type, note: note || undefined });
    setTitle(""); setTime(""); setType("reminder"); setNote("");
    setOpen(false);
  };

  const isToday = (d: number) => d === today.getDate() && cursor.month === today.getMonth() && cursor.year === today.getFullYear();

  return (
    <div>
      <ViewHeader
        title="Kalender"
        subtitle="Your schedule, reminders, fasting days, and Peristiwa Islamis — in one place."
        icon={<CalendarDays className="h-5 w-5" />}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Tambah acara</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="text-display">Tambah acara{selectedDay ? ` · ${monthName} ${selectedDay}` : ""}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Judul</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Quran halaqah" className="mt-1.5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Waktu</Label><Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:30" className="mt-1.5" /></div>
                  <div>
                    <Label>Jenis</Label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="reminder">Pengingat</option>
                      <option value="fasting">Puasa</option>
                      <option value="islamic">Peristiwa Islami</option>
                      <option value="goal">Target</option>
                      <option value="salah">Salah</option>
                    </select>
                  </div>
                </div>
                <div><Label>Catatan</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="optional" className="mt-1.5" /></div>
                <Button onClick={submit} className="w-full">Tambah acara</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Compact upcoming Peristiwa Islamis strip */}
      <IslamicEventsStrip />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Calendar grid */}
        <SectionCard>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-display text-xl font-medium">{monthName}</h3>
              <p className="text-xs text-muted-foreground">{hijriMonth.monthName} {hijriMonth.year} AH</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { const d = new Date(cursor.year, cursor.month - 1, 1); setCursor({ year: d.getFullYear(), month: d.getMonth() }); setSelectedDay(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => { setCursor({ year: today.getFullYear(), month: today.getMonth() }); setSelectedDay(today.getDate()); }} className="px-3 h-8 rounded-lg text-xs font-medium hover:bg-muted">Hari ini</button>
              <button onClick={() => { const d = new Date(cursor.year, cursor.month + 1, 1); setCursor({ year: d.getFullYear(), month: d.getMonth() }); setSelectedDay(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-medium text-muted-foreground uppercase py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = eventsByDay.get(day) ?? [];
              const selected = selectedDay === day;
              const today_ = isToday(day);
              return (
                <motion.button
                  key={day}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-xl border text-sm transition-all p-1 min-h-[56px]",
                    selected ? "border-primary bg-primary/8" : today_ ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/40"
                  )}
                >
                  <span className={cn("font-medium", today_ && !selected && "text-primary")}>{day}</span>
                  {events.length > 0 ? (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {events.slice(0, 4).map((e, idx) => (
                        <span key={idx} className={cn("h-1 w-1 rounded-full", TYPE_DOT[e.type] ?? "bg-foreground/40")} />
                      ))}
                    </div>
                  ) : null}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-border/60">
            {Object.entries(TYPE_DOT).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", v)} />
                <span className="text-[11px] text-muted-foreground capitalize">{k}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Enriched day detail */}
        <DayDetail
          year={cursor.year}
          month={cursor.month}
          day={selectedDay}
          monthName={monthName}
          events={selectedEvents}
          onDelete={deleteEvent.mutate}
        />
      </div>
    </div>
  );
}

/* ---------- Compact Upcoming Islamic Acara Strip ---------- */

function IslamicEventsStrip() {
  const [events] = React.useState(() => getUpcomingIslamicEvents(5));
  if (events.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-soft mb-5"
    >
      <IslamicGeometricPattern className="text-primary" opacity={0.04} size={36} />
      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MoonStar className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-display text-sm font-medium leading-tight">Hari Islami Mendatang</h3>
              <p className="text-[10px] text-muted-foreground">Notable dates in the Hijri calendar</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">{events.length} ahead</span>
        </div>

        <div className="flex gap-2 overflow-x-auto scroll-slim pb-1 -mx-1 px-1">
          {events.map((ev, idx) => (
            <motion.div
              key={ev.name}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * idx, duration: 0.32 }}
              className="group shrink-0 w-[200px] rounded-xl border border-border/60 bg-background/70 p-3 transition-all hover:border-primary/40 hover:bg-background/90 hover:shadow-soft"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                  ev.type === "fasting"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                )}>
                  <Sparkles className="h-2.5 w-2.5" />
                  {ev.type === "fasting" ? "Fast" : "Day"}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                  {ev.daysUntil === 0 ? "Hari ini" : ev.daysUntil === 1 ? "1d" : `${ev.daysUntil}d`}
                </span>
              </div>
              <p className="text-display text-[13px] font-semibold leading-tight mb-0.5">{ev.name}</p>
              <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                {getIslamicEventDescription(ev.name)}
              </p>
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-muted-foreground/70">
                <span className="h-1 w-1 rounded-full bg-primary/60" />
                {ev.hijriDay} {ev.hijriMonth}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ---------- Enriched Day Detail Panel ---------- */

interface DayDetailProps {
  year: number;
  month: number;
  day: number | null;
  monthName: string;
  events: { id?: string; title: string; type: string; time?: string | null; note?: string | null; isIslamic?: boolean }[];
  onDelete: (id: string) => void;
}

function DayDetail({ year, month, day, monthName, events, onDelete }: DayDetailProps) {
  const { data: dash } = useDashboard();
  const user = dash?.user;
  const date = day ? new Date(year, month, day) : null;
  const hijri = date ? getHijriDate(date) : null;
  const isToday = date ? date.toDateString() === new Date().toDateString() : false;
  const isFuture = date ? date.getTime() > new Date().getTime() : false;

  // Compute prayer times for selected day
  const prayerTimes = React.useMemo(() => {
    if (!date || !user) return null;
    const tz = getLocationTimezoneHours(user.longitude);
    return computePrayerTimes({
      date,
      lat: user.latitude ?? -6.2088,
      lng: user.longitude ?? 106.8456,
      timezone: tz,
      method: (user.method as any) ?? "Kemenag",
    });
  }, [date, user]);

  const tzHours = user ? getLocationTimezoneHours(user.longitude) : 7;
  const suggestedFasts = date ? getSuggestedFastsForDate(date) : [];

  return (
    <SectionCard className="flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-display text-lg font-medium">
            {day ? `${monthName} ${day}` : "Pilih hari"}
          </h3>
          {isToday ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">Hari ini</span>
          ) : isFuture ? (
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400">Upcoming</span>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {hijri ? `${hijri.day} ${hijri.monthName} ${hijri.year} AH` : "Klik tanggal apa saja"}
        </p>
      </div>

      {/* Prayer times for this day */}
      {prayerTimes ? (
        <div className="mb-4 rounded-xl border border-border/60 bg-gradient-to-br from-primary/[0.03] to-amber-500/[0.02] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <MoonStar className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prayer Times</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {OBLIGATORY_PRAYERS.map((p) => (
              <div key={p} className="text-center rounded-lg bg-background/60 py-1.5 px-1 border border-border/40">
                <div className="flex items-center justify-center text-primary mb-0.5">{PRAYER_ICON[p]}</div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{p.slice(0, 4)}</p>
                <p className="text-[11px] font-medium tabular-nums">
                  {formatTimeInZone(prayerTimes[p], tzHours)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Suggested fasts */}
      {suggestedFasts.length > 0 ? (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sunrise className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Puasa Sunnah</span>
          </div>
          <p className="text-xs text-foreground/80">
            {suggestedFasts.join(" · ")}
          </p>
        </div>
      ) : null}

      {/* Acara */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Acara</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{events.length}</span>
        </div>
        <div className="space-y-2 max-h-[260px] overflow-y-auto scroll-slim pr-1">
          <AnimatePresence>
            {events.map((e, i) => (
              <motion.div
                key={`${e.title}-${i}`}
                layout
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className={cn("rounded-xl border p-3", TYPE_STYLES[e.type] ?? "border-border")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{e.title}</p>
                    {e.time ? <p className="text-[11px] mt-0.5 flex items-center gap-1 opacity-80"><Clock className="h-3 w-3" /> {e.time}</p> : null}
                    {e.note ? <p className="text-[11px] mt-1 opacity-70">{e.note}</p> : null}
                    <span className="text-[10px] uppercase tracking-wide opacity-60 mt-1 inline-block">{e.type}{e.isIslamic ? " · hijri" : ""}</span>
                  </div>
                  {e.id ? (
                    <button onClick={() => onDelete(e.id!)} className="text-muted-foreground hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Tidak ada acara hari ini.</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">A peaceful day for reflection.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Location footer */}
      {user ? (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{user.location ?? "Jakarta"}</span>
          <span className="mx-1">·</span>
          <span className="tabular-nums">UTC{tzHours >= 0 ? "+" : ""}{tzHours}</span>
        </div>
      ) : null}
    </SectionCard>
  );
}
