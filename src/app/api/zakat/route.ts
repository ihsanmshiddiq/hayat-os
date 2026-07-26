import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  ZAKAT_ASSET_TYPES,
  ZAKAT_RATE,
  GOLD_PRICE_PER_GRAM_IDR,
  SILVER_PRICE_PER_GRAM_IDR,
  ZAKAT_HAWL_DAYS,
  getNisabIDR,
} from "@/lib/islamic";

export const dynamic = "force-dynamic";

/**
 * GET /api/zakat
 *   ?history=1  — return all saved calculations
 *   ?summary=1  — return only the latest + aggregates
 * Default: returns both history + summary + asset types & constants.
 */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;

  const historyOnly = req.nextUrl.searchParams.get("history") === "1";
  const summaryOnly = req.nextUrl.searchParams.get("summary") === "1";

  const all = await db.zakatCalculation.findMany({
    where: { userId },
    orderBy: { calculationDate: "desc" },
  });

  if (historyOnly) {
    return NextResponse.json({
      history: all.map(formatCalc),
    });
  }

  const totalPaidZakat = all.filter((c) => c.isPaid).reduce((a, c) => a + c.zakatDueIDR, 0);
  const totalPendingZakat = all.filter((c) => !c.isPaid).reduce((a, c) => a + c.zakatDueIDR, 0);
  const yearAgo = new Date();
  yearAgo.setDate(yearAgo.getDate() - 365);
  const calcsLastYear = all.filter((c) => new Date(c.calculationDate) >= yearAgo);
  const yearTotal = calcsLastYear.reduce((a, c) => a + c.zakatDueIDR, 0);

  const latest = all[0] ? formatCalc(all[0]) : null;
  const upcomingDue = all.find((c) => !c.isPaid && new Date(c.hawlEndDate) >= new Date()) ?? null;

  if (summaryOnly) {
    return NextResponse.json({
      latest,
      upcomingDue: upcomingDue ? formatCalc(upcomingDue) : null,
      stats: {
        totalCalculations: all.length,
        totalPaidZakat,
        totalPendingZakat,
        yearTotal,
      },
    });
  }

  return NextResponse.json({
    history: all.map(formatCalc),
    latest,
    upcomingDue: upcomingDue ? formatCalc(upcomingDue) : null,
    stats: {
      totalCalculations: all.length,
      totalPaidZakat,
      totalPendingZakat,
      yearTotal,
    },
    assetTypes: ZAKAT_ASSET_TYPES,
    constants: {
      zakatRate: ZAKAT_RATE,
      hawlDays: ZAKAT_HAWL_DAYS,
      goldPricePerGramIDR: GOLD_PRICE_PER_GRAM_IDR,
      silverPricePerGramIDR: SILVER_PRICE_PER_GRAM_IDR,
      nisabGoldIDR: getNisabIDR("gold"),
      nisabSilverIDR: getNisabIDR("silver"),
    },
  });
}

function formatCalc(c: any) {
  return {
    id: c.id,
    calculationDate: c.calculationDate.toISOString(),
    hawlStartDate: c.hawlStartDate.toISOString(),
    hawlEndDate: c.hawlEndDate.toISOString(),
    nisabStandard: c.nisabStandard,
    nisabThresholdIDR: c.nisabThresholdIDR,
    totalAssetsIDR: c.totalAssetsIDR,
    totalLiabilitiesIDR: c.totalLiabilitiesIDR,
    zakatableBaseIDR: c.zakatableBaseIDR,
    zakatDueIDR: c.zakatDueIDR,
    isPaid: c.isPaid,
    paidDate: c.paidDate ? c.paidDate.toISOString() : null,
    note: c.note,
    breakdown: c.breakdown ? JSON.parse(c.breakdown) : null,
  };
}

/** POST /api/zakat — save a calculation snapshot. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const {
    nisabStandard = "gold",
    totalAssetsIDR,
    totalLiabilitiesIDR = 0,
    zakatableBaseIDR,
    zakatDueIDR,
    breakdown,
    hawlStartDate,
    note,
  } = body as {
    nisabStandard?: "gold" | "silver";
    totalAssetsIDR?: number;
    totalLiabilitiesIDR?: number;
    zakatableBaseIDR?: number;
    zakatDueIDR?: number;
    breakdown?: Record<string, { amount: number; valueIDR: number }>;
    hawlStartDate?: string;
    note?: string;
  };

  if (typeof zakatDueIDR !== "number" || typeof zakatableBaseIDR !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const calcDate = new Date();
  calcDate.setHours(0, 0, 0, 0);

  const hawlStart = hawlStartDate ? new Date(hawlStartDate) : calcDate;
  const hawlEnd = new Date(hawlStart);
  hawlEnd.setDate(hawlEnd.getDate() + ZAKAT_HAWL_DAYS);

  const nisabThresholdIDR = getNisabIDR(nisabStandard);

  const calc = await db.zakatCalculation.create({
    data: {
      userId,
      calculationDate: calcDate,
      hawlStartDate: hawlStart,
      hawlEndDate: hawlEnd,
      nisabStandard,
      nisabThresholdIDR,
      totalAssetsIDR: totalAssetsIDR ?? 0,
      totalLiabilitiesIDR,
      zakatableBaseIDR,
      zakatDueIDR,
      breakdown: breakdown ? JSON.stringify(breakdown) : "{}",
      note: note ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: calc.id, calculation: formatCalc(calc) });
}

/** PATCH /api/zakat?id=... — mark as paid/unpaid. */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const { isPaid, note } = body as { isPaid?: boolean; note?: string };

  const existing = await db.zakatCalculation.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.zakatCalculation.update({
    where: { id },
    data: {
      ...(typeof isPaid === "boolean" ? { isPaid, paidDate: isPaid ? new Date() : null } : {}),
      ...(typeof note === "string" ? { note } : {}),
    },
  });

  return NextResponse.json({ ok: true, calculation: formatCalc(updated) });
}

/** DELETE /api/zakat?id=... */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await db.zakatCalculation.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.zakatCalculation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
