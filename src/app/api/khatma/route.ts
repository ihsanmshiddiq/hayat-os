import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** Standard Quran metadata: 604 pages total, 30 juz, ~20 pages per juz. */
const QURAN_TOTAL_PAGES = 604;
const PAGES_PER_JUZ = 20; // approximate (604 / 30 ≈ 20.13)

interface KhatmaScope {
  startPage: number;
  endPage: number;
  totalPages: number;
}

const SCOPES: Record<string, KhatmaScope> = {
  full_quran: { startPage: 1, endPage: 604, totalPages: 604 },
  juz_amma: { startPage: 583, endPage: 604, totalPages: 22 }, // Juz 30
  last_30: { startPage: 575, endPage: 604, totalPages: 30 },
  first_5_juz: { startPage: 1, endPage: 100, totalPages: 100 },
  al_kahf: { startPage: 293, endPage: 304, totalPages: 12 }, // Surah Al-Kahf
  al_mulk: { startPage: 597, endPage: 599, totalPages: 3 }, // Surah Al-Mulk
};

/** GET /api/khatma — list user's plans.
 *  - ?active=1 → only active plans
 *  - ?summary=1 → returns active plan + computed progress (pages read since startDate)
 */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const activeOnly = req.nextUrl.searchParams.get("active") === "1";
  const summary = req.nextUrl.searchParams.get("summary") === "1";

  const where = { userId, ...(activeOnly ? { isActive: true } : {}) };
  const plans = await db.khatmaPlan.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (summary) {
    const active = plans.find((p) => p.isActive) ?? plans[0] ?? null;
    if (!active) {
      return NextResponse.json({ active: null, history: [] });
    }

    // Compute pages read since plan start (from QuranLog)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(active.startDate);
    startDate.setHours(0, 0, 0, 0);

    const logs = await db.quranLog.findMany({
      where: { userId, date: { gte: startDate, lte: today } },
      orderBy: { date: "asc" },
    });

    const pagesReadSinceStart = logs.reduce((a, l) => a + l.pagesRead, 0);
    const daysElapsed = Math.max(1, Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1);
    const daysRemaining = Math.max(0, active.targetDays - daysElapsed);
    const avgPacePerDay = pagesReadSinceStart / daysElapsed;
    const projectedTotalDays = avgPacePerDay > 0 ? Math.ceil(active.totalPages / avgPacePerDay) : active.targetDays;
    const projectedEndDate = new Date(startDate.getTime() + projectedTotalDays * 86400000);
    const onPace = pagesReadSinceStart >= active.dailyTarget * daysElapsed;
    const completionPct = Math.min(100, Math.round((pagesReadSinceStart / active.totalPages) * 100));

    // Streak: count consecutive days (from today backwards) where pagesRead >= dailyTarget
    let streak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].pagesRead >= active.dailyTarget) streak++;
      else break;
    }

    // Compute per-juz progress (max 30 juz — standard Quran division)
    const juzProgress: { juz: number; pagesRead: number; totalPages: number; pct: number }[] = [];
    const planStartJuz = Math.floor((active.startPage - 1) / PAGES_PER_JUZ) + 1;
    const planEndJuzRaw = Math.ceil(active.endPage / PAGES_PER_JUZ);
    // Cap at 30 juz (Quran standard division). Juz 30 absorbs any remainder.
    const planEndJuz = Math.min(30, planEndJuzRaw);
    let runningPages = pagesReadSinceStart;
    for (let j = planStartJuz; j <= planEndJuz; j++) {
      const juzStartPage = Math.max(active.startPage, (j - 1) * PAGES_PER_JUZ + 1);
      // For the last juz, extend to active.endPage (absorbs remainder pages so total = 30 juz)
      const juzEndPage = j === planEndJuz && planEndJuzRaw > 30
        ? active.endPage
        : Math.min(active.endPage, j * PAGES_PER_JUZ);
      const juzTotal = juzEndPage - juzStartPage + 1;
      const juzRead = Math.min(juzTotal, Math.max(0, runningPages));
      runningPages -= juzRead;
      juzProgress.push({
        juz: j,
        pagesRead: juzRead,
        totalPages: juzTotal,
        pct: juzTotal > 0 ? Math.round((juzRead / juzTotal) * 100) : 0,
      });
    }

    // Daily history (last 14 days)
    const dailyHistory = logs.slice(-14).map((l) => ({
      date: l.date,
      pagesRead: l.pagesRead,
      target: active.dailyTarget,
      met: l.pagesRead >= active.dailyTarget,
    }));

    return NextResponse.json({
      active: {
        ...active,
        pagesReadSinceStart,
        daysElapsed,
        daysRemaining,
        avgPacePerDay: Math.round(avgPacePerDay * 10) / 10,
        projectedEndDate,
        projectedTotalDays,
        onPace,
        completionPct,
        streak,
        juzProgress,
        dailyHistory,
      },
      history: plans.filter((p) => p.id !== active.id).map((p) => ({
        id: p.id,
        name: p.name,
        scope: p.scope,
        totalPages: p.totalPages,
        targetDays: p.targetDays,
        startDate: p.startDate,
        completedAt: p.completedAt,
        isActive: p.isActive,
      })),
    });
  }

  return NextResponse.json({ plans });
}

