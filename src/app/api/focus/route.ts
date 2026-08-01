import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/focus — recent focus sessions.
 *  - ?days=N  → last N days (default 30)
 *  - ?today=1 → only sessions started today
 */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOnly = req.nextUrl.searchParams.get("today");
  if (todayOnly) {
    const sessions = await db.focusSession.findMany({
      where: { userId, startedAt: { gte: today } },
      orderBy: { startedAt: "desc" },
    });
    return NextResponse.json({ sessions });
  }

  const daysParam = req.nextUrl.searchParams.get("days");
  const days = Math.min(parseInt(daysParam ?? "30", 10) || 30, 90);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  const sessions = await db.focusSession.findMany({
    where: { userId, startedAt: { gte: start } },
    orderBy: { startedAt: "desc" },
  });

  // Aggregate by day for the trend chart
  const byDay = new Map<string, { date: string; count: number; totalSec: number; completed: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { date: key, count: 0, totalSec: 0, completed: 0 });
  }
  for (const s of sessions) {
    const key = s.startedAt.toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.count += 1;
      bucket.totalSec += s.elapsedSec;
      if (s.completed) bucket.completed += 1;
    }
  }
  const trend = Array.from(byDay.values());

  // Lifetime stats
  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((a, s) => a + s.elapsedSec, 0);
  const completedSessions = sessions.filter((s) => s.completed).length;
  const todaySessions = sessions.filter((s) => s.startedAt >= today);
  const todaySeconds = todaySessions.reduce((a, s) => a + s.elapsedSec, 0);

  // Current streak (consecutive days with at least one completed session)
  let streak = 0;
  const allDays = new Set(
    sessions.filter((s) => s.completed).map((s) => s.startedAt.toISOString().slice(0, 10))
  );
  const cursor = new Date(today);
  // Allow today to be "in progress" — start from yesterday for the streak count
  if (!allDays.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (allDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return NextResponse.json({
    sessions: sessions.slice(0, 50),
    trend,
    stats: {
      totalSessions,
      totalSeconds,
      completedSessions,
      todayCount: todaySessions.length,
      todaySeconds,
      streak,
      avgMinutesPerSession: totalSessions ? Math.round(totalSeconds / totalSessions / 60) : 0,
    },
  });
}

/** POST /api/focus — start a new session, or stop an existing one. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { action } = body as { action: "start" | "stop" | "complete" };

  if (action === "start") {
    const { durationSec, mode, breakActivity, intention } = body as {
      durationSec: number;
      mode?: string;
      breakActivity?: string;
      intention?: string;
    };
    const session = await db.focusSession.create({
      data: {
        userId,
        startedAt: new Date(),
        durationSec,
        mode: mode ?? "deep",
        breakActivity: breakActivity ?? null,
        intention: intention ?? null,
      },
    });
    return NextResponse.json({ ok: true, session });
  }

  if (action === "stop" || action === "complete") {
    const { id, elapsedSec } = body as { id: string; elapsedSec: number };
    const ownedSession = await db.focusSession.findFirst({ where: { id, userId } });
    if (!ownedSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const session = await db.focusSession.update({
      where: { id },
      data: {
        endedAt: new Date(),
        elapsedSec,
        completed: action === "complete",
      },
    });
    return NextResponse.json({ ok: true, session });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}
