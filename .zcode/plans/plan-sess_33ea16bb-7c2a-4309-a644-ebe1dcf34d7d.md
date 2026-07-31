# Rencana Implementasi: Polish & Lengkapi Hayat — Islamic Life OS

## Konteks & Temuan Kunci

**Codebase sudah matang.** Stack: Next.js 16 (App Router), React 19, Tailwind v4 + shadcn/ui, Framer Motion, Recharts, Zustand (nav), React Query (data), Supabase+Prisma. **Dark mode, responsif, dan bottom nav mobile — 3 prioritas Anda — SUDAH ADA dan berfungsi.** Glassmorphism (`.glass`, `.glass-strong`), `SectionCard`, `ProgressRing`, `AnimatedNumber`, `IslamicGeometricPattern` reusable siap pakai.

**Yang sudah ada & berfungsi** (17 view): Dashboard, Kalender, Jurnal, Kebiasaan, Quran-view, Khatma, Hifz, Shalat, Dzikir, Doa, Asma, Catatan, Tujuan, Fokus, Pencapaian, Analitik, Pengaturan.

**Keputusan dari Q&A Anda:**
- Data per-user: **polish UI dulu**, perbaiki isolasi data (auth↔data) di fase akhir
- Quran/tilawah: **gabung ke Khatma**, hapus Quran-view terpisah
- Dzikir & 99 Asma: **dibuang** dari nav & codebase
- Finance: ada referensi lengkap (lifeos-1n1x) — saldo, kategori, donut+bar+line chart, budget, transaksi
- Siklus menstruasi: **dibuat, gated by Settings toggle** (tidak ada di referensi Arcada → rancang dari PRD)
- Easter egg: **penuh sesuai PRD** (animasi + badge + widget tersembunyi untuk "Ihsan Muhammad Shidiq" / "Tantri Nuraeni")
- Pengiriman: **bertahap per fase**, preview tiap fase untuk koreksi
- Bahasa: Indonesia utama, istilah Arab/Inggris umum dipertahankan; yang sebaiknya Inggris boleh Inggris

**Catatan teknis:** semua API route pakai `ensureSeedData()` → saat ini single-user demo (akan diperbaiki di Fase 6). Tailwind v4 → edit `globals.css`, bukan `tailwind.config.ts`.

---

## FASE 1 — Fondasi & Pembersihan (cleanup + struktur nav final)
> Tujuan: nav & struktur sesuai daftar fitur final Anda, tanpa fitur mati.

1. **Definisikan ViewKey & nav final** di `src/lib/store.ts` + `src/components/layout/sidebar.tsx` + `bottom-nav.tsx`. Daftar final 14 view:
   - **Ringkasan:** Dashboard, Kalender, Jurnal, Kebiasaan
   - **Ibadah:** Khatma (gabung tilawah), Hifz, Shalat, Doa
   - **Sistem:** Catatan, Tujuan, Fokus, Keuangan, Siklus, Pencapaian, Analitik, Pengaturan
2. **Hapus Dzikir & 99 Asma** dari `ViewKey`, nav, `app-shell.tsx` render switch, file `dhikr-view.tsx`, `asma-view.tsx`, API `dhikr/route.ts`, dan referensinya dari achievements/analytics (ganti category `dhikr` di `islamic.ts`).
3. **Hapus Quran-view terpisah** dari nav (logika tilawah dipindahkan ke Khatma di Fase 3). Pertahankan API `quran/route.ts` (data dipakai Khatma).
4. **Hapus komponen `qibla-compass`** (`src/components/salah/qibla-compass.tsx`) & referensinya — sesuai "tidak ada fitur Kiblat di mana pun".
5. **Tambah view key baru:** `keuangan` (Finance) & `siklus` (Menstrual). Stub kosong dulu, diisi di Fase 4.
6. Bersihkan sisa NextAuth (`.env.example` misleading, folder `[...nextauth]` kosong, dep `next-auth`).
7. **Preview Fase 1** → koreksi.

## FASE 2 — Polish 6 Halaman Utama (fokus permintaan eksplisit Anda)
> Halaman yang Anda sebut: Doa, Catatan, Fokus, Tujuan, Pencapaian, Analitik.

1. **Doa** (`duas-view.tsx` + `lib/duas.ts`): kurangi kategori dari 10 → ~5 inti (Morning & Evening, After Prayer, Before Sleep, Distress & Forgiveness, Gratitude & Protection). Konsolidasikan doa ke kategori yang tersisa. Polish kartu & modal.
2. **Catatan** (`notes-view.tsx`): perbaiki "popup catatan baru" — saat ini create langsung inline; ganti dengan **dialog/modal "Catatan Baru"** (judul, folder, tag, konten) sebelum simpan, bukan auto-create empty note. Tingkatkan editor (toolbar markdown sederhana, preview toggle).
3. **Fokus** (`focus-view.tsx`): niat yang disarankan → sediakan **opsi "Tulis niat sendiri"** (input teks bebas) di samping `FOCUS_INTENTIONS` preset. Polish tampilan mode/break/intention.
4. **Tujuan** (`goals-view.tsx`): tambah milestones checklist, kategori, progress bar otomatis dari milestone, filter aktif/selesai, visual lebih kaya.
5. **Pencapaian** (`achievements-view.tsx`): sudah bagus, polish + tambah **level/XP total** di header, perbaiki setelah Dzikir dihapus.
6. **Analitik** (`analytics-view.tsx`): tambah **Kalender Kontribusi (heatmap 26 minggu gaya bklit)** + grid konsistensi seperti referensi Statistik Arcada. Pertahankan chart yang ada.
7. **Preview Fase 2** → koreksi.

