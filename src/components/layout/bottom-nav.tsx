"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Repeat,
  Settings,
} from "lucide-react";
import { useAppStore, type ViewKey } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MobileNavItem {
  key: ViewKey;
  label: string;
  icon: React.ElementType;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { key: "dashboard", label: "Dasbor", icon: LayoutDashboard },
  { key: "quran", label: "Quran", icon: BookOpen },
  { key: "shalat", label: "Shalat", icon: Sparkles },
  { key: "kebiasaan", label: "Kebiasaan", icon: Repeat },
  { key: "pengaturan", label: "Lainnya", icon: Settings },
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
      </div>
    </nav>
  );
}
