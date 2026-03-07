import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AiQ",
  description: "AiQ Web Engine",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AiQ",
  },
  icons: {
    icon: "/logo_black.png",
    apple: "/logo_black.png",
  },
  other: {
    google: "notranslate"
  }
};

import { ThemeProvider } from "@/src/shared/contexts/ThemeContext";
import { ToastProvider } from "@/src/shared/contexts/ToastContext";
import { AuthProvider } from "@/src/shared/auth/useAuth";
import { AudioProvider } from "@/src/shared/contexts/AudioContext";
import { Header } from "@/src/shared/components/Header/Header";

import { BottomNav } from "@/src/shared/components/Navigation/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" translate="no" className="notranslate">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <ToastProvider>
                <Header />
                <main className="pb-16 sm:pb-0">
                  {children}
                </main>
                <BottomNav />
              </ToastProvider>
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
