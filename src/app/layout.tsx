import type { Metadata } from "next";
import { Geist, Fraunces, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hayat — Sistem Operasi Islami",
  description:
    "Sistem operasi Islami yang tenang dan elegan untuk kehidupan sehari-hari. Lacak shalat, Al-Quran, kebiasaan, renungan, dan tujuan — semuanya dalam satu tempat.",
  keywords: [
    "Hayat",
    "Sistem Operasi Islami",
    "Dashboard Muslim",
    "Pelacak Shalat",
    "Pelacak Al-Quran",
    "Pelacak Kebiasaan",
    "Produktivitas Islami",
  ],
  authors: [{ name: "Hayat" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Hayat — Sistem Operasi Islami",
    description: "Sistem operasi Islami yang tenang dan elegan untuk kehidupan sehari-hari.",
    siteName: "Hayat",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${fraunces.variable} ${amiri.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <SonnerToaster position="bottom-right" richColors closeButton />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
