"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ScrollText,
  Sparkles,
  Repeat,
  Settings,
  MoreHorizontal,
  CalendarDays,
  PenLine,
  BookMarked,
  HandHeart,
  Target,
  Timer,
  Wallet,
} from "lucide-react";
import { useAppStore, type ViewKey } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavItem {
  key: ViewKey;
  label: string;
  icon: React.ElementType;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { key: "dashboard", label: "Beranda", icon: LayoutDashboard },
  { key: "khatma", label: "Quran", icon: ScrollText },
  { key: "kebiasaan", label: "Kebiasaan", icon: Repeat },
  { key: "jurnal", label: "Jurnal", icon: PenLine },
];

const MORE_ITEMS: MobileNavItem[] = [
  { key: "kalender", label: "Kalender", icon: CalendarDays },
  { key: "hifz", label: "Hifz", icon: BookMarked },
  { key: "shalat", label: "Shalat", icon: Sparkles },
  { key: "doa", label: "Doa", icon: HandHeart },
  { key: "catatan", label: "Catatan", icon: Settings },
  { key: "tujuan", label: "Tujuan", icon: Target },
  { key: "fokus", label: "Fokus", icon: Timer },
  { key: "keuangan", label: "Keuangan", icon: Wallet },
  { key: "siklus", label: "Siklus", icon: Sparkles },
  { key: "pencapaian", label: "Pencapaian", icon: Sparkles },
  { key: "analitik", label: "Analitik", icon: Sparkles },
  { key: "pengaturan", label: "Pengaturan", icon: Settings },
];

export function BottomNav() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-strong border-t border-border/60 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = activeView === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-0",
                active
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  active && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-0",
                MORE_ITEMS.some((item) => item.key === activeView) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">Lainnya</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl pb-8">
            <SheetHeader className="text-left">
              <SheetTitle>Fitur lainnya</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-2 pt-4">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveView(item.key)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs",
                      active ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
