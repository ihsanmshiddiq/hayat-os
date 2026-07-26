#!/bin/bash
DIR="src/components/sections"

# ========== khatma-view.tsx ==========
sed -i 's/Set a Quran reading goal. Build a daily habit that completes the Book of Allah./Tetapkan target baca Al-Quran. Bangun kebiasaan harian yang menyelesaikan Kitabullah./g' $DIR/khatma-view.tsx
sed -i 's/Begin Your Khatma Journey/Mulai Perjalanan Khatma/g' $DIR/khatma-view.tsx
sed -i 's/Full Quran/Al-Quran Penuh/g' $DIR/khatma-view.tsx
sed -i 's/All 604 pages, complete Khatma/Semua 604 halaman, Khatma lengkap/g' $DIR/khatma-view.tsx
sed -i 's/Last 30 Pages/30 Halaman Terakhir/g' $DIR/khatma-view.tsx
sed -i 's/Final stretch of the Quran/Tahap akhir Al-Quran/g' $DIR/khatma-view.tsx
sed -i 's/First 5 Juz/5 Juz Pertama/g' $DIR/khatma-view.tsx
sed -i 's/From Al-Fatihah to An-Nisa/Dari Al-Fatihah sampai An-Nisa/g' $DIR/khatma-view.tsx
sed -i 's/Set a goal/Tetapkan target/g' $DIR/khatma-view.tsx
sed -i 's/Track daily pace/Lacak kecepatan harian/g' $DIR/khatma-view.tsx
sed -i 's/Complete with barakah/Selesaikan dengan barakah/g' $DIR/khatma-view.tsx
sed -i "s/Today's target/Target hari ini/g" $DIR/khatma-view.tsx
sed -i 's/Avg pace/Rata-rata/g' $DIR/khatma-view.tsx
sed -i 's/Days left/Hari tersisa/g' $DIR/khatma-view.tsx
sed -i 's/Projected end/Perkiraan selesai/g' $DIR/khatma-view.tsx
sed -i 's/Overall progress/Progres keseluruhan/g' $DIR/khatma-view.tsx
sed -i 's/New plan/Rencana baru/g' $DIR/khatma-view.tsx
sed -i 's/Create your first Khatma/Buat Khatma pertamamu/g' $DIR/khatma-view.tsx
sed -i 's/On pace/Tepat waktu/g' $DIR/khatma-view.tsx
sed -i 's/Catch up/Kejar/g' $DIR/khatma-view.tsx
sed -i 's/Plan History/Riwayat Rencana/g' $DIR/khatma-view.tsx

# ========== journal-view.tsx ==========
sed -i 's/title="Journal"/title="Jurnal"/g' $DIR/journal-view.tsx
sed -i 's/Gratitude journal/Rasa syukur/g' $DIR/journal-view.tsx

# ========== habits-view.tsx ==========
sed -i 's/title="Habits"/title="Kebiasaan"/g' $DIR/habits-view.tsx
sed -i 's/Small actions, repeated daily, become who you are./Tindakan kecil, diulang setiap hari, membentuk dirimu./g' $DIR/habits-view.tsx
sed -i 's/New habit/Kebiasaan baru/g' $DIR/habits-view.tsx
sed -i 's/Create a habit/Buat kebiasaan/g' $DIR/habits-view.tsx
sed -i 's/Habit name/Nama kebiasaan/g' $DIR/habits-view.tsx
sed -i 's/Cue (when)/Pemicu (kapan)/g' $DIR/habits-view.tsx
sed -i 's/Create habit/Buat kebiasaan/g' $DIR/habits-view.tsx
sed -i 's/All (/Semua (/g' $DIR/habits-view.tsx
sed -i 's/No habits yet/Belum ada kebiasaan/g' $DIR/habits-view.tsx
sed -i 's/Start with one small consistent action./Mulai dengan satu tindakan konsisten kecil./g' $DIR/habits-view.tsx
sed -i 's/90-Day Consistency/Konsistensi 90 Hari/g' $DIR/habits-view.tsx
sed -i 's/Best day/Hari terbaik/g' $DIR/habits-view.tsx
sed -i 's/Done/Selesai/g' $DIR/habits-view.tsx
sed -i 's/Mark done/Tandai selesai/g' $DIR/habits-view.tsx
sed -i 's/this week/minggu ini/g' $DIR/habits-view.tsx

