"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
};

/** A restrained pointer-following light for cards that invite interaction. */
export function SpotlightCard({ className, spotlightColor = "var(--primary)", children, onMouseMove, ...props }: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x: 50, y: 50 });

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) setPosition({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        onMouseMove?.(event);
      }}
      className={cn("group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-premium", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(240px circle at ${position.x}% ${position.y}%, color-mix(in srgb, ${spotlightColor} 18%, transparent), transparent 70%)` }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[450%] dark:via-white/5" />
      <div className="relative">{children}</div>
    </div>
  );
}
