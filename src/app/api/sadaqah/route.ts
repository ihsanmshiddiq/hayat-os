import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { SADAQAH_TYPES } from "@/lib/islamic";

export const dynamic = "force-dynamic";

/**
 * GET /api/sadaqah
 *   ?days=N    — last N days (default 30)
 *   ?month=YYYY-MM — entries within a month
 * Returns entries + aggregated stats.
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

  const entries = await db.sadaqahEntry.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
  });

  // Lifetime totals for amount (only monetary units)
  const allEntries = await db.sadaqahEntry.findMany({ where: { userId } });
  const monetary = (unit: string) => (e: typeof allEntries[number]) => e.unit === unit;
  const sumBy = (predicate: (e: typeof allEntries[number]) => boolean) =>
    allEntries.filter(predicate).reduce((a, e) => a + e.amount, 0);

  const totalIDR = sumBy(monetary("idr"));
  const totalUSD = sumBy(monetary("usd"));
  const totalHours = sumBy(monetary("hour"));
  const totalItems = sumBy(monetary("item"));

  // This month
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthEntries = allEntries.filter(
    (e) => e.date >= monthStart && e.date <= monthEnd
  );
  const monthIDR = monthEntries.filter(monetary("idr")).reduce((a, e) => a + e.amount, 0);
  const monthCount = monthEntries.length;

  // 30-day series for chart
  const series: { date: string; total: number; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayEntries = entries.filter(
      (e) => e.date.toDateString() === d.toDateString()
    );
    series.push({
      date: d.toISOString(),
      total: dayEntries.filter(monetary("idr")).reduce((a, e) => a + e.amount, 0),
      count: dayEntries.length,
    });
  }

  // Per-type breakdown
  const byType = SADAQAH_TYPES.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    obligatory: t.obligatory,
    count: allEntries.filter((e) => e.type === t.id).length,
    total: allEntries.filter((e) => e.type === t.id && (e.unit === "idr" || e.unit === "usd")).reduce((a, e) => a + e.amount, 0),
  }));

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      amount: e.amount,
      unit: e.unit,
      type: e.type,
      recipient: e.recipient,
      note: e.note,
    })),
    types: SADAQAH_TYPES,
    series,
    stats: {
      totalIDR,
      totalUSD,
      totalHours,
      totalItems,
      monthIDR,
      monthCount,
      totalEntries: allEntries.length,
      byType,
    },
    today: today.toISOString(),
  });
}

/** POST /api/sadaqah — log a new entry. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { date, amount, unit, type, recipient, note } = body as {
    date?: string;
    amount?: number;
    unit?: string;
    type?: string;
    recipient?: string;
    note?: string;
  };

  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);

  const entry = await db.sadaqahEntry.create({
    data: {
      userId,
      date: d,
      amount: amount ?? 0,
      unit: unit ?? "idr",
      type: type ?? "sadaqah",
      recipient: recipient ?? null,
      note: note ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: entry.id });
}

/** DELETE /api/sadaqah?id=... */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await db.sadaqahEntry.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.sadaqahEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