# ========== calendar-view.tsx ==========
sed -i 's/title="Calendar"/title="Kalender"/g' $DIR/calendar-view.tsx
sed -i 's/Add event/Tambah acara/g' $DIR/calendar-view.tsx
sed -i 's/Reminder/Pengingat/g' $DIR/calendar-view.tsx
sed -i 's/Fasting/Puasa/g' $DIR/calendar-view.tsx
sed -i 's/Islamic event/Peristiwa Islami/g' $DIR/calendar-view.tsx
sed -i 's/Goal/Target/g' $DIR/calendar-view.tsx
sed -i 's/Title/Judul/g' $DIR/calendar-view.tsx
sed -i 's/Time/Waktu/g' $DIR/calendar-view.tsx
sed -i 's/Type/Jenis/g' $DIR/calendar-view.tsx
sed -i 's/Note/Catatan/g' $DIR/calendar-view.tsx
sed -i 's/Today/Hari ini/g' $DIR/calendar-view.tsx
sed -i 's/Select a day/Pilih hari/g' $DIR/calendar-view.tsx
sed -i 's/Click any date/Klik tanggal apa saja/g' $DIR/calendar-view.tsx
sed -i 's/Prayer Times/Waktu Shalat/g' $DIR/calendar-view.tsx
sed -i 's/Sunnah Fast/Puasa Sunnah/g' $DIR/calendar-view.tsx
sed -i 's/Events/Acara/g' $DIR/calendar-view.tsx
sed -i 's/No events this day/Tidak ada acara hari ini/g' $DIR/calendar-view.tsx
sed -i 's/Upcoming Islamic Days/Hari Islami Mendatang/g' $DIR/calendar-view.tsx

# ========== notes-view.tsx ==========
sed -i 's/title="Notes"/title="Catatan"/g' $DIR/notes-view.tsx
sed -i 's/New note/Catatan baru/g' $DIR/notes-view.tsx
sed -i 's/Search notes…/Cari catatan…/g' $DIR/notes-view.tsx
sed -i 's/Folders/Folder/g' $DIR/notes-view.tsx
sed -i 's/No notes found./Catatan tidak ditemukan./g' $DIR/notes-view.tsx
sed -i 's/Select a note or create a new one./Pilih catatan atau buat baru./g' $DIR/notes-view.tsx
sed -i 's/Untitled note/Catatan tanpa judul/g' $DIR/notes-view.tsx
sed -i 's/Empty note/Catatan kosong/g' $DIR/notes-view.tsx

# ========== goals-view.tsx ==========
sed -i 's/title="Goals"/title="Tujuan"/g' $DIR/goals-view.tsx
sed -i 's/New goal/Tujuan baru/g' $DIR/goals-view.tsx
sed -i 's/Create a goal/Buat tujuan/g' $DIR/goals-view.tsx
sed -i 's/Goal title/Judul tujuan/g' $DIR/goals-view.tsx
sed -i 's/Create goal/Buat tujuan/g' $DIR/goals-view.tsx
sed -i 's/No goals yet/Belum ada tujuan/g' $DIR/goals-view.tsx
sed -i 's/Active/Aktif/g' $DIR/goals-view.tsx
sed -i 's/Knowledge/Pengetahuan/g' $DIR/goals-view.tsx
sed -i 's/Health/Kesehatan/g' $DIR/goals-view.tsx
sed -i 's/Wealth/Keuangan/g' $DIR/goals-view.tsx
sed -i 's/Relationships/Relasi/g' $DIR/goals-view.tsx

# ========== achievements-view.tsx ==========
sed -i 's/title="Achievements"/title="Pencapaian"/g' $DIR/achievements-view.tsx
sed -i 's/Unlocked/Terbuka/g' $DIR/achievements-view.tsx
sed -i 's/Prayer streak/Runtutan shalat/g' $DIR/achievements-view.tsx
sed -i 's/Quran pages/Halaman Quran/g' $DIR/achievements-view.tsx
sed -i 's/Dhikr counts/Jumlah dzikir/g' $DIR/achievements-view.tsx
sed -i 's/Prayer/Shalat/g' $DIR/achievements-view.tsx
sed -i 's/Habits/Kebiasaan/g' $DIR/achievements-view.tsx
sed -i 's/Journal/Jurnal/g' $DIR/achievements-view.tsx
sed -i 's/Streaks/Runtutan/g' $DIR/achievements-view.tsx
sed -i 's/Special/Istimewa/g' $DIR/achievements-view.tsx

