import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/goals */
export async function GET() {
  const user = await ensureSeedData();
  const userId = user.id;
  const goals = await db.goal.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json({
    goals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      progress: g.progress,
      milestone: g.milestone,
      done: g.done,
      targetDate: g.targetDate,
    })),
  });
}

/** POST /api/goals */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { title, category = "ibadah", progress = 0, milestone, targetDate } = body;
  const goal = await db.goal.create({
    data: {
      userId,
      title,
      category,
      progress,
      milestone,
      done: progress >= 100,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });
  return NextResponse.json({ ok: true, goal });
}

/** PATCH /api/goals?id=... */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const { title, category, progress, milestone, done, targetDate } = body;
  const goal = await db.goal.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(progress !== undefined ? { progress, done: progress >= 100 } : {}),
      ...(milestone !== undefined ? { milestone } : {}),
      ...(done !== undefined ? { done } : {}),
      ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
    },
  });
  return NextResponse.json({ ok: true, goal });
}

/** DELETE /api/goals?id=... */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.goal.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
