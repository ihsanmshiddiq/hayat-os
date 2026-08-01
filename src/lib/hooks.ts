"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineRequest } from "@/lib/offline-queue";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  // Supabase's browser session may live in local storage, while API routes run
  // on the server. Forward the access token explicitly so every API call is
  // scoped to the signed-in user instead of falling back to demo data.
  const { data: { session } } = await createClient().auth.getSession();
  const authorization = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (authorization.Authorization) headers.set("Authorization", authorization.Authorization);
  const method = (init?.method ?? "GET").toUpperCase();
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (error) {
    if (method !== "GET" && typeof init?.body === "string") {
      enqueueOfflineRequest({ url, method, body: init.body });
      return { ok: true, queued: true } as T;
    }
    throw error;
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/* ---------------- Dashboard ---------------- */

export interface DashboardData {
  user: {
    id: string;
    name: string | null;
    email: string;
    location: string | null;
    latitude: number | null;
    longitude: number | null;
    method: string | null;
  };
  today: {
    date: string;
    completion: { done: number; total: number; percent: number };
    streak: number;
    focus: string;
    prayers: {
      fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean; sunnah: number;
    } | null;
    quran: {
      pagesRead: number; targetPages: number; lastSurah: string | null; lastAyah: number | null;
      memorizedAyahs: number; minutesSpent: number; ayahsRead: number;
    } | null;
    journal: { id: string; mood: number | null } | null;
  };
  prayerHistory: {
    date: string; fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean;
    count: number; sunnah: number;
  }[];
  quranHistory: { date: string; pagesRead: number; targetPages: number; minutesSpent: number }[];
  habits: {
    id: string; name: string; icon: string; color: string; category: string | null; cue: string | null; reward: string | null;
    schedule: string; logs: { date: string; done: boolean }[]; streak: number;
  }[];
  goals: {
    id: string; title: string; category: string; progress: number; milestone: string | null;
    done: boolean; targetDate: string | null;
  }[];
  upcomingEvents: {
    id: string; title: string; date: string; time: string | null; type: string; note: string | null;
  }[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => json<DashboardData>("/api/dashboard"),
  });
}

/* ---------------- Prayer ---------------- */

export function useTogglePrayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; value: boolean }) =>
      json("/api/prayer", { method: "PATCH", body: JSON.stringify(vars) }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["dashboard"] });
      const prev = qc.getQueryData<DashboardData>(["dashboard"]);
      if (prev && prev.today.prayers) {
        qc.setQueryData<DashboardData>(["dashboard"], {
          ...prev,
          today: {
            ...prev.today,
            prayers: { ...prev.today.prayers, [vars.prayer]: vars.value },
          },
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["dashboard"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSunnah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (delta: number) =>
      json<{ sunnah: number }>("/api/prayer", { method: "POST", body: JSON.stringify({ delta }) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

/* ---------------- Quran ---------------- */

export function useUpdateQuran() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: Record<string, unknown>) =>
      json("/api/quran", { method: "PATCH", body: JSON.stringify(vars) }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["quran"] });
      qc.invalidateQueries({ queryKey: ["khatma"] });
    },
  });
}

export interface QuranLogItem {
  date: string; pagesRead: number; ayahsRead: number; lastSurah: string | null; lastAyah: number | null;
  memorizedAyahs: number; targetPages: number; minutesSpent: number;
}

export function useQuran(days = 30) {
  return useQuery({
    queryKey: ["quran", days],
    queryFn: () => json<{ logs: QuranLogItem[]; totals: { pagesRead: number; memorizedAyahs: number; minutesSpent: number } }>(`/api/quran?days=${days}`),
  });
}

/* ---------------- Habits ---------------- */

export function useToggleHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { habitId: string; done: boolean; date?: string }) =>
      json("/api/habits", { method: "PATCH", body: JSON.stringify(vars) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name: string; icon?: string; color?: string; category?: string; cue?: string; reward?: string }) =>
      json("/api/habits", { method: "POST", body: JSON.stringify(vars) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json(`/api/habits?id=${id}`, { method: "DELETE" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["dashboard"] }),
  });
}

