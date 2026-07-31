"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  GraduationCap,
  BookOpen,
  Library,
  Disc,
  Activity,
  Droplets,
  Footprints,
  Pause,
  Play,
  Square,
  RotateCcw,
  Timer as TimerIcon,
  Flame,
  CheckCircle2,
  Sparkles,
  Coffee,
  ChevronRight,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { IslamicGeometricPattern } from "@/components/shared/islamic-pattern";
import { useFocus, useStartFocus, useStopFocus } from "@/lib/hooks";
import { FOCUS_MODES, FOCUS_BREAKS, FOCUS_PRESETS, FOCUS_INTENTIONS } from "@/lib/islamic";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MODE_ICONS: Record<string, React.ElementType> = {
  Brain, GraduationCap, BookOpen, Library,
};
const BREAK_ICONS: Record<string, React.ElementType> = {
  Disc, Activity, Droplets, Footprints, Pause,
};

type Phase = "idle" | "focusing" | "break" | "paused" | "done";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FocusView() {
  const { data, isLoading } = useFocus(30);
  const startFocus = useStartFocus();
  const stopFocus = useStopFocus();
  const breakOptions = FOCUS_BREAKS.filter((item) => item.id !== "dhikr");

  // Timer state (in seconds, persisted in localStorage so a refresh doesn't lose progress)
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [modeId, setModeId] = React.useState<string>("deep");
  const [breakId, setBreakId] = React.useState<string>("stretch");
  const [focusMin, setFocusMin] = React.useState(25);
  const [breakMin, setBreakMin] = React.useState(5);
  const [intention, setIntention] = React.useState("");
  const [tersisa, setRemaining] = React.useState(25 * 60);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [completedToday, setCompletedToday] = React.useState(0);

  const focusSec = focusMin * 60;
  const breakSec = breakMin * 60;

  // Persist timer state to localStorage so refreshes don't lose progress
  React.useEffect(() => {
    const saved = localStorage.getItem("hayat:focus-timer");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.phase && s.phase !== "idle") {
          setPhase(s.phase);
          setModeId(s.modeId ?? "deep");
          setBreakId(s.breakId ?? "stretch");
          setFocusMin(s.focusMin ?? 25);
          setBreakMin(s.breakMin ?? 5);
          setIntention(s.intention ?? "");
          setRemaining(s.tersisa ?? 25 * 60);
          setSessionId(s.sessionId ?? null);
          setCompletedToday(s.completedToday ?? 0);
        }
      } catch {}
    }
  }, []);

  React.useEffect(() => {
    if (phase !== "idle") {
      localStorage.setItem(
        "hayat:focus-timer",
        JSON.stringify({ phase, modeId, breakId, focusMin, breakMin, intention, tersisa, sessionId, completedToday })
      );
    } else {
      localStorage.removeItem("hayat:focus-timer");
    }
  }, [phase, modeId, breakId, focusMin, breakMin, intention, tersisa, sessionId, completedToday]);

  // Tick
  React.useEffect(() => {
    if (phase !== "focusing" && phase !== "break") return;
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          // Phase complete
          if (phase === "focusing") {
            // Save completed focus session to DB
            if (sessionId) {
              stopFocus.mutate({ id: sessionId, elapsedSec: focusSec, completed: true });
            }
            setCompletedToday((n) => n + 1);
            toast.success("Masha'Allah! Sesi fokus selesai.", {
              description: `Istirahat ${breakMin} menit — ${FOCUS_BREAKS.find(b => b.id === breakId)?.label.toLowerCase()}.`,
            });
            // Move to break phase
            setPhase("break");
            return breakSec;
          } else {
            // Istirahat complete
            toast("Istirahat selesai. Siap untuk ronde berikutnya?", {
              description: "Tekan Mulai untuk memulai sesi baru.",
            });
            setPhase("done");
            setSessionId(null);
            return 0;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, focusSec, breakSec, sessionId, breakId, breakMin, stopFocus]);

  const handleStart = async () => {
    if (phase === "paused") {
      setPhase("focusing");
      return;
    }
    // Start a new focus session
    setRemaining(focusSec);
    setPhase("focusing");
    try {
      const res = await startFocus.mutateAsync({
        durationSec: focusSec,
        mode: modeId,
        breakActivity: breakId,
        intention: intention || undefined,
      });
      if (res.ok && res.session) {
        setSessionId(res.session.id);
      }
    } catch {
      // Network failure — keep timer running locally
    }
  };

  const handlePause = () => {
    if (phase === "focusing") setPhase("paused");
  };

  const handleStop = async () => {
    if (sessionId && (phase === "focusing" || phase === "paused")) {
      try {
        await stopFocus.mutateAsync({
          id: sessionId,
          elapsedSec: focusSec - tersisa,
          completed: false,
        });
      } catch {}
    }
    setPhase("idle");
    setSessionId(null);
    setRemaining(focusSec);
  };

  const handleReset = () => {
    setPhase("idle");
    setSessionId(null);
    setRemaining(focusSec);
    setCompletedToday(0);
    localStorage.removeItem("hayat:focus-timer");
  };

  const applyPreset = (presetId: string) => {
    const p = FOCUS_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setFocusMin(p.focusMin);
    setBreakMin(p.breakMin);
    if (phase === "idle" || phase === "done") {
      setRemaining(p.focusMin * 60);
    }
  };

  const mode = FOCUS_MODES.find((m) => m.id === modeId)!;
  const breakActivity = breakOptions.find((b) => b.id === breakId) ?? breakOptions[0];
  const ModeIcon = MODE_ICONS[mode.icon] ?? Brain;
  const BreakIcon = BREAK_ICONS[breakActivity.icon] ?? Pause;

  const totalForPhase = phase === "break" ? breakSec : focusSec;
  const progressPct = totalForPhase > 0 ? ((totalForPhase - tersisa) / totalForPhase) * 100 : 0;

  const stats = data?.stats;
  const todaySessions = data?.sessions.filter((s) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(s.startedAt) >= today;
  }) ?? [];

  return (
    <div>
      <ViewHeader
        title="Fokus"
        subtitle="Kerja dalam dengan niat, diselingi istirahat penuh kesadaran."
        icon={<TimerIcon className="h-5 w-5" />}
        badge={
          stats?.streak ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Flame className="h-3.5 w-3.5" /> {stats.streak}-hari berturut-turut
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer hero — spans 2 cols */}
        <SpotlightCard className="lg:col-span-2 relative overflow-hidden !p-0">
          <IslamicGeometricPattern className="text-primary" opacity={0.05} size={56} />
          <div className="relative p-6 sm:p-8">
            {/* Phase label */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider",
                  phase === "focusing" && "bg-primary/10 text-primary",
                  phase === "break" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  phase === "paused" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  phase === "done" && "bg-primary/10 text-primary",
                  phase === "idle" && "bg-muted text-muted-foreground"
                )}>
                  {phase === "focusing" && <Sparkles className="h-3 w-3 animate-pulse" />}
                  {phase === "break" && <Coffee className="h-3 w-3" />}
                  {phase === "paused" && <Pause className="h-3 w-3" />}
                  {phase === "done" && <CheckCircle2 className="h-3 w-3" />}
                  {phase === "idle" && <TimerIcon className="h-3 w-3" />}
                  {phase === "break" ? "Istirahat" : phase === "idle" ? "Siap" : phase}
                </span>
                <span className="text-xs text-muted-foreground">
                  {mode.label} · {focusMin}m fokus / {breakMin}m istirahat
                </span>
              </div>
              {completedToday > 0 && (
                <span className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">{completedToday}</span> selesai hari ini
                </span>
              )}
            </div>

            {/* Big timer ring */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative">
                <ProgressRing
                  value={progressPct}
                  size={280}
                  strokeWidth={12}
                  className={cn(
                    phase === "break" ? "text-emerald-500" : "text-primary"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={phase}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {phase === "break" ? (
                          <BreakIcon className="h-7 w-7 text-emerald-500 mb-1" />
                        ) : (
                          <ModeIcon className={cn("h-7 w-7 mb-1", mode.accent)} />
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <div className="text-display text-5xl sm:text-6xl font-semibold tabular-nums tracking-tight">
                      {fmt(tersisa)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                      {phase === "break" ? "menuju fokus" : "tersisa"}
                    </div>
                    {intention && phase !== "idle" && (
                      <p className="mt-3 max-w-[220px] text-center text-xs text-foreground/70 italic line-clamp-2">
                        "{intention}"
                      </p>
                    )}
                  </div>
                </ProgressRing>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 mt-6">
                {phase === "idle" || phase === "done" ? (
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:shadow-premium hover:-translate-y-0.5"
                  >
                    <Play className="h-4 w-4" /> Mulai Fokus
                  </button>
                ) : (
                  <>
                    {phase === "focusing" ? (
                      <button
                        onClick={handlePause}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-600 dark:text-amber-400 transition-all hover:bg-amber-500/20"
                      >
                        <Pause className="h-4 w-4" /> Jeda
                      </button>
                    ) : (
                      <button
                        onClick={handleStart}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:shadow-premium hover:-translate-y-0.5"
                      >
                        <Play className="h-4 w-4" /> Lanjutkan
                      </button>
                    )}
                    <button
                      onClick={handleStop}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:bg-muted/80"
                    >
                      <Square className="h-3.5 w-3.5" /> Berhenti
                    </button>
                  </>
                )}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-foreground/70 transition-all hover:bg-muted/80"
                  title="Atur ulang timer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Mode + break + intention selectors (only when idle) */}
            {phase === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-4"
              >
                {/* Mode picker */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Mode</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FOCUS_MODES.map((m) => {
                      const Icon = MODE_ICONS[m.icon] ?? Brain;
                      const active = m.id === modeId;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setModeId(m.id)}
                          className={cn(
                            "group rounded-xl border p-3 text-left transition-all",
                            active
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border/60 hover:border-border hover:bg-muted/50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", m.bg)}>
                              <Icon className={cn("h-3.5 w-3.5", m.accent)} />
                            </span>
                            <span className="text-arabic text-sm text-muted-foreground">{m.arabic}</span>
                          </div>
                          <p className="text-xs font-medium leading-tight">{m.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aktivitas istirahat */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Aktivitas istirahat</p>
                  <div className="flex flex-wrap gap-2">
                    {breakOptions.map((b) => {
                      const Icon = BREAK_ICONS[b.icon] ?? Pause;
                      const active = b.id === breakId;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setBreakId(b.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                            active
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                          )}
                        >
                          <Icon className="h-3 w-3" /> {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Intention input */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Niat</p>
                  <input
                    type="text"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Apa yang akan kamu fokuskan?"
                    list="focus-intentions"
                    className="w-full rounded-xl border border-border/60 bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <datalist id="focus-intentions">
                    {FOCUS_INTENTIONS.map((i) => (
                      <option key={i} value={i} />
                    ))}
                  </datalist>
                </div>

                {/* Presets */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Preset cepat</p>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_PRESETS.map((p) => {
                      const active = p.focusMin === focusMin && p.breakMin === breakMin;
                      return (
                        <button
                          key={p.id}
                          onClick={() => applyPreset(p.id)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all",
                            active
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                          )}
                        >
                          <span className="font-medium">{p.label}</span>
                          <span className="text-muted-foreground/70">{p.focusMin}/{p.breakMin}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom duration sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Focus: {focusMin}m</span>
                    <input
                      type="range" min={5} max={90} step={5}
                      value={focusMin}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        setFocusMin(v);
                        setRemaining(v * 60);
                      }}
                      className="w-full mt-1 accent-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Istirahat: {breakMin}m</span>
                    <input
                      type="range" min={1} max={30} step={1}
                      value={breakMin}
                      onChange={(e) => setBreakMin(parseInt(e.target.value))}
                      className="w-full mt-1 accent-primary"
                    />
                  </label>
                </div>
              </motion.div>
            )}

            {/* Istirahat prompt (during break) */}
            {phase === "break" && breakActivity.prompt && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"
              >
                <BreakIcon className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-sm text-foreground/80 italic">{breakActivity.prompt}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{breakActivity.description}</p>
              </motion.div>
            )}
          </div>
        </SpotlightCard>

        {/* Right column: stats + today's sessions */}
        <div className="space-y-6">
        {/* Stats card */}
        <SpotlightCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-medium">Fokusmu</h3>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Hari ini" value={stats?.todayCount ?? 0} suffix="sesi" tint="text-primary" bg="bg-primary/10" animate />
            <StatTile label="Hari ini" value={Math.round((stats?.todaySeconds ?? 0) / 60)} suffix="mnt" tint="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" animate />
            <StatTile label="Runtutan" value={stats?.streak ?? 0} suffix="hari" tint="text-amber-600 dark:text-amber-400" bg="bg-amber-500/10" animate icon={<Flame className="h-3.5 w-3.5" />} />
            <StatTile label="Sepanjang waktu" value={stats?.totalSessions ?? 0} suffix="total" tint="text-rose-600 dark:text-rose-400" bg="bg-rose-500/10" animate />
            <StatTile label="Selesai" value={stats?.completedSessions ?? 0} suffix="selesai" tint="text-teal-600 dark:text-teal-400" bg="bg-teal-500/10" animate />
            <StatTile label="Rata-rata" value={stats?.avgMinutesPerSession ?? 0} suffix="mnt/sesi" tint="text-slate-600 dark:text-slate-400" bg="bg-slate-500/10" animate />
          </div>
        </SpotlightCard>

{/* Sesi hari ini */}
        <SpotlightCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-display text-lg font-medium">Sesi hari ini</h3>
            <span className="text-xs text-muted-foreground">{todaySessions.length} total</span>
          </div>
          {todaySessions.length === 0 ? (
            <div className="py-6 text-center">
              <TimerIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada sesi hari ini.</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Tekan Mulai Fokus untuk memulai sesi pertamamu.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-80 overflow-y-auto scroll-slim pr-1">
              {todaySessions.map((s) => {
                const m = FOCUS_MODES.find((x) => x.id === s.mode) ?? FOCUS_MODES[0];
                const Icon = MODE_ICONS[m.icon] ?? Brain;
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3">
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", m.bg)}>
                      <Icon className={cn("h-4 w-4", m.accent)} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.intention ?? m.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(s.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {Math.round(s.elapsedSec / 60)}m / {Math.round(s.durationSec / 60)}m
                      </p>
                    </div>
                    {s.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Belum selesai" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </SpotlightCard>

          {/* Niat yang disarankan */}
          <SectionCard className="relative overflow-hidden">
            <IslamicGeometricPattern className="text-amber-500" opacity={0.04} size={48} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="text-display text-base font-medium">Niat yang disarankan</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Tetapkan niatmu sebelum memulai. Klik untuk menggunakannya.
              </p>
              <div className="flex flex-col gap-1.5">
                {FOCUS_INTENTIONS.slice(0, 6).map((intention_text) => (
                  <button
                    key={intention_text}
                    onClick={() => {
                      setIntention(intention_text);
                      toast.success("Niat ditetapkan", { description: intention_text });
                    }}
                    className={cn(
                      "group flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all",
                      intention === intention_text
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <ChevronRight className={cn(
                      "h-3 w-3 mt-0.5 shrink-0 transition-colors",
                      intention === intention_text ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                    )} />
                    <span className="leading-relaxed">{intention_text}</span>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Bottom: 14-day trend */}
      <SectionCard className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-display text-lg font-medium">Tren fokus 14 hari</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Menit dihabiskan dalam fokus setiap hari.</p>
          </div>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {(data?.trend ?? []).slice(-14).map((d) => {
            const minutes = Math.round(d.totalSec / 60);
            const maxMinutes = 240; // 4 hours cap for visual
            const height = Math.min((minutes / maxMinutes) * 100, 100);
            const isToday = new Date(d.date).toDateString() === new Date().toDateString();
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end justify-center h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "w-full max-w-[24px] rounded-t-md transition-colors",
                      isToday
                        ? "bg-primary"
                        : minutes > 0
                        ? "bg-primary/60 group-hover:bg-primary/80"
                        : "bg-muted group-hover:bg-muted/80"
                    )}
                    title={`${d.date}: ${minutes}m`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/70">
                  {new Date(d.date).toLocaleDateString([], { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Virtue quote */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center"
      >
        <p className="text-arabic text-lg text-primary mb-2">
          إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ
        </p>
        <p className="text-sm text-foreground/80 italic">
"Sesungguhnya Allah mencintai apabila salah seorang dari kalian mengerjakan sesuatu, maka ia menyempurnakannya."
        </p>
        <p className="text-[11px] text-muted-foreground mt-1.5">— Nabi Muhammad ﷺ · Al-Bayhaqi</p>
      </motion.div>
    </div>
  );
}

function StatTile({
  label,
  value,
  suffix,
  tint,
  bg,
  animate,
  icon,
}: {
  label: string;
  value: number;
  suffix: string;
  tint: string;
  bg: string;
  animate?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={cn("flex h-5 w-5 items-center justify-center rounded", bg, tint)}>
          {icon}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        {animate ? (
          <AnimatedNumber value={value} className="text-display text-xl font-semibold tabular-nums" />
        ) : (
          <span className="text-display text-xl font-semibold tabular-nums">{value}</span>
        )}
        <span className="text-[10px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

/* Unused import suppressor for ChevronRight (kept for future CTA) */
// void ChevronRight; — now used by Suggested Intentions card
