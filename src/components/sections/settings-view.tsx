"use client";

import * as React from "react";
import { Bell, Check, Clock, Loader2, Moon, Palette, Save, Settings as SettingsIcon, Sparkles, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboard, useSettings, useUpdateSettings } from "@/lib/hooks";
import { useMounted } from "@/hooks/use-now";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getSpecialProfile } from "@/lib/easter-egg";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { data } = useDashboard();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const mounted = useMounted();
  const name = settings?.name ?? data?.user.name ?? "Anda";
  const email = settings?.email ?? data?.user.email ?? "";
  const specialProfile = getSpecialProfile(name, email);
  const [formName, setFormName] = React.useState(name);
  const [dirty, setDirty] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [prayerReminders, setPrayerReminders] = React.useState(true);
  const [streakReminders, setStreakReminders] = React.useState(false);

  React.useEffect(() => {
    if (settings?.name) { setFormName(settings.name); setDirty(false); }
  }, [settings?.name]);

  const save = () => updateSettings.mutate({ name: formName.trim() }, {
    onSuccess: () => { toast.success("Pengaturan tersimpan."); setDirty(false); },
    onError: () => toast.error("Pengaturan gagal disimpan. Pastikan database sudah tersambung."),
  });

  return <div>
    <ViewHeader title="Pengaturan" subtitle="Personalisasi pengalaman Hayat." icon={<SettingsIcon className="h-5 w-5" />} action={dirty ? <Button onClick={save} disabled={updateSettings.isPending} size="sm" className="gap-1.5">{updateSettings.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Simpan perubahan</Button> : settings ? <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-3.5 w-3.5" />Tersimpan</span> : null} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SectionCard>
        <div className="flex items-center gap-2 mb-5"><User className="h-4 w-4 text-muted-foreground" /><h3 className="text-display text-lg font-medium">Profil</h3></div>
        <div className="flex items-center gap-4 mb-5"><Avatar className="h-16 w-16 border-2 border-border"><AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">{name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</AvatarFallback></Avatar><div><p className="text-display text-lg font-medium">{name}</p><p className="text-sm text-muted-foreground">{email}</p>{specialProfile ? <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"><Sparkles className="h-3 w-3" />{specialProfile.title}</span> : null}</div></div>
        <Label>Nama tampilan</Label><Input value={formName} onChange={(event) => { setFormName(event.target.value); setDirty(true); }} className="mt-1.5" />
        <p className="mt-2 text-xs text-muted-foreground">Email akun mengikuti akun Supabase yang sedang masuk.</p>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center gap-2 mb-5"><Palette className="h-4 w-4 text-muted-foreground" /><h3 className="text-display text-lg font-medium">Tampilan</h3></div>
        <div className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Tema</p><p className="text-xs text-muted-foreground">Mode terang atau gelap</p></div><div className="flex items-center gap-1 rounded-lg border border-border p-1"><button onClick={() => setTheme("light")} className={cn("flex h-8 w-8 items-center justify-center rounded-md", mounted && theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><Sun className="h-4 w-4" /></button><button onClick={() => setTheme("dark")} className={cn("flex h-8 w-8 items-center justify-center rounded-md", mounted && theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}><Moon className="h-4 w-4" /></button></div></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Pelacak siklus</p><p className="text-xs text-muted-foreground">Tampilkan Siklus di navigasi pribadi</p></div><Switch checked={settings?.menstrualEnabled ?? false} onCheckedChange={(menstrualEnabled) => updateSettings.mutate({ menstrualEnabled })} /></div>
          <div className="rounded-xl bg-muted/40 p-3.5"><p className="text-xs font-medium mb-1">Bahasa</p><p className="text-xs text-muted-foreground">Hayat menggunakan Bahasa Indonesia sebagai bahasa utama.</p></div>
        </div>
      </SectionCard>

      <SectionCard><div className="flex items-center gap-2 mb-5"><Clock className="h-4 w-4 text-muted-foreground" /><h3 className="text-display text-lg font-medium">Waktu Shalat</h3></div><div className="space-y-3"><div className="rounded-xl border border-border/60 p-4"><p className="text-sm font-medium">Mode otomatis</p><p className="text-xs text-muted-foreground mt-1">Hayat menghitung waktu shalat dari lokasi perangkat saat tersedia. Jika lokasi tidak tersedia, gunakan jadwal default Jakarta.</p></div><div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4"><p className="text-sm font-medium text-primary">Mode manual segera tersedia</p><p className="text-xs text-muted-foreground mt-1">Anda tetap dapat mengatur pengingat dari perangkat tanpa mengubah data profil.</p></div><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Pengingat shalat</p><p className="text-xs text-muted-foreground">Notifikasi sebelum setiap waktu shalat</p></div><Switch checked={prayerReminders} onCheckedChange={setPrayerReminders} /></div></div></SectionCard>

      <SectionCard><div className="flex items-center gap-2 mb-5"><Bell className="h-4 w-4 text-muted-foreground" /><h3 className="text-display text-lg font-medium">Notifikasi</h3></div><div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Semua notifikasi</p><p className="text-xs text-muted-foreground">Sakelar utama</p></div><Switch checked={notifications} onCheckedChange={setNotifications} /></div><div className="flex items-center justify-between"><div><p className="text-sm font-medium">Pengingat runtutan</p><p className="text-xs text-muted-foreground">Jangan putus rangkaianmu</p></div><Switch checked={streakReminders} onCheckedChange={setStreakReminders} /></div><div className="rounded-xl bg-muted/40 p-3.5 flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><p className="text-xs text-muted-foreground">Data ibadahmu tetap antara kamu dan Allah.</p></div></div></SectionCard>
    </div>
  </div>;
}