/* ---------------- Journal ---------------- */

export interface JournalEntry {
  id: string; date: string; gratitude: string | null; reflection: string | null;
  lessons: string | null; dua: string | null; mood: number | null;
}

export function useJournal(days = 30) {
  return useQuery({
    queryKey: ["journal", days],
    queryFn: () => json<{ entries: JournalEntry[] }>(`/api/journal?days=${days}`),
  });
}

export function useSaveJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: Record<string, unknown>) =>
      json("/api/journal", { method: "PUT", body: JSON.stringify(vars) }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ---------------- Notes ---------------- */

export interface Note {
  id: string; title: string; content: string; folder: string; tags: string[];
  pinned: boolean; updatedAt: string; createdAt: string;
}

export function useNotes(folder?: string) {
  return useQuery({
    queryKey: ["notes", folder],
    queryFn: () => json<{ notes: Note[]; folders: string[] }>(
      `/api/notes${folder ? `?folder=${encodeURIComponent(folder)}` : ""}`
    ),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation<{ note: Note }, Error, { title: string; content?: string; folder?: string; tags?: string }>({
    mutationFn: (vars: { title: string; content?: string; folder?: string; tags?: string }) =>
      json("/api/notes", { method: "POST", body: JSON.stringify(vars) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) =>
      json(`/api/notes?id=${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json(`/api/notes?id=${id}`, { method: "DELETE" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

/* ---------------- Goals ---------------- */

export interface Goal {
  id: string; title: string; category: string; progress: number; milestone: string | null;
  done: boolean; targetDate: string | null;
}

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: () => json<{ goals: Goal[] }>("/api/goals"),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title: string; category?: string; progress?: number; milestone?: string }) =>
      json("/api/goals", { method: "POST", body: JSON.stringify(vars) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) =>
      json(`/api/goals?id=${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json(`/api/goals?id=${id}`, { method: "DELETE" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

/* ---------------- Calendar ---------------- */

export interface CalendarEventItem {
  id: string; title: string; date: string; time: string | null; type: string; note: string | null;
}

export function useCalendar(month: { year: number; month: number }) {
  const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
  return useQuery({
    queryKey: ["calendar", key],
    queryFn: () =>
      json<{
        month: { year: number; month: number };
        events: CalendarEventItem[];
        islamic: { date: string; name: string; type: string }[];
      }>(`/api/calendar?month=${key}`),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title: string; date: string; time?: string; type?: string; note?: string }) =>
      json("/api/calendar", { method: "POST", body: JSON.stringify(vars) }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json(`/api/calendar?id=${id}`, { method: "DELETE" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["calendar"] }),
  });
}

/* ---------------- Achievements ---------------- */

export interface AchievementsData {
  prayerStreak: number;
  totalPrayersDone: number;
  perfectDays: number;
  perfectWeekStreak: number;
  fajrOnTimeStreak: number;
  totalQuranPages: number;
  bestHabitCheckins: number;
  totalHabitCheckins: number;
  totalJournalEntries: number;
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: () => json<AchievementsData>("/api/achievements"),
  });
}

/* ---------------- Sunnah Fasts ---------------- */

export interface SunnahFastType {
  id: string;
  name: string;
  arabic: string;
  description: string;
  schedule: "weekly" | "monthly" | "annual";
  when?: { dow?: number; hijriDay?: number; hijriMonth?: number; hijriDays?: number[] };
  virtue: string;
}

export interface SunnahFastItem {
  id: string;
  date: string;
  fastType: string;
  note: string | null;
}

export interface FastsResponse {
  fasts: SunnahFastItem[];
  types: SunnahFastType[];
  suggestedToday: string[];
  today: string;
}

export function useFasts(days = 30) {
  return useQuery({
    queryKey: ["fasts", days],
    queryFn: () => json<FastsResponse>(`/api/fasts?days=${days}`),
  });
}

export function useToggleFast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { date?: string; fastType: string; on: boolean; note?: string }) => {
      if (vars.on) {
        return json<{ ok: boolean; id?: string }>("/api/fasts", {
          method: "POST",
          body: JSON.stringify({ date: vars.date, fastType: vars.fastType, note: vars.note }),
        });
      }
      // Find and delete by date+type via query list (the API exposes id-based delete)
      const cur = qc.getQueryData<FastsResponse>(["fasts", 30]);
      const match = cur?.fasts.find(
        (f) => f.fastType === vars.fastType && new Date(f.date).toDateString() === new Date(vars.date ?? Date.now()).toDateString()
      );
      if (match) {
        return json<{ ok: boolean }>(`/api/fasts?id=${match.id}`, { method: "DELETE" });
      }
      return { ok: true };
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["fasts"] });
      const prev = qc.getQueryData<FastsResponse>(["fasts", 30]);
      if (prev) {
        const targetDate = new Date(vars.date ?? Date.now());
        targetDate.setHours(0, 0, 0, 0);
        const exists = prev.fasts.find(
          (f) => f.fastType === vars.fastType && new Date(f.date).toDateString() === targetDate.toDateString()
        );
        if (vars.on && !exists) {
          qc.setQueryData<FastsResponse>(["fasts", 30], {
            ...prev,
            fasts: [
              ...prev.fasts,
              { id: `temp-${Date.now()}`, date: targetDate.toISOString(), fastType: vars.fastType, note: vars.note ?? null },
            ],
          });
        } else if (!vars.on && exists) {
          qc.setQueryData<FastsResponse>(["fasts", 30], {
            ...prev,
            fasts: prev.fasts.filter((f) => f.id !== exists.id),
          });
        }
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["fasts", 30], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["fasts"] });
    },
  });
}

/* ---------------- Settings ---------------- */

export interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  method: string | null;
  menstrualEnabled: boolean;
  methods: { key: string; name: string }[];
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => json<UserSettings>("/api/settings"),
  });
}

