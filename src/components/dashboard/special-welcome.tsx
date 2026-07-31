"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { getSpecialProfile } from "@/lib/easter-egg";
import { SpotlightCard } from "@/components/shared/spotlight-card";

export function SpecialWelcome({ name }: { name?: string | null }) {
  const profile = getSpecialProfile(name);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { if (profile && !sessionStorage.getItem("hayat-special-welcome")) { setOpen(true); sessionStorage.setItem("hayat-special-welcome", "1"); } }, [profile]);
  if (!profile) return null;
  return <>
    <SpotlightCard className="p-5 border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10" spotlightColor={profile.accent === "rose" ? "#ec4899" : "#10b981"}>
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Crown className="h-5 w-5" /></span><div><p className="text-xs text-muted-foreground">Ruang istimewa</p><p className="text-display text-lg font-medium">{profile.title}</p><p className="text-sm text-muted-foreground">{profile.message}</p></div></div>
    </SpotlightCard>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] grid place-items-center bg-background/70 p-4 backdrop-blur-sm"><motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }} className="relative max-w-sm overflow-hidden rounded-3xl border border-primary/20 bg-card p-8 text-center shadow-premium"><button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-muted-foreground"><X className="h-4 w-4" /></button><Sparkles className="mx-auto h-9 w-9 text-amber-500" /><h2 className="text-display mt-4 text-2xl font-medium">Assalamu’alaikum, {name}</h2><p className="mt-2 text-sm text-muted-foreground">{profile.message}</p><button onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Mulai hari ini</button></motion.div></motion.div>}</AnimatePresence>
  </>;
}
