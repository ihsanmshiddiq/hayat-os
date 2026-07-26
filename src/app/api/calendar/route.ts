import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { getHijriDate, ISLAMIC_EVENTS } from "@/lib/islamic";

export const dynamic = "force-dynamic";

/** GET /api/calendar?month=YYYY-MM — events for a month + Islamic events overlay. */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;

  const monthParam = req.nextUrl.searchParams.get("month");
  let year: number, month: number;
  if (monthParam) {
    [year, month] = monthParam.split("-").map(Number);
    month -= 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const events = await db.calendarEvent.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  // Islamic events overlay for the displayed Gregorian month.
  // We compute hijri for each day in the month and tag matching Islamic events.
  const daysInMonth = end.getDate();
  const islamicOverlay: { date: string; name: string; type: string }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const hijri = getHijriDate(date);
    const match = ISLAMIC_EVENTS.find(
      (e) => e.month === hijri.month && e.day === hijri.day
    );
    if (match) {
      islamicOverlay.push({
        date: date.toISOString(),
        name: match.name,
        type: match.type,
      });
    }
  }

  return NextResponse.json({
    month: { year, month: month + 1 },
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: e.time,
      type: e.type,
      note: e.note,
    })),
    islamic: islamicOverlay,
  });
}

/** POST /api/calendar — create event. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { title, date, time, type = "reminder", note } = body;
  const event = await db.calendarEvent.create({
    data: {
      userId,
      title,
      date: new Date(date),
      time,
      type,
      note,
    },
  });
  return NextResponse.json({ ok: true, event });
}

/** DELETE /api/calendar?id=... */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.calendarEvent.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
