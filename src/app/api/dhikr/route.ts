import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/dhikr — today's dhikr counters, OR ?days=N for the last N days of history. */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysParam = req.nextUrl.searchParams.get("days");
  if (daysParam) {
    const days = Math.min(parseInt(daysParam, 10) || 30, 90);
    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    const logs = await db.dhikrLog.findMany({
      where: { userId, date: { gte: start, lte: today } },
      orderBy: { date: "asc" },
    });
    // Group by date
    const byDate = new Map<string, { phrase: string; count: number; target: number }[]>();
    for (const l of logs) {
      const key = l.date.toISOString();
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push({ phrase: l.phrase, count: l.count, target: l.target });
    }
    // Build a complete day-by-day array (fill missing days with zero)
    const history: { date: string; total: number; phrases: { phrase: string; count: number; target: number }[] }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString();
      const phrases = byDate.get(key) ?? [];
      const total = phrases.reduce((a, p) => a + p.count, 0);
      history.push({ date: key, total, phrases });
    }
    return NextResponse.json({ history });
  }

  // Default: today's logs
  const logs = await db.dhikrLog.findMany({ where: { userId, date: today } });
  return NextResponse.json({ logs });
}

/** PATCH /api/dhikr — set count for a phrase today. */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { phrase, count, target } = body as { phrase: string; count: number; target?: number };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const log = await db.dhikrLog.upsert({
    where: { userId_date_phrase: { userId, date: today, phrase } },
    create: { userId, date: today, phrase, count, target: target ?? 33 },
    update: { count, ...(target ? { target } : {}) },
  });
  return NextResponse.json({ ok: true, log });
}
