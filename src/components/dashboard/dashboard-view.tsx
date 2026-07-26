"use client";

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

export function DashboardView() {
  const { isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;

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
