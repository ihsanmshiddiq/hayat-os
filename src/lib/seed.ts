import { db } from "@/lib/db";
import { SURAHS } from "@/lib/islamic";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Ensures the demo LifeOS user exists and is seeded with a rich,
 * realistic dataset so the dashboard never looks empty.
 * Safe to call repeatedly (idempotent-ish: only seeds if missing).
 */
export async function ensureSeedData() {
  const supabase = await createClient();
  let { data: { user: authUser } } = await supabase.auth.getUser();

  // Some browser Supabase setups persist the session outside cookies. API
  // hooks forward the bearer token, so resolve it here as a reliable fallback.
  if (!authUser) {
    const authorization = (await headers()).get("authorization");
    const accessToken = authorization?.replace(/^Bearer\s+/i, "");
    if (accessToken && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const bearerClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      const result = await bearerClient.auth.getUser(accessToken);
      authUser = result.data.user;
    }
  }
  let user = authUser?.email
    ? await db.user.findUnique({ where: { email: authUser.email } })
    : await db.user.findFirst();
  if (!user) {
    user = await db.user.create({
      data: {
        email: authUser?.email ?? "salam@hayat.app",
        name: authUser?.user_metadata?.full_name ?? authUser?.user_metadata?.name ?? "Ahmad Rahman",
        avatar: authUser?.user_metadata?.avatar_url ?? null,
        location: "Jakarta, Indonesia",
        latitude: -6.2088,
        longitude: 106.8456,
        method: "Kemenag",
      },
    });
  }

  const userId = user.id;

  // Prayer logs — last 14 days, with a realistic pattern (some complete, some missed)
  const existingPrayers = await db.prayerLog.count({ where: { userId } });
  if (existingPrayers === 0) {
    const days = 14;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      // random-ish completion: older days more complete, recent partly
      const complete = Math.random() > 0.25;
      const skip = Math.random() > 0.6;
      await db.prayerLog.create({
        data: {
          userId,
          date: d,
          fajr: complete || Math.random() > 0.4,
          dhuhr: complete,
          asr: complete && Math.random() > 0.2,
          maghrib: complete,
          isha: !skip,
          sunnah: Math.floor(Math.random() * 4),
        },
      });
    }
    // today: leave all false so user can check them
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await db.prayerLog.upsert({
      where: { userId_date: { userId, date: today } },
      create: {
        userId,
        date: today,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
        sunnah: 0,
      },
      update: {},
    });
  }

  // Quran logs — last 14 days
  const existingQuran = await db.quranLog.count({ where: { userId } });
  if (existingQuran === 0) {
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const pages = i % 4 === 0 ? 0 : Math.floor(Math.random() * 3) + 1;
      const surah = SURAHS[Math.floor(Math.random() * SURAHS.length)];
      await db.quranLog.create({
        data: {
          userId,
          date: d,
          pagesRead: pages,
          ayahsRead: pages * 12,
          lastSurah: surah.name,
          lastAyah: Math.min(surah.ayahs, Math.floor(Math.random() * 30) + 1),
          memorizedAyahs: i % 3 === 0 ? 2 : 0,
          targetPages: 2,
          minutesSpent: pages * 10 + 5,
        },
      });
    }
  }

  // Habits + logs
  // Backfill categories on existing habits (in case schema was migrated after seeding).
  // Uses raw SQL because the running dev server may have a stale Prisma Client cache
  // (globalThis.prisma) that doesn't yet know about the `category` field.
  const categoryMap: Record<string, string> = {
    Tahajjud: "worship",
    "Dhuha Prayer": "worship",
    "Read Quran": "knowledge",
    "Morning Adhkar": "worship",
    "Drink Water": "health",
    Exercise: "health",
  };
  type HabitRow = { id: string; name: string; category: string | null };
  try {
    const allHabits = await db.$queryRaw<HabitRow[]>`SELECT id, name, category FROM "Habit" WHERE "userId" = ${userId}`;
    for (const h of allHabits) {
      const correctCat = categoryMap[h.name] ?? "general";
      if (h.category !== correctCat) {
        await db.$executeRaw`UPDATE "Habit" SET category = ${correctCat} WHERE id = ${h.id}`;
      }
    }
  } catch {
    // Older deployments may not have the optional category column yet.
    // Habit reads/writes remain usable; schema migration can add it later.
  }

  const existingHabits = await db.habit.count({ where: { userId } });
  if (existingHabits === 0) {
    const habitDefs = [
      { name: "Tahajjud", icon: "Moon", color: "violet", category: "worship" },
      { name: "Dhuha Prayer", icon: "Sunrise", color: "amber", category: "worship" },
      { name: "Read Quran", icon: "BookOpen", color: "emerald", category: "knowledge" },
      { name: "Morning Adhkar", icon: "Sparkles", color: "sky", category: "worship" },
      { name: "Drink Water", icon: "Droplet", color: "cyan", category: "health" },
      { name: "Exercise", icon: "Dumbbell", color: "rose", category: "health" },
    ];
    for (const h of habitDefs) {
      const habit = await db.habit.create({
        data: {
          userId,
          name: h.name,
          icon: h.icon,
          color: h.color,
          category: h.category,
          cue: "After Fajr",
          reward: "A sense of stillness",
          schedule: "daily",
        },
      });
      // logs for last 14 days, ~70% done
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        await db.habitLog.create({
          data: {
            habitId: habit.id,
            userId,
            date: d,
            done: Math.random() > 0.3,
          },
        });
      }
    }
  }

  // Journal — last 7 days
  const existingJournals = await db.journal.count({ where: { userId } });
  if (existingJournals === 0) {
    const reflections = [
      "Today felt steady. I tried to be present in each prayer.",
      "Struggled with focus during work. Need to start with Bismillah.",
      "Grateful for the small moments of stillness between tasks.",
      "Read Surah Al-Mulk before sleep — felt peace.",
      "A difficult conversation, but I kept my temper alhamdulillah.",
      "Missed Tahajjud but made up with Dhuha.",
      "Reflecting on how barakah changes the shape of a day.",
    ];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      await db.journal.create({
        data: {
          userId,
          date: d,
          gratitude: "Alhamdulillah for health, family, and another day to try again.",
          reflection: reflections[i % reflections.length],
          lessons: "Consistency is more beloved than intensity.",
          dua: "Allahumma inni as'aluka al-huda wat-tuqa wal-‘afafa wal-ghina.",
          mood: [3, 4, 4, 5, 3, 4, 4][i] ?? 4,
        },
      });
    }
  }

  // Notes
  const existingNotes = await db.note.count({ where: { userId } });
  if (existingNotes === 0) {
    const notes = [
      {
        title: "Tafsir notes — Al-Fatihah",
        content:
          "# Al-Fatihah\n\nThe Opening. Seven oft-repeated verses.\n\n- **Rahman**: the One whose mercy encompasses all creation.\n- **Rahim**: the One whose mercy is special for the believers.\n- Refrain from anger -> path of those blessed, not those who earned wrath.",
        folder: "Quran",
        tags: "tafsir,fatihah,quran",
        pinned: true,
      },
      {
        title: "Goals for this week",
        content:
          "# This week\n\n- [x] Complete Juz Amma revision\n- [ ] 3 pages of Quran daily\n- [ ] Wake for Tahajjud 2x\n- [ ] Call parents",
        folder: "Planning",
        tags: "weekly,goals",
        pinned: false,
      },
      {
        title: "Duas to memorize",
        content:
          "# Duas\n\n- Before sleeping\n- After waking\n- Entering the masjid\n- Traveling\n- Seeking knowledge",
        folder: "Dua",
        tags: "dua,memory",
        pinned: false,
      },
      {
        title: "Book — Purification of the Heart",
        content:
          "# Reflections\n\nThe heart rusts, and the polish is dhikr and istighfar.\n\nKey idea: when we are heedless, the heart hardens slowly.",
        folder: "Reading",
        tags: "book,heart",
        pinned: false,
      },
    ];
    for (const n of notes) {
      await db.note.create({ data: { userId, ...n } });
    }
  }

  // Goals
  const existingGoals = await db.goal.count({ where: { userId } });
  if (existingGoals === 0) {
    const goals = [
      { title: "Complete Juz 30 memorization", category: "ibadah", progress: 64, milestone: "Surah An-Naba to Al-Infitar done" },
      { title: "Read 1 Islamic book monthly", category: "knowledge", progress: 40, milestone: "Currently: Purification of the Heart" },
      { title: "Pray Tahajjud 3x weekly", category: "ibadah", progress: 55, milestone: "2 of 3 this week" },
      { title: "Run 3x weekly", category: "health", progress: 70, milestone: "Week 4 streak" },
      { title: "Save for Umrah", category: "wealth", progress: 28, milestone: "Target: next year" },
      { title: "Call parents every 2 days", category: "relationships", progress: 80, milestone: "Consistent this month" },
    ];
    for (const g of goals) {
      await db.goal.create({ data: { userId, ...g, done: g.progress >= 100 } });
    }
  }

  // Calendar events (this month)
  const existingEvents = await db.calendarEvent.count({ where: { userId } });
  if (existingEvents === 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const events = [
      { title: "Quran Halaqah", date: new Date(y, m, Math.min(now.getDate() + 1, 28)), time: "19:30", type: "reminder", note: "Weekly tafsir circle" },
      { title: "Volunteer at masjid", date: new Date(y, m, Math.min(now.getDate() + 3, 28)), time: "08:00", type: "goal", note: "Feed the fasting (if Ramadan)" },
      { title: "Fast Mondays & Thursdays", date: new Date(y, m, Math.min(now.getDate() + 2, 28)), type: "fasting", note: "Sunnah fast" },
      { title: "Family dinner", date: new Date(y, m, Math.min(now.getDate() + 5, 28)), time: "18:00", type: "reminder" },
      { title: "Book club — Islamic history", date: new Date(y, m, Math.min(now.getDate() + 7, 28)), time: "20:00", type: "goal" },
    ];
    for (const e of events) {
      await db.calendarEvent.create({ data: { userId, ...e } });
    }
  }

  // Sunnah fasts — last 30 days, mostly Mondays/Thursdays + a few white-days
  const existingFasts = await db.sunnahFast.count({ where: { userId } });
  if (existingFasts === 0) {
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const dow = d.getDay();
      // Mondays (1) and Thursdays (4) — 60% likelihood kept
      if ((dow === 1 || dow === 4) && Math.random() > 0.4) {
        await db.sunnahFast.create({
          data: {
            userId,
            date: d,
            fastType: dow === 1 ? "monday" : "thursday",
            note: dow === 1 ? "Sunnah fast — Monday" : "Sunnah fast — Thursday",
          },
        });
      }
    }
  }

  // Focus sessions — last 14 days of deep work, 0–4 per day with realistic durations
  const existingFocus = await db.focusSession.count({ where: { userId } });
  if (existingFocus === 0) {
    const modes = ["deep", "study", "quran", "reading"];
    const breaks = ["stretch", "water", "walk"];
    const intentions = [
      "Reviewing Surah Al-Kahf translation",
      "Memorizing new ayahs",
      "Reading Tafsir Ibn Kathir",
      "Studying Arabic grammar",
      "Reflection journaling",
      "Working on a community project",
      "Reading a book on Islamic history",
    ];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const sessionsToday = Math.floor(Math.random() * 4); // 0–3
      for (let s = 0; s < sessionsToday; s++) {
        const start = new Date(d);
        start.setHours(8 + s * 3, Math.floor(Math.random() * 50), 0, 0);
        const duration = [1500, 1800, 2400, 3000][Math.floor(Math.random() * 4)]; // 25/30/40/50 min
        const completed = Math.random() > 0.25;
        await db.focusSession.create({
          data: {
            userId,
            startedAt: start,
            endedAt: new Date(start.getTime() + duration * 1000),
            durationSec: duration,
            elapsedSec: completed ? duration : Math.floor(duration * (0.3 + Math.random() * 0.4)),
            mode: modes[Math.floor(Math.random() * modes.length)],
            breakActivity: breaks[Math.floor(Math.random() * breaks.length)],
            intention: intentions[Math.floor(Math.random() * intentions.length)],
            completed,
          },
        });
      }
    }
  }

  // Hifz — seed memorization of common short surahs (Juz Amma favorites)
  const existingHifz = await db.hifzSurah.count({ where: { userId } });
  if (existingHifz === 0) {
    // Import QURAN_SURAHS at runtime to avoid circular imports during seed
    const { QURAN_SURAHS } = await import("@/lib/islamic");
    // Fully memorized short surahs (with review dates spread over last 30 days)
    const fullyMemorized: { surah: number; daysAgo: number }[] = [
      { surah: 1, daysAgo: 3 }, // Al-Fatihah
      { surah: 112, daysAgo: 1 }, // Al-Ikhlas
      { surah: 113, daysAgo: 25 }, // Al-Falaq (due for review)
      { surah: 114, daysAgo: 4 }, // An-Nas
      { surah: 108, daysAgo: 35 }, // Al-Kawthar (overdue!)
      { surah: 103, daysAgo: 8 }, // Al-Asr
      { surah: 109, daysAgo: 12 }, // Al-Kafirun
      { surah: 110, daysAgo: 6 }, // An-Nasr
      { surah: 105, daysAgo: 2 }, // Al-Fil
      { surah: 106, daysAgo: 28 }, // Quraysh
      { surah: 107, daysAgo: 15 }, // Al-Ma'un
      { surah: 111, daysAgo: 40 }, // Al-Masad (overdue!)
      { surah: 104, daysAgo: 10 }, // Al-Humazah
      { surah: 101, daysAgo: 7 }, // Al-Qari'ah
      { surah: 102, daysAgo: 18 }, // At-Takathur
    ];
    for (const m of fullyMemorized) {
      const reviewed = new Date();
      reviewed.setDate(reviewed.getDate() - m.daysAgo);
      // Mark as needs_review if older than 28 days, else memorized
      const status = m.daysAgo > 28 ? "needs_review" : "memorized";
      const surahInfo = QURAN_SURAHS.find((s) => s.number === m.surah);
      await db.hifzSurah.create({
        data: {
          userId,
          surahNumber: m.surah,
          status,
          memorizedFrom: 1,
          memorizedTo: surahInfo?.ayahs ?? 999,
          lastReviewed: reviewed,
        },
      });
    }
    // Surahs in progress
    const inProgress: { surah: number; from: number; to: number }[] = [
      { surah: 67, from: 1, to: 15 }, // Al-Mulk (half)
      { surah: 36, from: 1, to: 30 }, // Ya-Sin (about a third)
      { surah: 18, from: 1, to: 22 }, // Al-Kahf (first section)
      { surah: 55, from: 1, to: 30 }, // Ar-Rahman
      { surah: 56, from: 1, to: 40 }, // Al-Waqi'ah
    ];
    for (const p of inProgress) {
      await db.hifzSurah.create({
        data: {
          userId,
          surahNumber: p.surah,
          status: "in_progress",
          memorizedFrom: p.from,
          memorizedTo: p.to,
        },
      });
    }
  }

  // Sadaqah — seed entries over last 30 days
  const existingSadaqah = await db.sadaqahEntry.count({ where: { userId } });
  if (existingSadaqah === 0) {
    const sadaqahSeed: { daysAgo: number; amount: number; type: string; recipient: string; note: string }[] = [
      { daysAgo: 1, amount: 50000, type: "sadaqah", recipient: "Local mosque", note: "Friday contribution" },
      { daysAgo: 3, amount: 100000, type: "sadaqah", recipient: "Orphanage", note: "" },
      { daysAgo: 5, amount: 25000, type: "sadaqah", recipient: "Street vendor", note: "Bought snacks for kids" },
      { daysAgo: 7, amount: 2, type: "time", recipient: "Elderly neighbor", note: "Helped with groceries" },
      { daysAgo: 9, amount: 75000, type: "sadaqah", recipient: "Online campaign", note: "Water well project" },
      { daysAgo: 12, amount: 1, type: "in_kind", recipient: "Food bank", note: "Donated 1 bag of rice" },
      { daysAgo: 14, amount: 50000, type: "sadaqah", recipient: "Quran school", note: "" },
      { daysAgo: 17, amount: 200000, type: "sadaqah_jariyah", recipient: "Mosque construction", note: "Monthly pledge" },
      { daysAgo: 20, amount: 1, type: "time", recipient: "Community", note: "Taught Quran to children" },
      { daysAgo: 23, amount: 100000, type: "sadaqah", recipient: "Sick relative", note: "Get well gift" },
      { daysAgo: 26, amount: 30000, type: "sadaqah", recipient: "Beggar", note: "" },
      { daysAgo: 28, amount: 150000, type: "sadaqah", recipient: "Disaster relief", note: "Flood victims" },
    ];
    for (const s of sadaqahSeed) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - s.daysAgo);
      await db.sadaqahEntry.create({
        data: {
          userId,
          date: d,
          amount: s.amount,
          unit: s.type === "time" ? "hour" : s.type === "in_kind" ? "item" : "idr",
          type: s.type,
          recipient: s.recipient,
          note: s.note,
        },
      });
    }
  }

  // Seed Zakat calculation history (2 entries — one paid from last year, one pending)
  const existingZakat = await db.zakatCalculation.count({ where: { userId } });
  if (existingZakat === 0) {
    const breakdownLastYear = JSON.stringify({
      cash: { amount: 80000000, valueIDR: 80000000 },
      gold: { amount: 50, valueIDR: 62500000 },
      stocks: { amount: 25000000, valueIDR: 25000000 },
      receivables: { amount: 5000000, valueIDR: 5000000 },
      liabilities: { amount: 10000000, valueIDR: 10000000 },
    });
    const breakdownThisYear = JSON.stringify({
      cash: { amount: 95000000, valueIDR: 95000000 },
      gold: { amount: 65, valueIDR: 81250000 },
      silver: { amount: 100, valueIDR: 1500000 },
      stocks: { amount: 38000000, valueIDR: 38000000 },
      receivables: { amount: 7000000, valueIDR: 7000000 },
      liabilities: { amount: 12000000, valueIDR: 12000000 },
    });

    // Last year's calc — paid
    const lastYearCalcDate = new Date();
    lastYearCalcDate.setFullYear(lastYearCalcDate.getFullYear() - 1);
    lastYearCalcDate.setHours(0, 0, 0, 0);
    const lastYearHawlEnd = new Date(lastYearCalcDate);
    lastYearHawlEnd.setDate(lastYearHawlEnd.getDate() + 354);
    const lastYearAssets = 80000000 + 62500000 + 25000000 + 5000000;
    const lastYearLiab = 10000000;
    const lastYearBase = lastYearAssets - lastYearLiab;
    await db.zakatCalculation.create({
      data: {
        userId,
        calculationDate: lastYearCalcDate,
        hawlStartDate: lastYearCalcDate,
        hawlEndDate: lastYearHawlEnd,
        nisabStandard: "gold",
        nisabThresholdIDR: 85 * 1250000,
        totalAssetsIDR: lastYearAssets,
        totalLiabilitiesIDR: lastYearLiab,
        zakatableBaseIDR: lastYearBase,
        zakatDueIDR: Math.round(lastYearBase * 0.025),
        isPaid: true,
        paidDate: new Date(lastYearCalcDate.getTime() + 1000 * 60 * 60 * 24 * 30),
        breakdown: breakdownLastYear,
        note: "Annual zakat — paid via local mosque committee",
      },
    });

    // This year's calc — pending (due in 2 months)
    const thisYearCalcDate = new Date();
    thisYearCalcDate.setMonth(thisYearCalcDate.getMonth() - 4);
    thisYearCalcDate.setHours(0, 0, 0, 0);
    const thisYearHawlEnd = new Date(thisYearCalcDate);
    thisYearHawlEnd.setDate(thisYearHawlEnd.getDate() + 354);
    const thisYearAssets = 95000000 + 81250000 + 1500000 + 38000000 + 7000000;
    const thisYearLiab = 12000000;
    const thisYearBase = thisYearAssets - thisYearLiab;
    await db.zakatCalculation.create({
      data: {
        userId,
        calculationDate: thisYearCalcDate,
        hawlStartDate: thisYearCalcDate,
        hawlEndDate: thisYearHawlEnd,
        nisabStandard: "gold",
        nisabThresholdIDR: 85 * 1250000,
        totalAssetsIDR: thisYearAssets,
        totalLiabilitiesIDR: thisYearLiab,
        zakatableBaseIDR: thisYearBase,
        zakatDueIDR: Math.round(thisYearBase * 0.025),
        isPaid: false,
        breakdown: breakdownThisYear,
        note: "Calculated — pending distribution",
      },
    });
  }

  return user;
}

export async function getDemoUserId() {
  await ensureSeedData();
  const u = await db.user.findFirst();
  return u!.id;
}
