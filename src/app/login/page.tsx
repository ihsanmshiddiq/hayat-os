"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, Send } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// Prevent prerender - Supabase env vars may not be available at build time
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [emailLoading, setEmailLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  React.useEffect(() => {
    setMounted(true);
    if (new URLSearchParams(window.location.search).get("error")) setError("Sesi masuk tidak dapat diselesaikan. Silakan coba lagi.");
  }, []);

  const readableError = (message?: string) => {
    const lower = message?.toLowerCase() ?? "";
    if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) return "Masuk dengan Google belum diaktifkan di Supabase. Aktifkan provider Google terlebih dahulu.";
    if (lower.includes("email not confirmed")) return "Email ini belum terverifikasi. Buka email verifikasi Anda, atau kirim ulang di bawah ini.";
    if (lower.includes("invalid login credentials")) return "Email atau password belum tepat.";
    if (lower.includes("email rate limit")) return "Terlalu banyak permintaan email. Tunggu sebentar lalu coba lagi.";
    return message || "Terjadi kesalahan. Silakan coba lagi.";
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(readableError(err.message));
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess("Akun dibuat. Periksa inbox (termasuk Spam) untuk memverifikasi email sebelum masuk.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      setError(readableError(err.message));
    } finally {
      setEmailLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return setError("Masukkan alamat email terlebih dahulu.");
    setEmailLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (error) throw error;
      setSuccess("Email verifikasi baru sudah dikirim. Periksa inbox dan folder Spam.");
    } catch (err: any) {
      setError(readableError(err.message));
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <span className="text-display font-semibold text-2xl">ح</span>
            </div>
          </Link>
          <h1 className="text-display text-3xl font-semibold tracking-tight mb-2">
            {isSignUp ? "Buat Akun" : "Selamat Datang"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Daftar untuk memulai perjalanan" : "Masuk untuk melanjutkan ke Hayat"}
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-8 shadow-soft">
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-6 py-3.5 text-base font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Masuk dengan Google
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-12 py-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-600 dark:text-rose-400 space-y-2">
                {error}
                {error.includes("belum terverifikasi") && <button type="button" onClick={resendVerification} disabled={emailLoading} className="flex items-center gap-1.5 font-medium underline underline-offset-2 disabled:opacity-50"><Send className="h-3.5 w-3.5" />Kirim ulang email verifikasi</button>}
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Buat Akun" : "Masuk"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? "Masuk" : "Daftar sekarang"}
              </button>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Dengan {isSignUp ? "mendaftar" : "masuk"}, kamu menyetujui{" "}
              <a href="#" className="text-primary hover:underline">Syarat Penggunaan</a>
              {" "}dan{" "}
              <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
              kami.
            </p>
          </div>
        </div>

        {/* Back to landing */}
        <div className="mt-6 text-center">
          <Link
            href="/landing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Kembali ke beranda
          </Link>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-arabic text-xl text-primary/60 mb-2">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground/60">
            Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
