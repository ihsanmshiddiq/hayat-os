"use client";

import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { useAppStore } from "@/lib/store";
import { Search, Moon, Sun, CornerDownLeft, HandHeart, Gem, BookMarked, Timer, ScrollText, Compass } from "lucide-react";
import { useTheme } from "next-themes";
import { useDashboard } from "@/lib/hooks";
import { SURAHS, ASMA_UL_HUSNA, getNameOfDay, QURAN_SURAHS } from "@/lib/islamic";
import { DUAS } from "@/lib/duas";

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setActiveView } = useAppStore();
  const { setTheme, theme } = useTheme();
  const { data } = useDashboard();


  // Global hotkey
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandOpen]);

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Cari bagian, surah, tindakan…" />
      <CommandList>
        <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.key}
                value={`${item.label} ${item.description}`}
                onSelect={() => {
                  setActiveView(item.key);
                  setCommandOpen(false);
                }}
                className="gap-3"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.description}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tindakan Cepat">
          <CommandItem
            value="toggle dark light theme"
            onSelect={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setCommandOpen(false);
            }}
            className="gap-3"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Ganti ke mode {theme === "dark" ? "terang" : "gelap"}
          </CommandItem>
          <CommandItem
            value="new journal entry today write reflection"
            onSelect={() => { setActiveView("jurnal"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Search className="h-4 w-4" />
            Buka jurnal hari ini
          </CommandItem>
          <CommandItem
            value="add new habit"
            onSelect={() => { setActiveView("kebiasaan"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Search className="h-4 w-4" />
            Tambah kebiasaan baru
          </CommandItem>
          <CommandItem
            value="add new note"
            onSelect={() => { setActiveView("catatan"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Search className="h-4 w-4" />
            Tambah catatan baru
          </CommandItem>

          <CommandItem
            value="start khatma quran reading plan"
            onSelect={() => { setActiveView("khatma"); setCommandOpen(false); }}
            className="gap-3"
          >
            <ScrollText className="h-4 w-4" />
            Mulai rencana Khatma Quran
          </CommandItem>
          <CommandItem
            value="find qibla direction kaaba mecca"
            onSelect={() => { setActiveView("shalat"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Compass className="h-4 w-4" />
            Cari arah Kiblat
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {data && (
          <CommandGroup heading="Today">
            <CommandItem
              value={`focus ${data.today.focus}`}
              onSelect={() => { setActiveView("dashboard"); setCommandOpen(false); }}
              className="gap-3"
            >
              <CornerDownLeft className="h-4 w-4 text-primary" />
              Fokus hari ini: {data.today.focus}
            </CommandItem>
            <CommandItem
              value={`streak ${data.today.streak} days`}
              onSelect={() => { setActiveView("analitik"); setCommandOpen(false); }}
              className="gap-3"
            >
              <CornerDownLeft className="h-4 w-4 text-primary" />
              Streak: {data.today.streak} hari
            </CommandItem>
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Quran — jump to surah">
          {SURAHS.slice(0, 8).map((s) => (
            <CommandItem
              key={s.number}
              value={`${s.name} ${s.english} ${s.number}`}
              onSelect={() => { setActiveView("quran"); setCommandOpen(false); }}
              className="gap-3"
            >
              <span className="text-arabic text-base text-primary">{s.arabic}</span>
              <span className="font-medium">{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.ayahs} ayahs</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Duas — by occasion">
          {DUAS.slice(0, 6).map((d) => (
            <CommandItem
              key={d.id}
              value={`dua ${d.title} ${d.translation}`}
              onSelect={() => { setActiveView("doa"); setCommandOpen(false); }}
              className="gap-3"
            >
              <HandHeart className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{d.title}</span>
              <span className="ml-auto text-xs text-muted-foreground truncate max-w-[160px]">{d.reference}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="99 Names — jump to">
          <CommandItem
            value="name of the day asma ul husna"
            onSelect={() => { setActiveView("asma"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Gem className="h-4 w-4 text-primary" />
            <span className="font-medium">Nama Hari Ini</span>
            <span className="ml-auto text-xs text-muted-foreground">{getNameOfDay().translit}</span>
          </CommandItem>
          {ASMA_UL_HUSNA.slice(0, 10).map((n) => (
            <CommandItem
              key={n.number}
              value={`name ${n.translit} ${n.meaning} ${n.arabic} allah`}
              onSelect={() => { setActiveView("asma"); setCommandOpen(false); }}
              className="gap-3"
            >
              <span className="text-arabic text-base text-primary">{n.arabic}</span>
              <span className="font-medium">{n.translit}</span>
              <span className="ml-auto text-xs text-muted-foreground truncate max-w-[160px]">{n.meaning}</span>
            </CommandItem>
          ))}
        </CommandGroup>        <CommandSeparator />

        <CommandGroup heading="Hifz — jump to surah">
          {QURAN_SURAHS.slice(0, 12).map((s) => (
            <CommandItem
              key={s.number}
              value={`hifz ${s.name} ${s.arabic} ${s.english} surah ${s.number}`}
              onSelect={() => { setActiveView("hifz"); setCommandOpen(false); }}
              className="gap-3"
            >
              <BookMarked className="h-4 w-4 text-muted-foreground" />
              <span className="text-arabic text-base text-primary">{s.arabic}</span>
              <span className="font-medium">{s.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">{s.ayahs} ayahs</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Fokus">
          <CommandItem
            value="focus pomodoro deep work study timer"
            onSelect={() => { setActiveView("fokus"); setCommandOpen(false); }}
            className="gap-3"
          >
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Mulai Sesi Fokus</span>
            <span className="ml-auto text-xs text-muted-foreground">Kerja dalam dengan niat</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
