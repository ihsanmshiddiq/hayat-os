"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { PenLine, Heart, Sparkles, BookOpen, Save, Check } from "lucide-react";
import { useJournal, useSaveJournal, type JournalEntry } from "@/lib/hooks";
import { useAppStore } from "@/lib/store";
import { useDebounce } from "@/hooks/use-now";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 1, label: "Low", emoji: "😔" },
  { value: 2, label: "Off", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😊" },
];

export function JournalQuickEntry() {
  const { data } = useJournal(7);
  const save = useSaveJournal();
  const { setActiveView } = useAppStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEntry = data?.entries.find((e) => new Date(e.date).toDateString() === today.toDateString());

  const [gratitude, setGratitude] = React.useState("");
  const [reflection, setReflection] = React.useState("");
  const [dua, setDua] = React.useState("");
  const [mood, setMood] = React.useState<number | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (todayEntry) {
      setGratitude(todayEntry.gratitude ?? "");
      setReflection(todayEntry.reflection ?? "");
      setDua(todayEntry.dua ?? "");
      setMood(todayEntry.mood ?? null);
    }
  }, [todayEntry?.id]);

  const debouncedGratitude = useDebounce(gratitude, 800);
  const debouncedReflection = useDebounce(reflection, 800);
  const debouncedDua = useDebounce(dua, 800);

  const doSave = React.useCallback(
    (patch: Partial<JournalEntry>) => {
      save.mutate({ date: today.toISOString(), ...patch });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
    [save, today]
  );

  React.useEffect(() => {
    if (!todayEntry && !debouncedGratitude) return;
    if ((todayEntry?.gratitude ?? "") === debouncedGratitude) return;
    doSave({ gratitude: debouncedGratitude });
  }, [debouncedGratitude]);
  React.useEffect(() => {
    if (!todayEntry && !debouncedReflection) return;
    if ((todayEntry?.reflection ?? "") === debouncedReflection) return;
    doSave({ reflection: debouncedReflection });
  }, [debouncedReflection]);
  React.useEffect(() => {
    if (!todayEntry && !debouncedDua) return;
    if ((todayEntry?.dua ?? "") === debouncedDua) return;
    doSave({ dua: debouncedDua });
  }, [debouncedDua]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.3 }}
      className="rounded-2xl border border-border/70 bg-card shadow-soft p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <PenLine className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h3 className="text-display text-lg font-medium tracking-tight">Jurnal Harian</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("flex items-center gap-1 text-[11px] transition-opacity", saved ? "opacity-100 text-emerald-500" : "opacity-0")}>
            <Check className="h-3 w-3" /> Saved
          </span>
          <Save className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
        </div>
      </div>

      {/* Mood */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground mr-1">Mood:</span>
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => {
              setMood(m.value);
              doSave({ mood: m.value });
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-base transition-all",
              mood === m.value ? "bg-primary/15 ring-2 ring-primary/30 scale-110" : "hover:bg-muted"
            )}
            title={m.label}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <JournalField
          icon={<Heart className="h-3.5 w-3.5 text-rose-500" />}
          label="Gratitude"
          placeholder="What are you grateful for today?"
          value={gratitude}
          onChange={setGratitude}
        />
        <JournalField
          icon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
          label="Reflection"
          placeholder="How was your day? What did you learn?"
          value={reflection}
          onChange={setReflection}
          multiline
        />
        <JournalField
          icon={<BookOpen className="h-3.5 w-3.5 text-emerald-500" />}
          label="Dua"
          placeholder="What are you asking Allah for?"
          value={dua}
          onChange={setDua}
          multiline
        />
      </div>

      <button
        onClick={() => setActiveView("journal")}
        className="mt-4 text-sm text-primary font-medium hover:underline underline-offset-4"
      >
        Open full journal →
      </button>
    </motion.div>
  );
}

function JournalField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
        {icon} {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/40 outline-none transition-colors scroll-slim"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/40 outline-none transition-colors"
        />
      )}
    </div>
  );
}
