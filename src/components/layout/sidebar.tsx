"use client";

import * as React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  PenLine,
  Repeat,
  BookOpen,
  Sparkles,
  StickyNote,
  Target,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Moon,
  Sun,
  ChevronDown,
  HandHeart,
  Disc,
  Crown,
  Gem,
  Timer,
  BookMarked,
  ScrollText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAppStore, type ViewKey } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMounted } from "@/hooks/use-now";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Ringkasan",
    items: [
      { key: "dashboard", label: "Dasbor", icon: LayoutDashboard, description: "Hari ini dalam sekilas" },
      { key: "kalender", label: "Kalender", icon: CalendarDays, description: "Jadwal & peristiwa Islami" },
      { key: "jurnal", label: "Jurnal Harian", icon: PenLine, description: "Rasa syukur & renungan" },
      { key: "kebiasaan", label: "Kebiasaan", icon: Repeat, description: "Bangun konsistensi" },
    ],
  },
  {
    label: "Ibadah",
    items: [
      { key: "quran", label: "Al-Quran", icon: BookOpen, description: "Membaca & menghafal" },
      { key: "khatma", label: "Khatma", icon: ScrollText, description: "Rencana baca Al-Quran" },
      { key: "hifz", label: "Hifz", icon: BookMarked, description: "Pelacak hafalan Al-Quran" },
      { key: "shalat", label: "Shalat", icon: Sparkles, description: "Pelacakan shalat" },
      { key: "dzikr", label: "Dzikir", icon: Disc, description: "Tasbih & dzikir harian" },
      { key: "doa", label: "Doa", icon: HandHeart, description: "Kumpulan doa harian" },
      { key: "asma", label: "99 Asma", icon: Gem, description: "Asma'ul Husna" },
    ],
  },
  {
    label: "Sistem",
    items: [
      { key: "catatan", label: "Catatan", icon: StickyNote, description: "Catatan markdown" },
      { key: "tujuan", label: "Tujuan", icon: Target, description: "Yang kamu bangun" },
      { key: "fokus", label: "Fokus", icon: Timer, description: "Kerja dalam dengan niat" },
      { key: "pencapaian", label: "Pencapaian", icon: Crown, description: "Lencana & pencapaian" },
      { key: "analitik", label: "Analitik", icon: BarChart3, description: "Wawasan indah" },
      { key: "pengaturan", label: "Pengaturan", icon: Settings, description: "Preferensi" },
    ],
  },
];

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function Sidebar({ userName }: { userName?: string | null }) {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useAppStore();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const badgeToneClass: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  };

  const initials = (userName ?? "Anda")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TooltipProvider delayDuration={150}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 264 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0",
          "border-r border-sidebar-border bg-sidebar",
          "z-30"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border/70">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <span className="text-display font-semibold text-lg">ح</span>
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <p className="text-display text-[15px] font-semibold leading-tight tracking-tight">
                  Hayat
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Sistem Operasi Islami
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scroll-slim px-3 py-4">
          <div className="space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                {sidebarCollapsed && (
                  <div className="mx-3 mb-2 mt-1 border-t border-sidebar-border/50" />
                )}
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = activeView === item.key;
                    const Icon = item.icon;
                    const inner = (
                      <button
                        onClick={() => setActiveView(item.key)}
                        className={cn(
                          "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                          "hover:bg-sidebar-accent",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary"
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          />
                        )}
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-colors",
                            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {!sidebarCollapsed && (
                          <span className="truncate font-medium flex-1 text-left">{item.label}</span>
                        )}
                      </button>
                    );
                    if (sidebarCollapsed) {
                      return (
                        <li key={item.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>{inner}</TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        </li>
                      );
                    }
                    return <li key={item.key}>{inner}</li>;
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer: collapse, theme, profile */}
        <div className="border-t border-sidebar-border/70 p-3 space-y-1">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-[18px] w-[18px]" />
            ) : (
              <PanelLeftClose className="h-[18px] w-[18px]" />
            )}
            {!sidebarCollapsed && <span className="font-medium">Rapatkan</span>}
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
            {!sidebarCollapsed && <span className="font-medium">Tema</span>}
          </button>

          {/* Profile */}
          <div className="relative pt-1">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="w-full flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8 border border-sidebar-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium">{userName ?? "Anda"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">hayat@app</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      profileOpen && "rotate-180"
                    )}
                  />
                </>
              )}
            </button>
            <AnimatePresence>
              {profileOpen && !sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => { setActiveView("pengaturan"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors mt-1"
                  >
                    <Settings className="h-4 w-4" /> Profil & preferensi
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}

export { NAV_ITEMS };
