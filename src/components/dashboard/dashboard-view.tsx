"use client";

import * as React from "react";
import { useDashboard } from "@/lib/hooks";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { HadithOfTheDay } from "@/components/dashboard/hadith-of-the-day";
import { ScholarQuoteOfTheDay } from "@/components/dashboard/scholar-quote";
import { DailyFocus } from "@/components/dashboard/daily-focus";
import { PrayerOverview } from "@/components/dashboard/prayer-overview";
import { QuranProgress } from "@/components/dashboard/quran-progress";
import { HabitTracker } from "@/components/dashboard/habit-tracker";
import { KhatmaPreview } from "@/components/dashboard/khatma-preview";
import { CalendarPreview } from "@/components/dashboard/calendar-preview";
import { JournalQuickEntry } from "@/components/dashboard/journal-quick-entry";
import { GoalsPreview } from "@/components/dashboard/goals-preview";
import { AnalyticsPreview } from "@/components/dashboard/analytics-preview";
import { AchievementsPreview } from "@/components/dashboard/achievements-preview";
import { HifzPreview } from "@/components/dashboard/hifz-preview";
import { FocusPreview } from "@/components/dashboard/focus-preview";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function DashboardView() {
  const { isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mb-5">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-display text-xl font-medium mb-2">Gagal memuat dasbor</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Terjadi kesalahan saat mengambil data. Database tidak tersedia di lingkungan ini.
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <RefreshCcw className="h-4 w-4" />
          Muat ulang
        </button>
        <p className="text-xs text-muted-foreground/60 mt-4 max-w-sm">
          {error?.message || "Untuk production, pastikan database sudah terkonfigurasi di Environment Variables."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyFocus />
        <PrayerOverview />
      </div>

      {/* Kutipan Ulama */}
      <ScholarQuoteOfTheDay />

      {/* Hadits Hari Ini */}
      <HadithOfTheDay />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuranProgress />
        <HabitTracker />
      </div>

      {/* Khatma */}
      <KhatmaPreview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HifzPreview />
        <FocusPreview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarPreview />
        <AnalyticsPreview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalsPreview />
        <AchievementsPreview />
        <JournalQuickEntry />
      </div>
    </div>
  );
}
