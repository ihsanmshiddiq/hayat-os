import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await ensureSeedData();
  const logs = await db.menstrualLog.findMany({ where: { userId: user.id }, orderBy: { startDate: "desc" } });
  const completed = logs.filter((log) => log.endDate);
  const averageCycle = logs.length > 1 ? Math.round(logs.slice(0, -1).reduce((sum, log, index) => sum + Math.abs((new Date(log.startDate).getTime() - new Date(logs[index + 1].startDate).getTime()) / 86400000), 0) / (logs.length - 1)) : 28;
  const averageDuration = completed.length ? Math.round(completed.reduce((sum, log) => sum + Math.max(1, Math.round((new Date(log.endDate!).getTime() - new Date(log.startDate).getTime()) / 86400000) + 1), 0) / completed.length) : 5;
  const nextDate = logs[0] ? new Date(new Date(logs[0].startDate).getTime() + averageCycle * 86400000) : null;
  return NextResponse.json({ logs, insights: { averageCycle, averageDuration, nextDate } });
}

export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const body = await req.json();
  const log = await db.menstrualLog.create({ data: { userId: user.id, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null, symptoms: body.symptoms || null, note: body.note || null } });
  return NextResponse.json({ log });
}

export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData(); const id = req.nextUrl.searchParams.get("id"); const body = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await db.menstrualLog.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const log = await db.menstrualLog.update({ where: { id: existing.id }, data: { ...(body.endDate !== undefined ? { endDate: body.endDate ? new Date(body.endDate) : null } : {}), ...(body.symptoms !== undefined ? { symptoms: body.symptoms } : {}), ...(body.note !== undefined ? { note: body.note } : {}) } });
  return NextResponse.json({ log });
}