/** POST /api/khatma — create a new plan.
 *  Body: { name?, scope, targetDays?, dailyTarget?, startPage?, endPage? }
 */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const {
    name,
    scope = "full_quran",
    targetDays,
    dailyTarget,
    startPage: customStart,
    endPage: customEnd,
  } = body as {
    name?: string;
    scope?: string;
    targetDays?: number;
    dailyTarget?: number;
    startPage?: number;
    endPage?: number;
  };

  const scopeDef = SCOPES[scope] ?? SCOPES.full_quran;
  const startPage = customStart ?? scopeDef.startPage;
  const endPage = customEnd ?? scopeDef.endPage;
  const totalPages = endPage - startPage + 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Deactivate any existing active plans (only one active at a time)
  await db.khatmaPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const plan = await db.khatmaPlan.create({
    data: {
      userId,
      name: name ?? defaultNameForScope(scope),
      scope,
      startPage,
      endPage,
      totalPages,
      startDate: today,
      targetDays: targetDays ?? Math.max(1, Math.ceil(totalPages / (dailyTarget ?? 20))),
      dailyTarget: dailyTarget ?? 20,
      isActive: true,
    },
  });

  return NextResponse.json({ plan });
}

/** PATCH /api/khatma?id=... — update a plan.
 *  Body: { name?, targetDays?, dailyTarget?, isActive?, completedAt? }
 *  Special: ?id=active will update the user's currently active plan.
 */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const idParam = req.nextUrl.searchParams.get("id");
  const body = await req.json() as {
    name?: string;
    targetDays?: number;
    dailyTarget?: number;
    isActive?: boolean;
    completedAt?: Date | null;
    addPages?: number; // shortcut: increment completedPages
  };

  let plan;
  if (idParam === "active" || !idParam) {
    plan = await db.khatmaPlan.findFirst({ where: { userId, isActive: true } });
    if (!plan) return NextResponse.json({ error: "No active plan" }, { status: 404 });
  } else {
    plan = await db.khatmaPlan.findUnique({ where: { id: idParam } });
    if (!plan || plan.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If marking another plan as active, deactivate others first
  if (body.isActive === true) {
    await db.khatmaPlan.updateMany({
      where: { userId, isActive: true, id: { not: plan.id } },
      data: { isActive: false },
    });
  }

  const updated = await db.khatmaPlan.update({
    where: { id: plan.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.targetDays !== undefined ? { targetDays: body.targetDays } : {}),
      ...(body.dailyTarget !== undefined ? { dailyTarget: body.dailyTarget } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.completedAt !== undefined ? { completedAt: body.completedAt } : {}),
      ...(body.addPages !== undefined ? { completedPages: { increment: body.addPages } } : {}),
    },
  });

  return NextResponse.json({ plan: updated });
}

/** DELETE /api/khatma?id=... — delete a plan. */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const plan = await db.khatmaPlan.findUnique({ where: { id } });
  if (!plan || plan.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.khatmaPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

function defaultNameForScope(scope: string): string {
  switch (scope) {
    case "full_quran": return "Full Quran Khatma";
    case "juz_amma": return "Juz Amma Khatma";
    case "last_30": return "Last 30 Pages";
    case "first_5_juz": return "First 5 Juz";
    case "al_kahf": return "Surah Al-Kahf";
    case "al_mulk": return "Surah Al-Mulk";
    default: return "Quran Khatma";
  }
}

export { QURAN_TOTAL_PAGES, PAGES_PER_JUZ };
