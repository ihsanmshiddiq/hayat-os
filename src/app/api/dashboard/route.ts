import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/dashboard — aggregated overview for the dashboard home. */
async function loadDashboard() {
  const user = await ensureSeedData();
  const userId = user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday start
  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

  const [prayerToday, quranToday, habits, journalToday, goals, events] =
    await Promise.all([
      db.prayerLog.findUnique({ where: { userId_date: { userId, date: today } } }),
      db.quranLog.findUnique({ where: { userId_date: { userId, date: today } } }),
      db.habit.findMany({
        where: { userId },
        include: {
          logs: {
            where: { date: { gte: startOfPrevWeek } },
            orderBy: { date: "asc" },
          },
        },
      }),
      db.journal.findUnique({ where: { userId_date: { userId, date: today } } }),
      db.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.calendarEvent.findMany({
        where: { userId, date: { gte: today } },
        orderBy: { date: "asc" },
        take: 5,
      }),
    ]);

  // 14-day prayer history for charts
  const prayerHistory = await db.prayerLog.findMany({
    where: { userId, date: { gte: startOfPrevWeek } },
    orderBy: { date: "asc" },
  });

  const quranHistory = await db.quranLog.findMany({
    where: { userId, date: { gte: startOfPrevWeek } },
    orderBy: { date: "asc" },
  });

  // Today's completion (prayers + quran + journal)
  const prayersDone = prayerToday
    ? [prayerToday.fajr, prayerToday.dhuhr, prayerToday.asr, prayerToday.maghrib, prayerToday.isha].filter(Boolean).length
    : 0;
  const quranDone = (quranToday?.pagesRead ?? 0) >= (quranToday?.targetPages ?? 2) ? 1 : 0;
  const journalDone = journalToday ? 1 : 0;
  const totalTasks = 5 + 1 + 1; // 5 prayers + quran + journal
  const doneTasks = prayersDone + quranDone + journalDone;

  // Current streak — consecutive days with at least 4 prayers done
  let streak = 0;
  const allPrayers = await db.prayerLog.findMany({
    where: { userId, date: { lt: today } },
    orderBy: { date: "desc" },
  });
  for (const p of allPrayers) {
    const c = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length;
    if (c >= 4) streak++;
    else break;
  }

  // Focus item: highest priority incomplete task
  const focus =
    !prayerToday?.fajr ? "Fajr prayer"
    : !(quranToday && quranToday.pagesRead >= (quranToday.targetPages ?? 2)) ? "Quran reading"
    : !prayerToday?.dhuhr ? "Dhuhr prayer"
    : !prayerToday?.asr ? "Asr prayer"
    : !journalToday ? "Daily journal"
    : "Continue your streak";

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      latitude: user.latitude,
      longitude: user.longitude,
      method: user.method ?? "Kemenag",
    },
    today: {
      date: today.toISOString(),
      completion: { done: doneTasks, total: totalTasks, percent: Math.round((doneTasks / totalTasks) * 100) },
      streak,
      focus,
      prayers: prayerToday,
      quran: quranToday,
      journal: journalToday,
    },
    prayerHistory: prayerHistory.map((p) => ({
      date: p.date,
      fajr: p.fajr, dhuhr: p.dhuhr, asr: p.asr, maghrib: p.maghrib, isha: p.isha,
      count: [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length,
      sunnah: p.sunnah,
    })),
    quranHistory: quranHistory.map((q) => ({
      date: q.date,
      pagesRead: q.pagesRead,
      targetPages: q.targetPages,
      minutesSpent: q.minutesSpent,
    })),
    habits: habits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      color: h.color,
      category: h.category,
      cue: h.cue,
      reward: h.reward,
      schedule: h.schedule,
      logs: h.logs.map((l) => ({ date: l.date, done: l.done })),
      streak: computeHabitStreak(h.logs),
    })),
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      progress: g.progress,
      milestone: g.milestone,
      done: g.done,
      targetDate: g.targetDate,
    })),
    upcomingEvents: events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      type: e.type,
      note: e.note,
    })),
  };
}

/**
 * The dashboard remains reviewable when the optional demo database is offline.
 * Mutating routes still require the database; this read-only fallback avoids a
 * blank application shell while configuration is being completed.
 */
export async function GET() {
  try {
    const dashboard = await Promise.race([
      loadDashboard(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database timeout")), 5000)),
    ]);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Dashboard database fallback:", error);
    return NextResponse.json(createDemoDashboard(), { headers: { "x-hayat-data-source": "demo-fallback" } });
  }
}

function createDemoDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const history = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    const completed = index % 4 === 0 ? 3 : 4;
    return { date, fajr: true, dhuhr: true, asr: completed >= 3, maghrib: completed >= 4, isha: index % 3 !== 0, sunnah: index % 3 };
  });
  return {
    user: { id: "demo", name: "Anda", email: "demo@hayat.app", location: "Jakarta, Indonesia", latitude: -6.2088, longitude: 106.8456, method: "Kemenag" },
    today: {
      date: today.toISOString(), completion: { done: 0, total: 7, percent: 0 }, streak: 4, focus: "Mulai dengan niat baik hari ini",
      prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false, sunnah: 0 },
      quran: { pagesRead: 0, targetPages: 2, lastSurah: "Al-Fatihah", lastAyah: 7, memorizedAyahs: 0, minutesSpent: 0, ayahsRead: 0 }, journal: null,
    },
    prayerHistory: history.map((entry) => ({ ...entry, count: [entry.fajr, entry.dhuhr, entry.asr, entry.maghrib, entry.isha].filter(Boolean).length })),
    quranHistory: history.map((entry, index) => ({ date: entry.date, pagesRead: index % 4 === 0 ? 0 : 2, targetPages: 2, minutesSpent: index % 4 === 0 ? 0 : 15 })),
    habits: [], goals: [], upcomingEvents: [],
  };
}

function computeHabitStreak(logs: { date: Date; done: boolean }[]): number {
  const sorted = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  // allow today to be not-yet-done without breaking streak
  for (const l of sorted) {
    const d = new Date(l.date);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
    if (diff === 0) {
      if (l.done) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      // if today not done yet, keep cursor at today and continue
    } else if (diff === 1 && l.done) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diff > 1) {
      break;
    } else if (!l.done) {
      break;
    }
  }
  return streak;
}
