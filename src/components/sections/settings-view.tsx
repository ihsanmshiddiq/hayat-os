"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  MapPin,
  Clock,
  Bell,
  Palette,
  User,
  Moon,
  Sun,
  Sparkles,
  Save,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { ViewHeader } from "@/components/shared/view-header";
import { SectionCard } from "@/components/shared/section-card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { useDashboard, useSettings, useUpdateSettings } from "@/lib/hooks";
import { useMounted } from "@/hooks/use-now";
import { CALC_METHODS } from "@/lib/islamic";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { pixelCompanionEnabled, togglePixelCompanion } = useAppStore();
  const { data } = useDashboard();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const mounted = useMounted();

  const name = settings?.name ?? data?.user.name ?? "Ahmad Rahman";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  // Local form state — synced with server
  const [formName, setFormName] = React.useState(name);
  const [formLokasi, setFormLokasi] = React.useState(settings?.location ?? data?.user.location ?? "Jakarta, Indonesia");
  const [formLat, setFormLat] = React.useState(String(settings?.latitude ?? data?.user.latitude ?? -6.2088));
  const [formLng, setFormLng] = React.useState(String(settings?.longitude ?? data?.user.longitude ?? 106.8456));
  const [formMethod, setFormMethod] = React.useState(settings?.method ?? "Kemenag");
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setFormName(settings.name ?? "");
      setFormLokasi(settings.location ?? "");
      setFormLat(String(settings.latitude ?? ""));
      setFormLng(String(settings.longitude ?? ""));
      setFormMethod(settings.method ?? "Kemenag");
      setDirty(false);
    }
  }, [settings]);

  const onField = <K extends typeof formFields[number]>(setter: (v: string) => void, v: string) => {
    setter(v);
    setDirty(true);
  };
  const formFields = ["name", "location", "lat", "lng", "method"] as const;

  const save = async () => {
    const lat = parseFloat(formLat);
    const lng = parseFloat(formLng);
    if (formLat && Number.isNaN(lat)) return toast.error("Lintang harus berupa angka");
    if (formLng && Number.isNaN(lng)) return toast.error("Bujur harus berupa angka");
    updateSettings.mutate(
      { name: formName, location: formLokasi, latitude: lat, longitude: lng, method: formMethod },
      {
        onSuccess: () => {
          toast.success("Pengaturan tersimpan — waktu shalat dihitung ulang.");
          setDirty(false);
        },
        onError: () => toast.error("Could not save settings."),
      }
    );
  };

  const resetLokasi = () => {
    setFormLokasi("Jakarta, Indonesia");
    setFormLat("-6.2088");
    setFormLng("106.8456");
    setFormMethod("Kemenag");
    setDirty(true);
  };

  const [notifications, setNotifications] = React.useState(true);
  const [prayerReminders, setPrayerReminders] = React.useState(true);
  const [streakReminders, setStreakReminders] = React.useState(false);

  return (
    <div>
      <ViewHeader
        title="Pengaturan"
        subtitle="Personalisasi pengalaman Hayat. Pengaturan disimpan ke profil lokal Anda."
        icon={<SettingsIcon className="h-5 w-5" />}
        action={
          dirty ? (
            <Button onClick={save} disabled={updateSettings.isPending} size="sm" className="gap-1.5">
              {updateSettings.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Simpan perubahan
            </Button>
          ) : settings ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Semua perubahan tersimpan
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profil */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-display text-lg font-medium">Profil</h3>
          </div>
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-display text-lg font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{settings?.email ?? data?.user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nama tampilan</Label>
              <Input value={formName} onChange={(e) => onField(setFormName, e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Lokasi</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={formLokasi} onChange={(e) => onField(setFormLokasi, e.target.value)} className="pl-9" />
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <Label>Lintang</Label>
              <Input value={formLat} onChange={(e) => onField(setFormLat, e.target.value)} className="mt-1.5" inputMode="decimal" />
            </div>
            <div>
              <Label>Bujur</Label>
              <Input value={formLng} onChange={(e) => onField(setFormLng, e.target.value)} className="mt-1.5" inputMode="decimal" />
            </div>
          </div>
          <button
            onClick={resetLokasi}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Jakarta (default)
          </button>
        </SectionCard>

        {/* Tampilan */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-5">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-display text-lg font-medium">Tampilan</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">Mode terang atau gelap</p>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                <button onClick={() => setTheme("light")} className={cn("flex h-8 w-8 items-center justify-center rounded-md", mounted && theme === "light" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  <Sun className="h-4 w-4" />
                </button>
                <button onClick={() => setTheme("dark")} className={cn("flex h-8 w-8 items-center justify-center rounded-md", mounted && theme === "dark" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  <Moon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pixel Companion</p>
                <p className="text-xs text-muted-foreground">Tampilkan Nur, pendampingmu</p>
              </div>
              <Switch checked={pixelCompanionEnabled} onCheckedChange={togglePixelCompanion} />
            </div>

            <div className="rounded-xl bg-muted/40 p-3.5">
              <p className="text-xs font-medium mb-1">Preview</p>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">Primary</span>
                <span className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium">Border</span>
                <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium">Muted</span>
                <span className="text-[11px] text-primary font-semibold">{formMethod}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Prayer settings */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-display text-lg font-medium">Waktu Shalat</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Metode perhitungan</Label>
              <select
                value={formMethod}
                onChange={(e) => onField(setFormMethod, e.target.value)}
                className={cn(
                  "mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm",
                  dirty ? "border-primary/40" : "border-border"
                )}
              >
                {Object.entries(CALC_METHODS).map(([k, m]) => (
                  <option key={k} value={k}>{m.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Calculated for {formLokasi || "lokasi Anda"} ({formLat}, {formLng}).
                Saved method: <span className="font-medium text-foreground/80">{settings?.method ?? "Kemenag"}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sudut Imsak</p>
                <p className="text-sm font-medium tabular-nums">{CALC_METHODS[formMethod as keyof typeof CALC_METHODS]?.fajr ?? 20}°</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sudut Isya</p>
                <p className="text-sm font-medium tabular-nums">{CALC_METHODS[formMethod as keyof typeof CALC_METHODS]?.isha ?? 18}°</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pengingat shalat</p>
                <p className="text-xs text-muted-foreground">Notifikasi sebelum setiap waktu shalat</p>
              </div>
              <Switch checked={prayerReminders} onCheckedChange={setPrayerReminders} />
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-display text-lg font-medium">Notifikasi</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Semua notifikasi</p>
                <p className="text-xs text-muted-foreground">Sakelar utama</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pengingat streak</p>
                <p className="text-xs text-muted-foreground">Jangan putus rangkaianmu</p>
              </div>
              <Switch checked={streakReminders} onCheckedChange={setStreakReminders} />
            </div>
            <div className="rounded-xl bg-muted/40 p-3.5 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Hayat menyimpan data Anda secara lokal di perangkat ini. Ibadahmu antara kamu dan Allah.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-arabic text-lg text-muted-foreground">وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ</p>
        <p className="text-xs text-muted-foreground mt-2 italic">"And that there is not for man except that [good] for which he strives." — An-Najm 53:39</p>
      </motion.div>
    </div>
  );
}
