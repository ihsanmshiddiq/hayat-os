"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { KeyboardShortcutsOverlay, useGlobalKeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { PageTransition } from "@/components/shared/page-transition";
import { useAppStore } from "@/lib/store";
import { useDashboard } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { TantriTheme } from "@/components/layout/tantri-theme";

// Lazy-load setiap section agar compile hanya yang aktif
const CalendarView = dynamic(() => import("@/components/sections/calendar-view").then(m => ({ default: m.CalendarView })), { ssr: false });
const JournalView = dynamic(() => import("@/components/sections/journal-view").then(m => ({ default: m.JournalView })), { ssr: false });
const HabitsView = dynamic(() => import("@/components/sections/habits-view").then(m => ({ default: m.HabitsView })), { ssr: false });
const KhatmaView = dynamic(() => import("@/components/sections/khatma-view").then(m => ({ default: m.KhatmaView })), { ssr: false });
const SalahView = dynamic(() => import("@/components/sections/salah-view").then(m => ({ default: m.SalahView })), { ssr: false });
const DuasView = dynamic(() => import("@/components/sections/duas-view").then(m => ({ default: m.DuasView })), { ssr: false });
const HifzView = dynamic(() => import("@/components/sections/hifz-view").then(m => ({ default: m.HifzView })), { ssr: false });
const NotesView = dynamic(() => import("@/components/sections/notes-view").then(m => ({ default: m.NotesView })), { ssr: false });
const GoalsView = dynamic(() => import("@/components/sections/goals-view").then(m => ({ default: m.GoalsView })), { ssr: false });
const FocusView = dynamic(() => import("@/components/sections/focus-view").then(m => ({ default: m.FocusView })), { ssr: false });
const FinanceView = dynamic(() => import("@/components/sections/finance-view").then(m => ({ default: m.FinanceView })), { ssr: false });
const MenstrualView = dynamic(() => import("@/components/sections/menstrual-view").then(m => ({ default: m.MenstrualView })), { ssr: false });
const AchievementsView = dynamic(() => import("@/components/sections/achievements-view").then(m => ({ default: m.AchievementsView })), { ssr: false });
const AnalyticsView = dynamic(() => import("@/components/sections/analytics-view").then(m => ({ default: m.AnalyticsView })), { ssr: false });
const SettingsView = dynamic(() => import("@/components/sections/settings-view").then(m => ({ default: m.SettingsView })), { ssr: false });

export function AppShell() {
  const { activeView } = useAppStore();
  const { data } = useDashboard();
  const queryClient = useQueryClient();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    const syncUser = (nextUser: User | null) => {
      setUser(nextUser);
      // The first dashboard query can run before Supabase restores the
      // browser session. Refetch once the user is known so demo data never
      // remains in the UI after login.
      void queryClient.invalidateQueries();
    };
    supabase.auth.getUser().then(({ data: { user } }) => syncUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);


  // The Prisma User record is the canonical display source. Supabase
  // metadata is only a bootstrap fallback for the first render; otherwise a
  // name changed in Settings would be overwritten by stale OAuth metadata.
  const userName = data?.user.name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name;
  const userImage = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
  useGlobalKeyboardShortcuts();

  return (
    <div className="flex min-h-screen bg-background">
      <TantriTheme name={userName} email={user?.email ?? data?.user.email} />
      <Sidebar userName={userName} userImage={userImage} userEmail={user?.email ?? data?.user.email} />
      <div className="flex-1 flex flex-col min-w-0 lg:pb-0 pb-16">
        <Topbar userName={userName} userImage={userImage} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={activeView}>
              {renderView(activeView)}
            </PageTransition>
          </AnimatePresence>
        </main>
        <footer className="mt-auto border-t border-border/60 bg-background/60 hidden lg:block">
          <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-semibold">ح</span>
              <span className="font-medium">Hayat</span>
              <span>· Sistem Operasi Islami</span>
            </div>
            <p className="text-center sm:text-right">
              <span className="text-arabic">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
              <span className="mx-2 hidden sm:inline">·</span>
              <span className="block sm:inline">Dibuat dengan penuh perhatian · {new Date().getFullYear()}</span>
            </p>
          </div>
        </footer>
      </div>

      {/* Bottom Nav untuk Mobile */}
      <BottomNav />

      <CommandPalette />
      <KeyboardShortcutsOverlay />
    </div>
  );
}

function renderView(view: string) {
  switch (view) {
    case "dashboard": return <DashboardView />;
    case "kalender": return <CalendarView />;
    case "jurnal": return <JournalView />;
    case "kebiasaan": return <HabitsView />;
    case "khatma": return <KhatmaView />;
    case "hifz": return <HifzView />;
    case "shalat": return <SalahView />;
    case "doa": return <DuasView />;
    case "catatan": return <NotesView />;
    case "tujuan": return <GoalsView />;
    case "fokus": return <FocusView />;
    case "keuangan": return <FinanceView />;
    case "siklus": return <MenstrualView />;
    case "pencapaian": return <AchievementsView />;
    case "analitik": return <AnalyticsView />;
    case "pengaturan": return <SettingsView />;
    default: return <DashboardView />;
  }
}