# ========== analytics-view.tsx ==========
sed -i 's/title="Analytics"/title="Analitik"/g' $DIR/analytics-view.tsx
sed -i 's/Prayer consistency/Konsistensi shalat/g' $DIR/analytics-view.tsx
sed -i 's/Quran days/Hari baca Quran/g' $DIR/analytics-view.tsx
sed -i 's/Habit completion/Penyelesaian kebiasaan/g' $DIR/analytics-view.tsx
sed -i 's/Current streak/Runtutan saat ini/g' $DIR/analytics-view.tsx
sed -i 's/Prayer Consistency/Konsistensi Shalat/g' $DIR/analytics-view.tsx
sed -i 's/Daily prayers completed (of 5)/Shalat harian selesai (dari 5)/g' $DIR/analytics-view.tsx
sed -i 's/Quran Reading/Bacaan Al-Quran/g' $DIR/analytics-view.tsx
sed -i 's/Habit Consistency/Konsistensi Kebiasaan/g' $DIR/analytics-view.tsx
sed -i 's/Sunnah Trend/Tren Sunnah/g' $DIR/analytics-view.tsx

# ========== focus-view.tsx ==========
sed -i 's/title="Focus"/title="Fokus"/g' $DIR/focus-view.tsx
sed -i 's/Deep work, with intention. Take mindful breaks infused with dhikr./Kerja dalam dengan niat. Istirahat penuh kesadaran dengan dzikir./g' $DIR/focus-view.tsx
sed -i "s/Today's sessions/Sesi hari ini/g" $DIR/focus-view.tsx
sed -i 's/Your focus/Fokusmu/g' $DIR/focus-view.tsx
sed -i 's/No sessions yet today./Belum ada sesi hari ini./g' $DIR/focus-view.tsx
sed -i 's/Begin Focus/Mulai Fokus/g' $DIR/focus-view.tsx
sed -i 's/Pause/Jeda/g' $DIR/focus-view.tsx
sed -i 's/Resume/Lanjutkan/g' $DIR/focus-view.tsx
sed -i 's/Stop/Berhenti/g' $DIR/focus-view.tsx
sed -i 's/Break activity/Aktivitas istirahat/g' $DIR/focus-view.tsx
sed -i 's/Intention (niyyah)/Niat/g' $DIR/focus-view.tsx
sed -i 's/What will you focus on?/Apa yang akan kamu fokuskan?/g' $DIR/focus-view.tsx
sed -i 's/Quick presets/Preset cepat/g' $DIR/focus-view.tsx
sed -i 's/Break:/Istirahat:/g' $DIR/focus-view.tsx
sed -i 's/remaining/tersisa/g' $DIR/focus-view.tsx
sed -i 's/Break/Istirahat/g' $DIR/focus-view.tsx
sed -i 's/Ready/Siap/g' $DIR/focus-view.tsx
sed -i 's/14-day focus trend/Tren fokus 14 hari/g' $DIR/focus-view.tsx
sed -i 's/Suggested intentions/Niat yang disarankan/g' $DIR/focus-view.tsx
sed -i 's/day streak/hari berturut-turut/g' $DIR/focus-view.tsx

# ========== settings-view.tsx ==========
sed -i 's/title="Settings"/title="Pengaturan"/g' $DIR/settings-view.tsx
sed -i 's/Save changes/Simpan perubahan/g' $DIR/settings-view.tsx
sed -i 's/All changes saved/Semua perubahan tersimpan/g' $DIR/settings-view.tsx
sed -i 's/Profile/Profil/g' $DIR/settings-view.tsx
sed -i 's/Display name/Nama tampilan/g' $DIR/settings-view.tsx
sed -i 's/Location/Lokasi/g' $DIR/settings-view.tsx
sed -i 's/Latitude/Lintang/g' $DIR/settings-view.tsx
sed -i 's/Longitude/Bujur/g' $DIR/settings-view.tsx
sed -i 's/Appearance/Tampilan/g' $DIR/settings-view.tsx
sed -i 's/Theme/Tema/g' $DIR/settings-view.tsx

echo "=== ALL TRANSLATIONS DONE ==="
