import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { SUNNAH_FAST_TYPES, getSuggestedFastsForDate } from "@/lib/islamic";

export const dynamic = "force-dynamic";

/**
 * GET /api/fasts
 *   ?days=N   — last N days of fasts (default 30)
 *   ?month=YYYY-MM — fasts within a given Gregorian month
 */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysParam = req.nextUrl.searchParams.get("days");
  const monthParam = req.nextUrl.searchParams.get("month");

  let start: Date;
  let end: Date;
  if (monthParam) {
    const [y, m] = monthParam.split("-").map((s) => parseInt(s, 10));
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 0);
  } else {
    const days = Math.min(parseInt(daysParam ?? "30", 10) || 30, 365);
    start = new Date(today);
    start.setDate(start.getDate() - (days - 1));
    end = today;
  }

  const logs = await db.sunnahFast.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  const suggestedToday = getSuggestedFastsForDate(today);

  return NextResponse.json({
    fasts: logs.map((l) => ({
      id: l.id,
      date: l.date.toISOString(),
      fastType: l.fastType,
      note: l.note,
    })),
    types: SUNNAH_FAST_TYPES,
    suggestedToday,
    today: today.toISOString(),
  });
}

/** POST /api/fasts — mark a fast on a given date. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { date, fastType, note } = body as { date?: string; fastType: string; note?: string };

  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);

  const existing = await db.sunnahFast.findUnique({
    where: { userId_date_fastType: { userId, date: d, fastType } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, id: existing.id, existed: true });
  }

  const fast = await db.sunnahFast.create({
    data: { userId, date: d, fastType, note },
  });
  return NextResponse.json({ ok: true, id: fast.id });
}

/** DELETE /api/fasts?id=... — remove a fast log. */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await db.sunnahFast.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.sunnahFast.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
