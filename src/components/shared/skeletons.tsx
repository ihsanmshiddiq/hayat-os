"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-10 shadow-soft">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-card p-6 shadow-soft space-y-4", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}
