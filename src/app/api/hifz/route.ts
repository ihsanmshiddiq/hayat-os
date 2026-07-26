import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { QURAN_SURAHS, TOTAL_QURAN_AYAHS, HIFZ_STATUS_META, daysUntilReview } from "@/lib/islamic";

export const dynamic = "force-dynamic";

/**
 * GET /api/hifz
 * Returns the user's hifz (memorization) state across all 114 surahs.
 */
export async function GET() {
  const user = await ensureSeedData();
  const userId = user.id;

  const rows = await db.hifzSurah.findMany({ where: { userId } });

  // Map by surah number
  const byNumber = new Map(rows.map((r) => [r.surahNumber, r]));

  const surahs = QURAN_SURAHS.map((s) => {
    const row = byNumber.get(s.number);
    const status = (row?.status ?? "not_started") as keyof typeof HIFZ_STATUS_META;
    const memorizedTo = row?.memorizedTo ?? 0;
    const memorizedFrom = row?.memorizedFrom ?? 0;
    // For memorized & needs_review: full surah is memorized (seed uses memorizedTo=999 as marker)
    // For in_progress: actual range memorizedFrom..memorizedTo
    const memorizedAyahs =
      status === "memorized" || status === "needs_review"
        ? s.ayahs
        : Math.max(0, memorizedTo - memorizedFrom + 1);
    return {
      number: s.number,
      name: s.name,
      arabic: s.arabic,
      english: s.english,
      ayahs: s.ayahs,
      revelation: s.revelation,
      status,
      memorizedFrom: status === "memorized" || status === "needs_review" ? 1 : memorizedFrom,
      memorizedTo: status === "memorized" || status === "needs_review" ? s.ayahs : memorizedTo,
      memorizedAyahs,
      lastReviewed: row?.lastReviewed?.toISOString() ?? null,
      note: row?.note ?? null,
      daysUntilReview: daysUntilReview(row?.lastReviewed ?? null),
    };
  });

  // Aggregate stats
  const memorizedSurahs = surahs.filter((s) => s.status === "memorized").length;
  const inProgress = surahs.filter((s) => s.status === "in_progress").length;
  const needsReview = surahs.filter((s) => s.status === "needs_review").length;
  const totalMemorizedAyahs = surahs.reduce((a, s) => a + s.memorizedAyahs, 0);
  const percentQuran = Math.round((totalMemorizedAyahs / TOTAL_QURAN_AYAHS) * 1000) / 10;
  // Due for review: needs_review entries + memorized entries overdue (>30 days since last review)
  const dueForReview = surahs.filter(
    (s) => s.status === "needs_review" || (s.status === "memorized" && s.daysUntilReview <= 0)
  ).length;
  const reviewedThisWeek = surahs.filter((s) => {
    if (!s.lastReviewed) return false;
    const days = (Date.now() - new Date(s.lastReviewed).getTime()) / 86400000;
    return days <= 7;
  }).length;

  return NextResponse.json({
    surahs,
    stats: {
      memorizedSurahs,
      inProgress,
      needsReview,
      totalSurahs: 114,
      totalMemorizedAyahs,
      totalQuranAyahs: TOTAL_QURAN_AYAHS,
      percentQuran,
      dueForReview,
      reviewedThisWeek,
    },
  });
}

/**
 * PATCH /api/hifz
 * Body: { surahNumber: number, status?: HifzStatus, memorizedFrom?: number, memorizedTo?: number, note?: string, reviewed?: boolean }
 * Upserts the hifz record for a given surah.
 */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const {
    surahNumber,
    status,
    memorizedFrom,
    memorizedTo,
    note,
    reviewed,
  } = body as {
    surahNumber: number;
    status?: string;
    memorizedFrom?: number;
    memorizedTo?: number;
    note?: string;
    reviewed?: boolean;
  };

  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    return NextResponse.json({ error: "Invalid surahNumber" }, { status: 400 });
  }

  const surah = QURAN_SURAHS.find((s) => s.number === surahNumber);
  if (!surah) return NextResponse.json({ error: "Surah not found" }, { status: 404 });

  const existing = await db.hifzSurah.findUnique({
    where: { userId_surahNumber: { userId, surahNumber } },
  });

  const data: Record<string, unknown> = {};
  if (status) data.status = status;
  if (memorizedFrom != null) data.memorizedFrom = memorizedFrom;
  if (memorizedTo != null) data.memorizedTo = memorizedTo;
  if (note != null) data.note = note;
  if (reviewed) data.lastReviewed = new Date();

  // If marking as memorized, set memorizedTo to full surah if not set
  if (status === "memorized" && (memorizedTo == null || memorizedTo === 0)) {
    data.memorizedFrom = 1;
    data.memorizedTo = surah.ayahs;
  }

  if (existing) {
    const updated = await db.hifzSurah.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json({ ok: true, id: updated.id });
  }

  const created = await db.hifzSurah.create({
    data: {
      userId,
      surahNumber,
      status: (status as string) ?? "in_progress",
      memorizedFrom: (memorizedFrom as number) ?? 0,
      memorizedTo: (memorizedTo as number) ?? 0,
      note: note ?? null,
      lastReviewed: reviewed ? new Date() : null,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

/**
 * DELETE /api/hifz?surahNumber=N — reset a surah to not_started.
 */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const surahParam = req.nextUrl.searchParams.get("surahNumber");
  if (!surahParam) return NextResponse.json({ error: "Missing surahNumber" }, { status: 400 });
  const surahNumber = parseInt(surahParam, 10);

  const existing = await db.hifzSurah.findUnique({
    where: { userId_surahNumber: { userId, surahNumber } },
  });
  if (!existing) return NextResponse.json({ ok: true, existed: false });

  await db.hifzSurah.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
