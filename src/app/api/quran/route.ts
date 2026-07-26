import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/quran?days=14 — recent quran logs. */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));

  const logs = await db.quranLog.findMany({
    where: { userId, date: { gte: from, lte: today } },
    orderBy: { date: "asc" },
  });

  const total = await db.quranLog.aggregate({
    where: { userId },
    _sum: { pagesRead: true, memorizedAyahs: true, minutesSpent: true },
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      date: l.date,
      pagesRead: l.pagesRead,
      ayahsRead: l.ayahsRead,
      lastSurah: l.lastSurah,
      lastAyah: l.lastAyah,
      memorizedAyahs: l.memorizedAyahs,
      targetPages: l.targetPages,
      minutesSpent: l.minutesSpent,
    })),
    totals: {
      pagesRead: total._sum.pagesRead ?? 0,
      memorizedAyahs: total._sum.memorizedAyahs ?? 0,
      minutesSpent: total._sum.minutesSpent ?? 0,
    },
  });
}

/** PATCH /api/quran — update today's quran log. */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { pagesRead, lastSurah, lastAyah, memorizedAyahs, minutesSpent, targetPages } = body as {
    pagesRead?: number;
    lastSurah?: string;
    lastAyah?: number;
    memorizedAyahs?: number;
    minutesSpent?: number;
    targetPages?: number;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const log = await db.quranLog.upsert({
    where: { userId_date: { userId, date: today } },
    create: {
      userId,
      date: today,
      pagesRead: pagesRead ?? 0,
      lastSurah,
      lastAyah,
      memorizedAyahs: memorizedAyahs ?? 0,
      minutesSpent: minutesSpent ?? 0,
      targetPages: targetPages ?? 2,
    },
    update: {
      ...(pagesRead !== undefined ? { pagesRead } : {}),
      ...(lastSurah !== undefined ? { lastSurah } : {}),
      ...(lastAyah !== undefined ? { lastAyah } : {}),
      ...(memorizedAyahs !== undefined ? { memorizedAyahs } : {}),
      ...(minutesSpent !== undefined ? { minutesSpent } : {}),
      ...(targetPages !== undefined ? { targetPages } : {}),
    },
  });

  return NextResponse.json({ ok: true, log });
}
