"use client";

import { Flower2, Construction } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";

export function MenstrualView() {
  return (
    <div>
      <ViewHeader
        title="Siklus"
        subtitle="Pelacak siklus menstruasi."
        icon={<Flower2 className="h-5 w-5" />}
      />
      <SectionCard className="flex flex-col items-center justify-center py-16">
        <Construction className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-display text-lg font-medium">Segera Hadir</p>
        <p className="text-sm text-muted-foreground mt-1">Fitur siklus sedang dalam pengembangan.</p>
      </SectionCard>
    </div>
  );
}