/* ---------------- Finance ---------------- */
export interface FinanceTransaction { id: string; amount: number; type: "income" | "expense"; category: string; note: string | null; date: string; }
export interface BudgetItem { id: string; category: string; monthlyLimit: number; }
export function useFinance() { return useQuery({ queryKey: ["finance"], queryFn: () => json<{ transactions: FinanceTransaction[]; budgets: BudgetItem[]; summary: { income: number; expense: number; balance: number } }>("/api/finance") }); }
export function useCreateFinance() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: Record<string, unknown>) => json("/api/finance", { method: "POST", body: JSON.stringify(body) }), onSettled: () => qc.invalidateQueries({ queryKey: ["finance"] }) }); }
export function useDeleteFinance() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => json(`/api/finance?id=${id}`, { method: "DELETE" }), onSettled: () => qc.invalidateQueries({ queryKey: ["finance"] }) }); }

/* ---------------- Menstrual cycle ---------------- */
export interface MenstrualLog { id: string; startDate: string; endDate: string | null; symptoms: string | null; note: string | null; }
export function useMenstrual() { return useQuery({ queryKey: ["menstrual"], queryFn: () => json<{ logs: MenstrualLog[]; insights: { averageCycle: number; averageDuration: number; nextDate: string | null } }>("/api/menstrual") }); }
export function useCreateMenstrual() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: Record<string, unknown>) => json("/api/menstrual", { method: "POST", body: JSON.stringify(body) }), onSettled: () => qc.invalidateQueries({ queryKey: ["menstrual"] }) }); }
export function useUpdateMenstrual() { const qc = useQueryClient(); return useMutation({ mutationFn: (vars: { id: string; body: Record<string, unknown> }) => json(`/api/menstrual?id=${vars.id}`, { method: "PATCH", body: JSON.stringify(vars.body) }), onSettled: () => qc.invalidateQueries({ queryKey: ["menstrual"] }) }); }

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { name?: string; location?: string; latitude?: number; longitude?: number; method?: string; menstrualEnabled?: boolean }) =>
      json<{ ok: boolean; user: UserSettings }>("/api/settings", { method: "PUT", body: JSON.stringify(vars) }),
    onSuccess: (data) => {
      qc.setQueryData(["settings"], data.user);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/* ---------------- Focus / Pomodoro ---------------- */

export interface FocusSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  durationSec: number;
  elapsedSec: number;
  mode: string;
  breakActivity: string | null;
  completed: boolean;
  intention: string | null;
}

