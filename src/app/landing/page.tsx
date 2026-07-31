"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Heart,
  Target,
  Calendar,
  Shield,
  ArrowRight,
  Star,
  Check,
  Clock,
  PenLine,
  BarChart3,
  Repeat,
  Crown,
  Gem,
  Timer,
} from "lucide-react";
import Link from "next/link";
import GlareHover from "@/components/ui/glare-hover";
import SlideTextButton from "@/components/ui/slide-text-button";
import FloatingLines from "@/components/ui/floating-lines";

const features = [
  {
    icon: BookOpen,
    title: "Al-Quran & Hifz",
    description: "Lacak bacaan dan hafalanmu. Bangun hubungan harian dengan Kitabullah.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Shalat & Doa",
    description: "Waktu shalat akurat, koleksi doa, dan pengingat untuk istiqamah.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Heart,
    title: "Doa Harian",
    description: "Koleksi doa shahih dari Al-Quran dan Sunnah untuk berbagai kesempatan.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: Target,
    title: "Kebiasaan & Tujuan",
    description: "Bangun kebaikan kecil setiap hari. Pantau progresmu menuju tujuan.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Calendar,
    title: "Kalender Islami",
    description: "Jadwal, pengingat, dan peristiwa penting dalam satu kalender.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    icon: Shield,
    title: "Privasi Terjaga",
    description: "Data tersimpan lokal di perangkatmu. Ibadahmu antara kamu dan Allah.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
];

const stats = [
  { label: "Fitur Islami", value: "15+", icon: Star },
  { label: "Doa pilihan", value: "30+", icon: Heart },
  { label: "Gratis Selamanya", value: "100%", icon: Shield },
];

const testimonials = [
  {
    text: "Hayat membantu saya konsisten shalat 5 waktu. Interface-nya indah dan mudah digunakan.",
    name: "Ahmad",
    role: "Mahasiswa",
  },
  {
    text: "Fitur Hifz Al-Quran-nya luar biasa. Saya bisa melacak progres menghafal dengan mudah.",
    name: "Fatimah",
    role: "Guru Mengaji",
  },
  {
    text: "Privasi data yang diutamakan membuat saya tenang. Semua tersimpan di perangkat saya.",
    name: "Umar",
    role: "Profesional Muda",
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <span className="text-display font-semibold text-lg">ح</span>
            </div>
            <span className="text-display text-[15px] font-semibold tracking-tight">Hayat</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Mulai Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with FloatingLines Background */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* FloatingLines Background */}
        <div className="absolute inset-0 opacity-30">
          <FloatingLines
            linesGradient={["#E945F5", "#2F4BC0", "#E945F5", "#0cf600"]}
            animationSpeed={0.5}
            interactive={false}
            bendRadius={5}
            bendStrength={-0.5}
            parallax={true}
            parallaxStrength={0.2}
          />
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-6"
            >
              <Star className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Sistem Operasi Islami</span>
            </motion.div>
            
            <h1 className="text-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
              Kehidupan Islami yang{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Terorganisir
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Satu tempat untuk shalat, Al-Quran, kebiasaan, renungan, dan tujuan.
              Bangun konsistensi ibadahmu dengan cara yang tenang dan elegan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SlideTextButton
                text="Mulai Perjalananmu"
                hoverText="Daftar Gratis →"
                href="/login"
              />
              <Link
                href="#fitur"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-16"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2 mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-display text-2xl sm:text-3xl font-semibold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section with GlareHover Cards */}
      <section id="fitur" className="py-20 sm:py-28 border-t border-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Fitur yang Lengkap
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk menjalani kehidupan Islami yang konsisten,
              tersedia dalam satu aplikasi yang indah.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <GlareHover
                  width="100%"
                  height="auto"
                  background="hsl(var(--card))"
                  borderRadius="16px"
                  borderColor="hsl(var(--border))"
                  glareColor="#ffffff"
                  glareOpacity={0.24}
                  glareAngle={-30}
                  glareSize={260}
                  transitionDuration={600}
                  playOnce={false}
                  className="!h-auto landing-feature-glare"
                >
                  <div className="p-6 text-left w-full">
                    <div className={`inline-flex items-center justify-center rounded-xl ${feature.bg} p-3 mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-display text-lg font-medium mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </GlareHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {false && <>{/* Testimonials */}
      <section className="py-20 sm:py-28 border-t border-border/60 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Dipercaya Umat
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bergabung dengan ribuan Muslim yang telah memulai perjalanan mereka.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <GlareHover
                  width="100%"
                  height="auto"
                  background="hsl(var(--card))"
                  borderRadius="16px"
                  borderColor="hsl(var(--border))"
                  glareColor="#E945F5"
                  glareOpacity={0.15}
                  glareAngle={-45}
                  glareSize={150}
                  transitionDuration={500}
                  className="!h-auto"
                >
                  <div className="p-6 text-left w-full">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">{t.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </GlareHover>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      </>}

      {/* Quran Quote with GlareHover */}
      <section className="py-20 sm:py-28 border-t border-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <GlareHover
              width="100%"
              height="auto"
              background="hsl(var(--primary) / 0.05)"
              borderRadius="24px"
              borderColor="hsl(var(--primary) / 0.2)"
              glareColor="#E945F5"
              glareOpacity={0.2}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              className="!h-auto"
            >
              <div className="p-12 sm:p-16 text-center w-full">
                <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-6">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <p className="text-arabic text-3xl sm:text-4xl text-primary mb-6 leading-relaxed">
                  وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ
                </p>
                <p className="text-lg text-muted-foreground italic mb-4">
                  &ldquo;Dan bahwa manusia hanya memperoleh apa yang telah ia usahakan.&rdquo;
                </p>
                <p className="text-sm text-muted-foreground/70">— An-Najm 53:39</p>
              </div>
            </GlareHover>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with FloatingLines */}
      <section className="relative py-20 sm:py-28 border-t border-border/60 overflow-hidden">
        {/* FloatingLines Background */}
        <div className="absolute inset-0 opacity-20">
          <FloatingLines
            linesGradient={["#2F4BC0", "#E945F5", "#0cf600", "#2F4BC0"]}
            animationSpeed={0.3}
            interactive={false}
            bendRadius={8}
            bendStrength={-0.3}
            parallax={true}
            parallaxStrength={0.15}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/80" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Mulai Hari Ini
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Gratis, privat, dan selamanya. Data kamu tersimpan di perangkatmu.
            </p>
            <div className="flex justify-center">
              <SlideTextButton
                text="Daftar dengan Google"
                hoverText="Mulai Sekarang →"
                href="/login"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-display font-semibold text-sm">ح</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Hayat. Dibuat dengan ❤️ untuk umat.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-foreground transition-colors">Syarat Penggunaan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
