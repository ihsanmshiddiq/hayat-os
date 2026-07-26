"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  className?: string;
  trackClassName?: string;
  children?: React.ReactNode;
  gradient?: boolean;
  animate?: boolean;
  /** Show a glowing dot at the leading edge of the arc */
  showLeadingDot?: boolean;
  /** Minimum visible arc length as % of circle (so tiny values still read as an arc, not a blob) */
  minArcPct?: number;
}

/**
 * A polished circular progress ring with optional gradient stroke.
 * - Starts at 12 o'clock, traces clockwise.
 * - At very small values, enforces a `minArcPct` so the arc is always recognizable.
 * - Optional leading dot (glowing) at the arc's end for premium feel.
 *
 * Implementation note: we do NOT use the parent `-rotate-90` trick because it
 * complicates positioning of the leading dot. Instead, we rotate just the
 * `<circle>` dash start position using SVG's `transform` attribute, which keeps
 * the dot's coordinates in the same un-rotated frame as the rest of the SVG.
 */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  className,
  trackClassName,
  children,
  gradient = true,
  animate = true,
  showLeadingDot = true,
  minArcPct = 4,
}: ProgressRingProps) {
  const v = Math.max(0, Math.min(100, value));
  // Apply minimum arc visibility only when there is actual progress (not for 0)
  const effectiveV = v > 0 && v < minArcPct ? minArcPct : v;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (effectiveV / 100) * circumference;
  const id = React.useId();
  const gradId = `grad-${id}`;
  const glowId = `glow-${id}`;

  // Leading dot position: arc starts at 12 o'clock (top) and goes clockwise.
  // After `effectiveV` percent, the angle from 12 o'clock (clockwise) is:
  const angleDeg = (effectiveV / 100) * 360;
  // Convert to standard math angle (counter-clockwise from positive x-axis = 3 o'clock):
  // 12 o'clock = 90° in math. Clockwise from 12 by `angleDeg` = 90° - angleDeg in math coords.
  const mathAngleDeg = 90 - angleDeg;
  const mathAngleRad = mathAngleDeg * (Math.PI / 180);
  const dotX = size / 2 + radius * Math.cos(mathAngleRad);
  const dotY = size / 2 - radius * Math.sin(mathAngleRad); // -sin because SVG y is flipped

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent-foreground)" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={`stroke-muted/70 ${trackClassName ?? ""}`}
        />
        {/* Progress arc — rotated -90° around the center so it starts at 12 o'clock */}
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={gradient ? `url(#${gradId})` : "var(--primary)"}
            strokeDasharray={circumference}
            initial={animate ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </g>
        {/* Leading dot — positioned in un-rotated SVG coords so it lands at the arc's end */}
        {showLeadingDot && effectiveV > 0 && effectiveV < 100 && (
          <motion.g
            initial={animate ? { opacity: 0, scale: 0 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: `${dotX}px ${dotY}px` }}
          >
            <circle
              cx={dotX}
              cy={dotY}
              r={strokeWidth / 2 + 1.5}
              fill="var(--primary)"
              filter={`url(#${glowId})`}
            />
            <circle
              cx={dotX}
              cy={dotY}
              r={Math.max(2, strokeWidth / 2 - 1.5)}
              fill="white"
              opacity={0.9}
            />
          </motion.g>
        )}
      </svg>
      {children ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