export interface FocusStats {
  totalSessions: number;
  totalSeconds: number;
  completedSessions: number;
  todayCount: number;
  todaySeconds: number;
  streak: number;
  avgMinutesPerSession: number;
}

export interface FocusResponse {
  sessions: FocusSession[];
  trend: { date: string; count: number; totalSec: number; completed: number }[];
  stats: FocusStats;
}

export function useFocus(days = 30) {
  return useQuery({
    queryKey: ["focus", days],
    queryFn: () => json<FocusResponse>(`/api/focus?days=${days}`),
  });
}

export function useStartFocus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { durationSec: number; mode?: string; breakActivity?: string; intention?: string }) =>
      json<{ ok: boolean; session: FocusSession }>("/api/focus", {
        method: "POST",
        body: JSON.stringify({ action: "start", ...vars }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus"] });
    },
  });
}

export function useStopFocus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; elapsedSec: number; completed: boolean }) =>
      json<{ ok: boolean; session: FocusSession }>("/api/focus", {
        method: "POST",
        body: JSON.stringify({
          action: vars.completed ? "complete" : "stop",
          id: vars.id,
          elapsedSec: vars.elapsedSec,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["focus"] });
    },
  });
}

/* ---------------- Hifz (Quran Memorization) ---------------- */

export type HifzStatus = "not_started" | "in_progress" | "memorized" | "needs_review";

export interface HifzSurahItem {
  number: number;
  name: string;
  arabic: string;
  english: string;
  ayahs: number;
  revelation: "meccan" | "medinan";
  status: HifzStatus;
  memorizedFrom: number;
  memorizedTo: number;
  memorizedAyahs: number;
  lastReviewed: string | null;
  note: string | null;
  daysUntilReview: number;
}

export interface HifzStats {
  memorizedSurahs: number;
  inProgress: number;
  needsReview: number;
  totalSurahs: number;
  totalMemorizedAyahs: number;
  totalQuranAyahs: number;
  percentQuran: number;
  dueForReview: number;
  reviewedThisWeek: number;
}

export interface HifzResponse {
  surahs: HifzSurahItem[];
  stats: HifzStats;
}

export function useHifz() {
  return useQuery({
    queryKey: ["hifz"],
    queryFn: () => json<HifzResponse>(`/api/hifz`),
  });
}

