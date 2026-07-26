"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  padded?: boolean;
}

/** Consistent premium card used across the dashboard sections. */
export const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ children, className, interactive, padded = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-border/70 bg-card text-card-foreground shadow-soft",
          "transition-all duration-300",
          interactive &&
            "hover:shadow-premium hover:-translate-y-0.5 hover:border-border",
          padded && "p-5 sm:p-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SectionCard.displayName = "SectionCard";

export function SectionHeader({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-display text-lg font-medium tracking-tight truncate">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="text-display text-base font-medium">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
