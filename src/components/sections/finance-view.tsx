"use client";

import { Wallet, Construction } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";

export function FinanceView() {
  return (
    <div>
      <ViewHeader
        title="Keuangan"
        subtitle="Pantau pemasukan & pengeluaranmu."
        icon={<Wallet className="h-5 w-5" />}
      />
      <SectionCard className="flex flex-col items-center justify-center py-16">
        <Construction className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-display text-lg font-medium">Segera Hadir</p>
        <p className="text-sm text-muted-foreground mt-1">Fitur keuangan sedang dalam pengembangan.</p>
      </SectionCard>
    </div>
  );
}