export function useUpdateHifz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      surahNumber: number;
      status?: HifzStatus;
      memorizedFrom?: number;
      memorizedTo?: number;
      note?: string;
      reviewed?: boolean;
    }) => json<{ ok: boolean; id: string }>("/api/hifz", { method: "PATCH", body: JSON.stringify(vars) }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["hifz"] });
      const prev = qc.getQueryData<HifzResponse>(["hifz"]);
      if (prev) {
        const newSurahs = prev.surahs.map((s) => {
          if (s.number !== vars.surahNumber) return s;
          const status = vars.status ?? s.status;
          const memorizedFrom = vars.memorizedFrom ?? s.memorizedFrom;
          const memorizedTo = vars.memorizedTo ?? s.memorizedTo;
          // For memorized & needs_review: full surah is memorized
          const memorizedAyahs =
            status === "memorized" || status === "needs_review"
              ? s.ayahs
              : Math.max(0, memorizedTo - memorizedFrom + 1);
          return {
            ...s,
            status,
            memorizedFrom: status === "memorized" || status === "needs_review" ? 1 : memorizedFrom,
            memorizedTo: status === "memorized" || status === "needs_review" ? s.ayahs : memorizedTo,
            memorizedAyahs,
            lastReviewed: vars.reviewed ? new Date().toISOString() : s.lastReviewed,
            note: vars.note ?? s.note,
          };
        });
        const memorizedSurahs = newSurahs.filter((s) => s.status === "memorized").length;
        const inProgress = newSurahs.filter((s) => s.status === "in_progress").length;
        const needsReview = newSurahs.filter((s) => s.status === "needs_review").length;
        const totalMemorizedAyahs = newSurahs.reduce((a, s) => a + s.memorizedAyahs, 0);
        qc.setQueryData<HifzResponse>(["hifz"], {
          surahs: newSurahs,
          stats: {
            ...prev.stats,
            memorizedSurahs,
            inProgress,
            needsReview,
            totalMemorizedAyahs,
            percentQuran: Math.round((totalMemorizedAyahs / prev.stats.totalQuranAyahs) * 1000) / 10,
          },
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["hifz"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["hifz"] });
    },
  });
}

/* ---------------- Sadaqah / Charity ---------------- */

export interface SadaqahEntryItem {
  id: string;
  date: string;
  amount: number;
  unit: string;
  type: string;
  recipient: string | null;
  note: string | null;
}

export interface SadaqahType {
  id: string;
  name: string;
  arabic: string;
  description: string;
  color: string;
  obligatory: boolean;
}

export interface SadaqahStats {
  totalIDR: number;
  totalUSD: number;
  totalHours: number;
  totalItems: number;
  monthIDR: number;
  monthCount: number;
  totalEntries: number;
  byType: { id: string; name: string; color: string; obligatory: boolean; count: number; total: number }[];
}

export interface SadaqahResponse {
  entries: SadaqahEntryItem[];
  types: SadaqahType[];
  series: { date: string; total: number; count: number }[];
  stats: SadaqahStats;
  today: string;
}

export function useSadaqah(days = 30) {
  return useQuery({
    queryKey: ["sadaqah", days],
    queryFn: () => json<SadaqahResponse>(`/api/sadaqah?days=${days}`),
  });
}

export function useAddSadaqah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      date?: string;
      amount: number;
      unit: string;
      type: string;
      recipient?: string;
      note?: string;
    }) => json<{ ok: boolean; id: string }>("/api/sadaqah", { method: "POST", body: JSON.stringify(vars) }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["sadaqah"] });
    },
  });
}

