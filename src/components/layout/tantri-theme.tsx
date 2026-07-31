"use client";

import * as React from "react";
import { getSpecialProfile } from "@/lib/easter-egg";

const PARTICLES = [
  [7, 16, 0, "♥"], [17, 74, 1.6, "✦"], [28, 22, 3.2, "♥"], [43, 88, 0.8, "✦"],
  [58, 12, 2.4, "♥"], [71, 77, 4, "✦"], [84, 29, 1.2, "♥"], [94, 66, 3.7, "✦"],
] as const;

export function TantriTheme({ name, email }: { name?: string | null; email?: string | null }) {
  const isTantri = getSpecialProfile(name, email)?.kind === "tantri";
  React.useEffect(() => {
    document.documentElement.classList.toggle("tantri-theme", isTantri);
    return () => document.documentElement.classList.remove("tantri-theme");
  }, [isTantri]);
  if (!isTantri) return null;
  return <div className="tantri-sparkles" aria-hidden="true">{PARTICLES.map(([left, top, delay, glyph], index) => <span key={index} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}>{glyph}</span>)}</div>;
}
