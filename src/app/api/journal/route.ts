import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/journal?days=30 — recent journal entries. */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));

  const entries = await db.journal.findMany({
    where: { userId, date: { gte: from, lte: today } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      gratitude: e.gratitude,
      reflection: e.reflection,
      lessons: e.lessons,
      dua: e.dua,
      mood: e.mood,
    })),
  });
}

/** PUT /api/journal — upsert today's (or specified) journal. */
export async function PUT(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { date, ...fields } = body as {
    date?: string;
    gratitude?: string;
    reflection?: string;
    lessons?: string;
    dua?: string;
    mood?: number;
  };
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);

  const entry = await db.journal.upsert({
    where: { userId_date: { userId, date: d } },
    create: { userId, date: d, ...fields },
    update: { ...fields },
  });

  return NextResponse.json({ ok: true, entry });
}
