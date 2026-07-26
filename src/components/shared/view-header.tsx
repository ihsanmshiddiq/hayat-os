"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function ViewHeader({
  title,
  subtitle,
  icon,
  action,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start justify-between gap-4 mb-6 sm:mb-8"
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-display text-2xl sm:text-3xl font-medium tracking-tight flex items-center gap-3">
            {title}
            {badge}
          </h1>
          {subtitle ? (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </motion.div>
  );
}
