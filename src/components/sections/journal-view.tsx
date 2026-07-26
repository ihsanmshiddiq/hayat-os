"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Heart, Sparkles, BookOpen, Check, Calendar as CalIcon, Lightbulb, Shuffle } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { useJournal, useSaveJournal, type JournalEntry } from "@/lib/hooks";
import { getDailyPrompts, JOURNAL_PROMPTS, type JournalPrompt } from "@/lib/islamic";
import { useDebounce } from "@/hooks/use-now";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 1, emoji: "😔", label: "Low" },
  { value: 2, emoji: "😕", label: "Off" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const PROMPT_ICONS: Record<JournalPrompt["category"], React.ReactNode> = {
  gratitude: <Heart className="h-3.5 w-3.5 text-rose-500" />,
  reflection: <Sparkles className="h-3.5 w-3.5 text-amber-500" />,
  lessons: <BookOpen className="h-3.5 w-3.5 text-emerald-500" />,
  dua: <Sparkles className="h-3.5 w-3.5 text-sky-500" />,
};

export function JournalView() {
  const { data } = useJournal(30);
  const save = useSaveJournal();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntry = data?.entries.find((e) => new Date(e.date).toDateString() === today.toDateString());

  const [selectedDate, setSelectedDate] = React.useState<string>(today.toISOString());
  const [gratitude, setGratitude] = React.useState("");
  const [reflection, setReflection] = React.useState("");
  const [lessons, setLessons] = React.useState("");
  const [dua, setDua] = React.useState("");
  const [mood, setMood] = React.useState<number | null>(null);
  const [saved, setSaved] = React.useState(false);

  const selectedEntry = data?.entries.find((e) => new Date(e.date).toDateString() === new Date(selectedDate).toDateString());

  React.useEffect(() => {
    setGratitude(selectedEntry?.gratitude ?? "");
    setReflection(selectedEntry?.reflection ?? "");
    setLessons(selectedEntry?.lessons ?? "");
    setDua(selectedEntry?.dua ?? "");
    setMood(selectedEntry?.mood ?? null);
  }, [selectedEntry?.id, selectedDate]);

  const doSave = (patch: Partial<JournalEntry>) => {
    save.mutate({ date: selectedDate, ...patch });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const debouncedGratitude = useDebounce(gratitude, 800);
  const debouncedReflection = useDebounce(reflection, 800);
  const debouncedLessons = useDebounce(lessons, 800);
  const debouncedDua = useDebounce(dua, 800);

  React.useEffect(() => { if ((selectedEntry?.gratitude ?? "") !== debouncedGratitude) doSave({ gratitude: debouncedGratitude }); }, [debouncedGratitude]);
  React.useEffect(() => { if ((selectedEntry?.reflection ?? "") !== debouncedReflection) doSave({ reflection: debouncedReflection }); }, [debouncedReflection]);
  React.useEffect(() => { if ((selectedEntry?.lessons ?? "") !== debouncedLessons) doSave({ lessons: debouncedLessons }); }, [debouncedLessons]);
  React.useEffect(() => { if ((selectedEntry?.dua ?? "") !== debouncedDua) doSave({ dua: debouncedDua }); }, [debouncedDua]);

  const entries = data?.entries ?? [];

  // Reflection prompts
  const dailyPrompts = React.useMemo(() => getDailyPrompts(new Date(selectedDate)), [selectedDate]);
  const [shuffleIdx, setShuffleIdx] = React.useState(0);
  const promptPool = React.useMemo(() => {
    const sel = new Date(selectedDate);
    const dayIdx = Math.floor((sel.getTime() - new Date(sel.getFullYear(), 0, 0).getTime()) / 86400000);
    return JOURNAL_PROMPTS.map((p, i) => ({ ...p, order: (i + dayIdx) % JOURNAL_PROMPTS.length }));
  }, [selectedDate]);
  const extraPrompt = promptPool[shuffleIdx % promptPool.length];

  const insertPrompt = (cat: JournalPrompt["category"], text: string) => {
    const setters: Record<JournalPrompt["category"], (v: string) => void> = {
      gratitude: setGratitude, reflection: setReflection, lessons: setLessons, dua: setDua,
    };
    const current = { gratitude, reflection, lessons, dua }[cat];
    const next = current ? `${current}\n${text}` : text;
    setters[cat](next);
  };

  return (
    <div>
      <ViewHeader
        title="Daily Journal"
        subtitle="Gratitude, reflection, lessons, and dua — a few minutes a day."
        icon={<PenLine className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Editor + prompts */}
        <div className="space-y-6">
          {/* Reflection prompts */}
          <SectionCard padded={false} className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-display text-sm font-medium">Reflection Prompts</h3>
                  <p className="text-[11px] text-muted-foreground">Tap to add to your entry</p>
                </div>
              </div>
              <button
                onClick={() => setShuffleIdx((i) => i + 1)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium hover:bg-muted transition-colors"
                title="Shuffle prompt"
              >
                <Shuffle className="h-3 w-3" /> Shuffle
              </button>
            </div>
            <div className="p-3 space-y-2">
              {/* Daily prompts (one per category) */}
              {(["gratitude", "reflection", "lessons", "dua"] as const).map((cat) => {
                const p = dailyPrompts[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => insertPrompt(cat, p.text)}
                    className="group w-full text-left rounded-xl border border-border/60 bg-background/40 p-3 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0">{PROMPT_ICONS[cat]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{cat}</p>
                        <p className="text-xs text-foreground/90 leading-relaxed">{p.text}</p>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 text-primary text-xs transition-opacity">+</span>
                    </div>
                  </button>
                );
              })}
              {/* Extra shuffled prompt */}
              <motion.button
                key={extraPrompt.text}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => insertPrompt(extraPrompt.category, extraPrompt.text)}
                className="group w-full text-left rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 hover:bg-primary/10 transition-all"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0">{PROMPT_ICONS[extraPrompt.category]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">Bonus · {extraPrompt.category}</p>
                    <p className="text-xs text-foreground/90 leading-relaxed">{extraPrompt.text}</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </SectionCard>

          {/* Editor */}
          <SectionCard>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CalIcon className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate.slice(0, 10)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value).toISOString())}
                  className="text-sm font-medium bg-transparent border-0 outline-none focus:ring-0"
                />
              </div>
              <span className={cn("flex items-center gap-1 text-[11px] transition-opacity", saved ? "opacity-100 text-emerald-500" : "opacity-0")}>
                <Check className="h-3 w-3" /> Saved
              </span>
            </div>

            {/* Mood */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-muted-foreground mr-1">Mood:</span>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => { setMood(m.value); doSave({ mood: m.value }); }}
                  className={cn("flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all", mood === m.value ? "bg-primary/15 ring-2 ring-primary/30 scale-110" : "hover:bg-muted")}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <JournalField icon={<Heart className="h-3.5 w-3.5 text-rose-500" />} label="Gratitude" value={gratitude} onChange={setGratitude} placeholder="What are you grateful for today?" />
              <JournalField icon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />} label="Reflection" value={reflection} onChange={setReflection} placeholder="How was your day? What did you learn?" multiline />
              <JournalField icon={<BookOpen className="h-3.5 w-3.5 text-emerald-500" />} label="Lessons learned" value={lessons} onChange={setLessons} placeholder="What will you do differently tomorrow?" multiline />
              <JournalField icon={<Sparkles className="h-3.5 w-3.5 text-sky-500" />} label="Dua" value={dua} onChange={setDua} placeholder="What are you asking Allah for?" multiline />
            </div>
          </SectionCard>
        </div>

        {/* History + mood trend */}
        <div className="space-y-6">
          {/* Mood trend mini-chart */}
          {entries.length > 0 ? (
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-display text-sm font-medium">Mood trend</h3>
                  <p className="text-[11px] text-muted-foreground">Last 14 entries</p>
                </div>
                {(() => {
                  const recent = entries.slice(0, 14).filter((e) => e.mood != null);
                  if (recent.length === 0) return null;
                  const avg = recent.reduce((a, e) => a + (e.mood ?? 0), 0) / recent.length;
                  const moodObj = MOODS.find((m) => m.value === Math.round(avg));
                  return (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-muted-foreground">Avg</span>
                      <span className="text-base">{moodObj?.emoji ?? "—"}</span>
                      <span className="font-medium tabular-nums">{avg.toFixed(1)}</span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-end justify-between gap-1 h-16">
                {entries.slice(0, 14).reverse().map((e, i) => {
                  const m = e.mood ?? 0;
                  const pct = m ? (m / 5) * 100 : 0;
                  const moodObj = MOODS.find((x) => x.value === m);
                  const isToday = new Date(e.date).toDateString() === today.toDateString();
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full h-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: m ? `${pct}%` : "8%" }}
                          transition={{ duration: 0.4, delay: i * 0.02 }}
                          className={cn(
                            "w-full rounded-sm transition-colors",
                            m === 0 ? "bg-muted" :
                            m <= 2 ? "bg-rose-400/70" :
                            m === 3 ? "bg-amber-400/70" :
                            "bg-emerald-500/80",
                            isToday && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background"
                          )}
                          title={`${new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${moodObj?.label ?? "No mood"}`}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground/70">
                        {new Date(e.date).toLocaleDateString("en-US", { day: "numeric" })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-rose-400/70" /> Low</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400/70" /> Okay</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500/80" /> Good</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{entries.filter((e) => e.mood != null).length}/{entries.length} entries rated</span>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard padded={false}>
            <div className="p-4 border-b border-border/60">
              <h3 className="text-display text-base font-medium">Recent entries</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{entries.length} in the last 30 days</p>
            </div>
            <div className="max-h-[560px] overflow-y-auto scroll-slim p-2">
              <AnimatePresence>
                {entries.map((e) => {
                  const d = new Date(e.date);
                  const selected = new Date(selectedDate).toDateString() === d.toDateString();
                  const moodObj = MOODS.find((m) => m.value === e.mood);
                  return (
                    <motion.button
                      key={e.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedDate(e.date)}
                      className={cn("w-full text-left rounded-xl p-3 transition-colors", selected ? "bg-primary/8" : "hover:bg-muted/50")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">{d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        {moodObj ? <span className="text-base">{moodObj.emoji}</span> : null}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {e.reflection || e.gratitude || "Empty entry"}
                      </p>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              {entries.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No entries yet.</div>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function JournalField({
  icon, label, value, onChange, placeholder, multiline,
}: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; placeholder: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">{icon} {label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/40 outline-none transition-colors scroll-slim leading-relaxed" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/40 outline-none transition-colors" />
      )}
    </div>
  );
}
