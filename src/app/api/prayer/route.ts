import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/prayer?days=14 — recent prayer logs. */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const days = Number(req.nextUrl.searchParams.get("days") ?? 14);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));

  const logs = await db.prayerLog.findMany({
    where: { userId, date: { gte: from, lte: today } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({
    user: { name: user.name, location: user.location, latitude: user.latitude, longitude: user.longitude },
    logs: logs.map((l) => ({
      date: l.date,
      fajr: l.fajr,
      dhuhr: l.dhuhr,
      asr: l.asr,
      maghrib: l.maghrib,
      isha: l.isha,
      sunnah: l.sunnah,
      count: [l.fajr, l.dhuhr, l.asr, l.maghrib, l.isha].filter(Boolean).length,
    })),
  });
}

/** PATCH /api/prayer — toggle a prayer for today. */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { prayer, value } = body as { prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"; value: boolean };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await db.prayerLog.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, [prayer]: value },
    update: { [prayer]: value },
  });

  return NextResponse.json({ ok: true, log });
}

/** POST /api/prayer/sunnah — increment/decrement sunnah count. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { delta } = body as { delta: number };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.prayerLog.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  const next = Math.max(0, (existing?.sunnah ?? 0) + delta);
  const log = await db.prayerLog.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, sunnah: next },
    update: { sunnah: next },
  });

  return NextResponse.json({ ok: true, sunnah: log.sunnah });
}
