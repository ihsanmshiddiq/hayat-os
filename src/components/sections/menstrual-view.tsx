"use client";

import * as React from "react";
import { Flower2, CalendarDays, Plus, Check } from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateMenstrual, useMenstrual, useUpdateMenstrual } from "@/lib/hooks";

export function MenstrualView() {
  const { data } = useMenstrual(); const create = useCreateMenstrual(); const update = useUpdateMenstrual();
  const [open, setOpen] = React.useState(false); const [form, setForm] = React.useState({ startDate: new Date().toISOString().slice(0, 10), endDate: "", symptoms: "", note: "" });
  const insights = data?.insights; const logs = data?.logs ?? []; const active = logs.find((log) => !log.endDate);
  return <div><ViewHeader title="Siklus" subtitle="Catatan pribadi untuk memahami ritme tubuhmu." icon={<Flower2 className="h-5 w-5" />} action={<Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Catat siklus</Button>} />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"><SpotlightCard className="p-5" spotlightColor="#ec4899"><p className="text-xs text-muted-foreground">Prediksi berikutnya</p><p className="text-display text-xl font-semibold mt-1">{insights?.nextDate ? new Date(insights.nextDate).toLocaleDateString("id-ID", { day: "numeric", month: "long" }) : "Belum ada"}</p></SpotlightCard><SpotlightCard className="p-5" spotlightColor="#8b5cf6"><p className="text-xs text-muted-foreground">Rata-rata siklus</p><p className="text-display text-2xl font-semibold mt-1">{insights?.averageCycle ?? 28}<span className="text-sm text-muted-foreground"> hari</span></p></SpotlightCard><SpotlightCard className="p-5" spotlightColor="#f59e0b"><p className="text-xs text-muted-foreground">Rata-rata durasi</p><p className="text-display text-2xl font-semibold mt-1">{insights?.averageDuration ?? 5}<span className="text-sm text-muted-foreground"> hari</span></p></SpotlightCard></div>
    {active ? <SectionCard className="mb-6 border-rose-500/20 bg-rose-500/[0.03]"><div className="flex items-center justify-between"><div><p className="font-medium">Siklus sedang berlangsung</p><p className="text-sm text-muted-foreground">Dimulai {new Date(active.startDate).toLocaleDateString("id-ID")}</p></div><Button variant="outline" onClick={() => update.mutate({ id: active.id, body: { endDate: new Date().toISOString() } })}><Check className="h-4 w-4 mr-2" />Tandai selesai</Button></div></SectionCard> : null}
    <SectionCard><h3 className="text-display text-lg font-medium mb-4">Riwayat siklus</h3><div className="space-y-3">{logs.map((log) => <div key={log.id} className="flex items-center justify-between rounded-xl border border-border/60 p-4"><div><p className="font-medium">{new Date(log.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}{log.endDate ? ` – ${new Date(log.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}` : " · berlangsung"}</p><p className="text-xs text-muted-foreground mt-1">{[log.symptoms, log.note].filter(Boolean).join(" · ") || "Tanpa catatan"}</p></div><CalendarDays className="h-4 w-4 text-rose-400" /></div>)}{!logs.length && <p className="py-8 text-center text-sm text-muted-foreground">Belum ada siklus yang dicatat.</p>}</div></SectionCard>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Catat siklus</DialogTitle></DialogHeader><div className="space-y-3"><label className="text-sm">Tanggal mulai<Input className="mt-1" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label><label className="text-sm">Tanggal selesai (opsional)<Input className="mt-1" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label><Input value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Gejala, dipisah koma" /><Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Catatan pribadi" /><Button onClick={() => create.mutate(form, { onSuccess: () => setOpen(false) })} className="w-full">Simpan siklus</Button></div></DialogContent></Dialog>
  </div>;
}
