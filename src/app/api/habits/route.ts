import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await ensureSeedData();
  const userId = user.id;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - 13);
  const habits = await db.habit.findMany({
    where: { userId },
    include: { logs: { where: { date: { gte: from } }, orderBy: { date: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    habits: habits.map((h) => ({
      id: h.id, name: h.name, icon: h.icon, color: h.color, category: h.category,
      cue: h.cue, reward: h.reward, schedule: h.schedule,
      logs: h.logs.map((l) => ({ date: l.date, done: l.done })),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { name, icon = "CheckCircle", color = "emerald", category = "general", cue, reward, schedule = "daily" } = body;
  const habit = await db.habit.create({
    data: { userId, name, icon, color, category, cue, reward, schedule },
  });
  return NextResponse.json({ ok: true, habit });
}

export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.habit.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { habitId, date, done } = body as { habitId: string; date?: string; done: boolean };
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  const log = await db.habitLog.upsert({
    where: { habitId_date: { habitId, date: d } },
    create: { habitId, userId, date: d, done },
    update: { done },
  });
  return NextResponse.json({ ok: true, log });
}
