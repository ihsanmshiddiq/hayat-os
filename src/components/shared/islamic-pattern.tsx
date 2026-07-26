"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * IslamicGeometricPattern — a subtle SVG tessellation backdrop.
 * Renders an 8-pointed star (Khatam) grid using currentColor strokes.
 * Designed to be used as a decorative opacity layer behind hero sections.
 */
export function IslamicGeometricPattern({
  className,
  opacity = 0.06,
  size = 64,
  strokeWidth = 1,
}: {
  className?: string;
  opacity?: number;
  size?: number;
  strokeWidth?: number;
}) {
  // The 8-point star (khatam) tessellation pattern
  const patternId = React.useId().replace(/[:]/g, "");
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`igp-${patternId}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          {/* 8-pointed star (two overlapped squares) */}
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <rect
              x={size * 0.25}
              y={size * 0.25}
              width={size * 0.5}
              height={size * 0.5}
              transform={`rotate(45 ${size / 2} ${size / 2})`}
            />
            <rect
              x={size * 0.25}
              y={size * 0.25}
              width={size * 0.5}
              height={size * 0.5}
            />
            {/* Central dot + outer ring accents */}
            <circle cx={size / 2} cy={size / 2} r={size * 0.06} />
            <circle cx={0} cy={0} r={size * 0.04} />
            <circle cx={size} cy={0} r={size * 0.04} />
            <circle cx={0} cy={size} r={size * 0.04} />
            <circle cx={size} cy={size} r={size * 0.04} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#igp-${patternId})`} />
    </svg>
  );
}

/**
 * IslamicPatternHexagram — six-pointed star (Najmat Dawud) tessellation.
 * Alternative geometric variant for variety across sections.
 */
export function IslamicPatternHexagram({
  className,
  opacity = 0.05,
  size = 56,
  strokeWidth = 1,
}: {
  className?: string;
  opacity?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const patternId = React.useId().replace(/[:]/g, "");
  const c = size / 2;
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`ihp-${patternId}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            {/* Triangle up */}
            <polygon
              points={`${c},2 ${size - 2},${size - 2} 2,${size - 2}`}
            />
            {/* Triangle down */}
            <polygon
              points={`${c},${size - 2} 2,2 ${size - 2},2`}
            />
            <circle cx={c} cy={c} r={size * 0.08} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ihp-${patternId})`} />
    </svg>
  );
}

/**
 * IslamicPatternArabesque — flowing vine/leaf pattern evoking classical
 * Islamic vegetal ornament. Uses bezier curves for organic flow.
 */
export function IslamicPatternArabesque({
  className,
  opacity = 0.04,
  size = 80,
  strokeWidth = 1.2,
}: {
  className?: string;
  opacity?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const patternId = React.useId().replace(/[:]/g, "");
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`iar-${patternId}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          >
            {/* S-curve vine */}
            <path d={`M 0 ${size / 2} C ${size * 0.2} ${size * 0.2}, ${size * 0.4} ${size * 0.8}, ${size / 2} ${size / 2}`} />
            <path d={`M ${size / 2} ${size / 2} C ${size * 0.6} ${size * 0.2}, ${size * 0.8} ${size * 0.8}, ${size} ${size / 2}`} />
            {/* Leaves */}
            <ellipse cx={size * 0.25} cy={size * 0.35} rx={size * 0.08} ry={size * 0.04} transform={`rotate(-30 ${size * 0.25} ${size * 0.35})`} />
            <ellipse cx={size * 0.75} cy={size * 0.35} rx={size * 0.08} ry={size * 0.04} transform={`rotate(30 ${size * 0.75} ${size * 0.35})`} />
            <ellipse cx={size * 0.5} cy={size * 0.7} rx={size * 0.08} ry={size * 0.04} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#iar-${patternId})`} />
    </svg>
  );
}

/**
 * IslamicPatternMoroccan — 8-fold rosette star pattern (Rub el Hizb variant).
 */
export function IslamicPatternMoroccan({
  className,
  opacity = 0.05,
  size = 60,
  strokeWidth = 1,
}: {
  className?: string;
  opacity?: number;
  size?: number;
  strokeWidth?: number;
}) {
  const patternId = React.useId().replace(/[:]/g, "");
  const c = size / 2;
  // 8-pointed star path (two squares rotated 45°)
  const starPoints = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? size * 0.42 : size * 0.2;
    return `${c + r * Math.cos(angle)},${c + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`imr-${patternId}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
            <polygon points={starPoints} />
            <circle cx={c} cy={c} r={size * 0.08} />
            <circle cx={0} cy={0} r={size * 0.05} />
            <circle cx={size} cy={0} r={size * 0.05} />
            <circle cx={0} cy={size} r={size * 0.05} />
            <circle cx={size} cy={size} r={size * 0.05} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#imr-${patternId})`} />
    </svg>
  );
}

/**
 * AnimatedGradientBorder — a premium animated gradient border wrapper.
 * The border slowly rotates through emerald → amber → teal hues.
 * Use sparingly on hero cards.
 */
export function AnimatedGradientBorder({
  children,
  className,
  strong = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  const id = React.useId().replace(/[:]/g, "");
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl", className)}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-[1px] rounded-2xl opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, var(--primary), #f59e0b, #14b8a6, var(--primary))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: strong ? 14 : 22, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-2xl bg-card">{children}</div>
      <span className="sr-only" id={id} />
    </div>
  );
}

/**
 * IslamicCornerOrnament — a small decorative SVG flourish for card corners.
 * Premium feel — evokes Islamic manuscript corner ornaments.
 */
export function IslamicCornerOrnament({
  className,
  position = "top-right",
}: {
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}) {
  const transform = {
    "top-right": "",
    "top-left": "scale(-1 1)",
    "bottom-right": "scale(1 -1)",
    "bottom-left": "scale(-1 -1)",
  }[position];

  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className={cn("pointer-events-none absolute h-10 w-10 text-primary/30", className)}
      style={{ transform }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M 4 4 L 4 24 Q 4 4 24 4" />
        <path d="M 4 12 Q 12 4 20 4" opacity="0.6" />
        <path d="M 4 18 Q 14 8 22 4" opacity="0.4" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="14" cy="4" r="1" fill="currentColor" opacity="0.7" />
        <circle cx="4" cy="14" r="1" fill="currentColor" opacity="0.7" />
      </g>
    </svg>
  );
}