## FASE 3 — Khatma Terpadu (gabung tilawah + rencana khatam)
1. Di `khatma-view.tsx`, tambahkan **tab "Tilawah"** (log halaman/ayat dibaca hari ini + bookmark) dari logika `quran-view.tsx`, dan **tab "Rencana Khatma"** (yang sudah ada). Tanpa menampilkan teks Quran.
2. Pindahkan bookmark state & hooks (`useUpdateQuran`) ke Khatma. Hapus `quran-view.tsx` setelah migrasi selesai.
3. Progress ring bacaan + sisa hari khatma + riwayat + streak dalam satu halaman kohesif.
4. **Preview Fase 3** → koreksi.

## FASE 4 — Fitur Baru: Keuangan & Siklus
1. **Keuangan** (view `keuangan`, model baru di `schema.prisma`: `FinanceTransaction` {amount, type: income/expense, category, note, date}, `Budget` {category, monthlyLimit}). API route `finance/route.ts`. UI mengikuti referensi lifeos-1n1x: kartu Total Saldo/Pemasukan/Pengeluaran/Cashflow, filter waktu, filter kategori, **donut "Pengeluaran per Kategori"** (Recharts PieChart), **bar "Perbandingan In/Out"**, **line "Tren Cashflow"**, Budget bulanan, list Transaksi Terakhir. Tombol "Tambah Transaksi" via modal.
2. **Siklus** (view `siklus`, model `MenstrualLog` {startDate, endDate, symptoms, note}). API `menstrual/route.ts`. UI dari PRD: log mulai/selesai, prediksi siklus berikutnya, rata-rata durasi, riwayat, overlay warna di kalender (integrasi dengan calendar-view). Default **tersembunyi**, muncul di nav hanya jika diaktifkan via toggle di Settings.
3. **Preview Fase 4** → koreksi.

## FASE 5 — Easter Egg & Landing Polish
1. **Easter egg**: deteksi display name "Ihsan Muhammad Shidiq" / "Tantri Nuraeni" di Settings → (a) animasi sambutan khusus sekali per session, (b) badge profil unik per nama, (c) widget dashboard tersembunyi khusus (mis. kartu "spesial" yang hanya muncul untuk nama tersebut). Implementasi client-side, idempotent.
2. **Landing polish** (`landing/page.tsx`): rapikan 4 section sesuai PRD (Hero, Fitur grid animasi, Quote ayat, CTA penutup), polish navbar transparan, hilangkan section yang tidak perlu.
3. **Preview Fase 5** → koreksi.

## FASE 6 — Isolasi Data Per-User & Final QA
1. **Hubungkan auth Supabase ↔ data**: ganti `ensureSeedData()` di semua API route → baca user Supabase via server client (`supabase.auth.getUser()`), cari/buat record `User` Prisma berdasarkan uid/email Supabase. Update `seed.ts` untuk seeding per-user baru (bukan global).
2. Pastikan RLS/scope data per `userId` di semua query.
3. Perbaiki `.env.example` (Supabase vars benar).
4. Final QA: responsif mobile, dark mode konsisten, bottom nav, navigasi semua view berfungsi.
5. **Preview Fase 6** → koreksi final.

---

## Catatan Implementasi
- **Pola view baru:** tambah ke `ViewKey` (`store.ts`) + `case` di `app-shell.tsx` render switch + item di `sidebar.tsx`.
- **Style:** edit `globals.css` (Tailwind v4), pakai `SectionCard`/`ProgressRing`/`AnimatedNumber` yang ada untuk konsistensi, jangan buat kartu ad-hoc.
- **Data:** ikuti pola React Query hook di `lib/hooks.ts` + API route Prisma.
- **Saya tidak akan commit/push** kecuali Anda minta.
- **Tidak ada fitur Kiblat** di mana pun (sudah diverifikasi tidak ada di nav, sisakan komponen akan dihapus di Fase 1).
- **Bahasa:** Indonesia utama; label teknis boleh Inggris.

## Alur Kerja
Setelah persetujuan, saya kerjakan **Fase 1 dulu**, lalu kirim preview (instruksi build/run + ringkasan perubahan) untuk Anda koreksi sebelum lanjut Fase 2, dan seterusnya.