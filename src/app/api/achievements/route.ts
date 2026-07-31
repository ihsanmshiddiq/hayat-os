import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/achievements — lifetime aggregates used to compute badge progress. */
export async function GET() {
  const user = await ensureSeedData();
  const userId = user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    allPrayers,
    allQuran,
    allHabits,
    allJournals,
  ] = await Promise.all([
    db.prayerLog.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    db.quranLog.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    db.habit.findMany({ where: { userId }, include: { logs: true } }),
    db.journal.findMany({ where: { userId }, orderBy: { date: "desc" } }),
  ]);

  // Prayer streak (consecutive days, going back from yesterday, with >=4 prayers)
  let prayerStreak = 0;
  for (const p of allPrayers) {
    if (p.date.getTime() >= today.getTime()) continue; // skip today
    const c = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length;
    if (c >= 4) prayerStreak++;
    else break;
  }

  // Prayer total count (sum of done prayers across all days)
  let totalPrayersDone = 0;
  let perfectDays = 0;
  let fajrOnTimeStreak = 0;
  let perfectWeekStreak = 0;
  let consecutivePerfect = 0;
  const sortedPrayers = [...allPrayers].sort((a, b) => a.date.getTime() - b.date.getTime());
  for (const p of sortedPrayers) {
    const done = [p.fajr, p.dhuhr, p.asr, p.maghrib, p.isha].filter(Boolean).length;
    totalPrayersDone += done;
    if (done === 5) {
      perfectDays++;
      consecutivePerfect++;
      if (consecutivePerfect >= 7) perfectWeekStreak = Math.max(perfectWeekStreak, consecutivePerfect);
    } else {
      consecutivePerfect = 0;
    }
    if (p.fajr) fajrOnTimeStreak++;
  }

  // Quran totals
  const totalQuranPages = allQuran.reduce((a, q) => a + (q.pagesRead ?? 0), 0);

  // Habits — best single-habit check-in count
  let bestHabitCheckins = 0;
  let totalHabitCheckins = 0;
  for (const h of allHabits) {
    const doneCount = h.logs.filter((l) => l.done).length;
    bestHabitCheckins = Math.max(bestHabitCheckins, doneCount);
    totalHabitCheckins += doneCount;
  }

  // Journal totals
  const totalJournalEntries = allJournals.length;

  return NextResponse.json({
    prayerStreak,
    totalPrayersDone,
    perfectDays,
    perfectWeekStreak,
    fajrOnTimeStreak,
    totalQuranPages,
    bestHabitCheckins,
    totalHabitCheckins,
    totalJournalEntries,
  });
}
