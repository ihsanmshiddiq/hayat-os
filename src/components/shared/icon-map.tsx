"use client";

import {
  Activity,
  BookOpen,
  Bookmark,
  CheckCircle,
  Clock,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  Moon,
  PenLine,
  Sparkles,
  Star,
  Sunrise,
  Sun,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Bookmark,
  CheckCircle,
  Clock,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Leaf,
  Moon,
  PenLine,
  Sparkles,
  Star,
  Sunrise,
  Sun,
  Target,
  Trophy,
  Users,
  Zap,
};

export function HabitIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? CheckCircle;
  return <Icon className={className} />;
}

export const HABIT_COLOR_MAP: Record<
  string,
  { bg: string; text: string; ring: string; dot: string }
> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/20",
    dot: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/20",
    dot: "bg-rose-500",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/20",
    dot: "bg-sky-500",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/20",
    dot: "bg-violet-500",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    ring: "ring-cyan-500/20",
    dot: "bg-cyan-500",
  },
};

export function habitColor(color: string) {
  return HABIT_COLOR_MAP[color] ?? HABIT_COLOR_MAP.emerald;
}
