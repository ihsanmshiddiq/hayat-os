"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  PanelLeft,
  Clock,
  Sparkles,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import {
  computePrayerTimes,
  formatCountdown,
  formatTimeInZone,
  getGregorianDate,
  getHijriDate,
  getNextPrayer,
  getLocationTimezoneHours,
  CALC_METHODS,
  type PrayerTimesResult,
} from "@/lib/islamic";
import { useDashboard } from "@/lib/hooks";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { useSetKeyboardShortcutsOpen } from "@/components/layout/keyboard-shortcuts";

type CalcMethodKey = keyof typeof CALC_METHODS;

interface TopbarProps {
  userName?: string | null;
  userImage?: string | null;
}

export function Topbar({ userName, userImage }: TopbarProps) {
  const { setCommandOpen, setActiveView, activeView, toggleSidebar } = useAppStore();
  const now = useNow(1000);
  const { data } = useDashboard();
  const openShortcuts = useSetKeyboardShortcutsOpen();

  const lat = data?.user.latitude ?? -6.2088;
  const lng = data?.user.longitude ?? 106.8456;
  const method = (data?.user.method as CalcMethodKey | undefined) ?? "Kemenag";
  const tz = getLocationTimezoneHours(lng);

  const times: PrayerTimesResult | null = React.useMemo(() => {
    if (!now) return null;
    return computePrayerTimes({
      date: now,
      lat,
      lng,
      timezone: tz,
      method,
    });
  }, [now, lat, lng, tz, method]);

  const next = React.useMemo(() => {
    if (!times || !now) return null;
    const base = getNextPrayer(times, now);
    if (base.isToday) return base;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tt = computePrayerTimes({
      date: tomorrow,
      lat,
      lng,
      timezone: tz,
      method,
    });
    return { name: "Fajr" as const, time: tt.Fajr, isToday: false, msRemaining: tt.Fajr.getTime() - now.getTime() };
  }, [times, now, lat, lng, tz, method]);

  const locNow = now ? new Date(now.getTime() + tz * 3600000) : null;
  const hijri = locNow ? getHijriDate(locNow) : null;
  const greg = locNow ? getGregorianDate(locNow) : "";

  const [notifOpen, setNotifOpen] = React.useState(false);
  const initials = (userName ?? "Anda").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-20 glass border-b border-border/60">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="px-4 py-4 border-b">
              <SheetTitle className="text-display flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">ح</span>
                Hayat
              </SheetTitle>
            </SheetHeader>
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveView(item.key)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-sidebar-accent text-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px]", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop collapse */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:inline-flex text-muted-foreground"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </Button>

        {/* Search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="group flex items-center gap-2.5 h-10 w-full max-w-md rounded-xl border border-border/70 bg-card/60 px-3.5 text-sm text-muted-foreground hover:border-border hover:bg-card transition-colors"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Cari sesuatu…</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
          {/* Date */}
          <div className="hidden md:flex flex-col items-end leading-tight pr-2 border-r border-border/60 mr-1">
            <span className="text-[11px] text-muted-foreground">{hijri?.formatted}</span>
            <span className="text-xs font-medium truncate max-w-[180px]">{greg}</span>
          </div>

          {/* Prayer countdown */}
          {next && now ? (
            <motion.button
              onClick={() => setActiveView("shalat")}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="hidden sm:flex items-center gap-2.5 h-10 rounded-xl border border-primary/20 bg-primary/5 px-3.5 text-sm hover:bg-primary/10 transition-colors group"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] text-muted-foreground">Berikutnya: {next.name}</span>
                <span className="text-xs font-semibold text-primary tabular-nums">
                  {formatCountdown(next.msRemaining)}
                </span>
              </div>
            </motion.button>
          ) : (
            <div className="hidden sm:flex h-10 w-32 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Memuat…</span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative text-muted-foreground"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </Button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-80 z-40 rounded-2xl border border-border bg-popover p-2 shadow-premium"
                  >
                    <p className="px-3 py-2 text-display text-sm font-semibold">Pengingat</p>
                    <div className="space-y-1">
                      <NotifItem
                        title="Shalat berikutnya mendekat"
                        desc={next && now ? `${next.name} dalam ${formatCountdown(next.msRemaining)} · ${formatTimeInZone(next.time, tz)}` : "—"}
                      />
                      <NotifItem title="Baca Al-Quran" desc="Target tilawah hari ini" />
                      <NotifItem title="Jurnal harian" desc="Kamu belum menulis hari ini" />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <button
            onClick={() => setActiveView("pengaturan")}
            className="rounded-full ring-2 ring-transparent hover:ring-border transition-all"
          >
            <Avatar className="h-9 w-9 border border-border">
              {userImage && (
                <AvatarImage src={userImage} alt={userName ?? "Pengguna"} loading="lazy" />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Keyboard shortcuts */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openShortcuts(true)}
            className="text-muted-foreground hidden sm:inline-flex"
            title="Pintasan keyboard (?)"
          >
            <Keyboard className="h-[18px] w-[18px]" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function NotifItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}