export function useDeleteSadaqah() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json<{ ok: boolean }>(`/api/sadaqah?id=${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["sadaqah"] });
      const prev = qc.getQueryData<SadaqahResponse>(["sadaqah", 30]);
      if (prev) {
        qc.setQueryData<SadaqahResponse>(["sadaqah", 30], {
          ...prev,
          entries: prev.entries.filter((e) => e.id !== id),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["sadaqah", 30], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["sadaqah"] });
    },
  });
}

/* ============================== ZAKAT ============================== */

export interface ZakatAssetType {
  id: string;
  name: string;
  arabic: string;
  description: string;
  icon: string;
  zakatable: boolean;
  unit: "idr" | "gram" | "usd";
  hint?: string;
}

export interface ZakatCalculation {
  id: string;
  calculationDate: string;
  hawlStartDate: string;
  hawlEndDate: string;
  nisabStandard: "gold" | "silver";
  nisabThresholdIDR: number;
  totalAssetsIDR: number;
  totalLiabilitiesIDR: number;
  zakatableBaseIDR: number;
  zakatDueIDR: number;
  isPaid: boolean;
  paidDate: string | null;
  note: string | null;
  breakdown: Record<string, { amount: number; valueIDR: number }> | null;
}

export interface ZakatStats {
  totalCalculations: number;
  totalPaidZakat: number;
  totalPendingZakat: number;
  yearTotal: number;
}

export interface ZakatResponse {
  history: ZakatCalculation[];
  latest: ZakatCalculation | null;
  upcomingDue: ZakatCalculation | null;
  stats: ZakatStats;
  assetTypes: ZakatAssetType[];
  constants: {
    zakatRate: number;
    hawlDays: number;
    goldPricePerGramIDR: number;
    silverPricePerGramIDR: number;
    nisabGoldIDR: number;
    nisabSilverIDR: number;
  };
}

export function useZakat() {
  return useQuery({
    queryKey: ["zakat"],
    queryFn: () => json<ZakatResponse>(`/api/zakat`),
  });
}

export function useSaveZakat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      nisabStandard: "gold" | "silver";
      totalAssetsIDR: number;
      totalLiabilitiesIDR: number;
      zakatableBaseIDR: number;
      zakatDueIDR: number;
      breakdown: Record<string, { amount: number; valueIDR: number }>;
      hawlStartDate?: string;
      note?: string;
    }) => json<{ ok: boolean; id: string; calculation: ZakatCalculation }>("/api/zakat", {
      method: "POST",
      body: JSON.stringify(vars),
    }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["zakat"] });
    },
  });
}

export function useUpdateZakat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPaid, note }: { id: string; isPaid?: boolean; note?: string }) =>
      json<{ ok: boolean; calculation: ZakatCalculation }>(`/api/zakat?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPaid, note }),
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["zakat"] });
    },
  });
}

export function useDeleteZakat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json<{ ok: boolean }>(`/api/zakat?id=${id}`, { method: "DELETE" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["zakat"] });
    },
  });
}

/* ---------------- Khatma (Quran Reading Plan) ---------------- */

export interface KhatmaJuz {
  juz: number;
  pagesRead: number;
  totalPages: number;
  pct: number;
}

export interface KhatmaDailyHistory {
  date: string;
  pagesRead: number;
  target: number;
  met: boolean;
}

export interface KhatmaActive {
  id: string;
  name: string;
  scope: string;
  startPage: number;
  endPage: number;
  totalPages: number;
  startDate: string;
  targetDays: number;
  dailyTarget: number;
  isActive: boolean;
  pagesReadSinceStart: number;
  daysElapsed: number;
  daysRemaining: number;
  avgPacePerDay: number;
  projectedEndDate: string;
  projectedTotalDays: number;
  onPace: boolean;
  completionPct: number;
  streak: number;
  juzProgress: KhatmaJuz[];
  dailyHistory: KhatmaDailyHistory[];
}

export interface KhatmaHistoryItem {
  id: string;
  name: string;
  scope: string;
  totalPages: number;
  targetDays: number;
  startDate: string;
  completedAt: string | null;
  isActive: boolean;
}

export interface KhatmaResponse {
  active: KhatmaActive | null;
  history: KhatmaHistoryItem[];
}

export function useKhatma() {
  return useQuery({
    queryKey: ["khatma"],
    queryFn: () => json<KhatmaResponse>(`/api/khatma?summary=1`),
  });
}

export function useCreateKhatma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      name?: string;
      scope: string;
      targetDays?: number;
      dailyTarget?: number;
      startPage?: number;
      endPage?: number;
    }) => json<{ plan: KhatmaHistoryItem }>("/api/khatma", {
      method: "POST",
      body: JSON.stringify(vars),
    }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["khatma"] });
    },
  });
}

export function useUpdateKhatma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      id?: string;
      name?: string;
      targetDays?: number;
      dailyTarget?: number;
      isActive?: boolean;
    }) => json<{ plan: KhatmaHistoryItem }>(`/api/khatma?id=${vars.id ?? "active"}`, {
      method: "PATCH",
      body: JSON.stringify(vars),
    }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["khatma"] });
    },
  });
}

export function useDeleteKhatma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => json<{ ok: boolean }>(`/api/khatma?id=${id}`, { method: "DELETE" }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["khatma"] });
    },
  });
}
