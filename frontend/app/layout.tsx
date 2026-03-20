import type { Metadata, Viewport } from "next";
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
    icon: [
      { url: "/logo_white.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo_black.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/logo_white.png", media: "(prefers-color-scheme: light)" },
      { url: "/logo_black.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
  other: {
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

import { ThemeProvider } from "@/src/shared/contexts/ThemeContext";
import { ToastProvider } from "@/src/shared/contexts/ToastContext";
import { AuthProvider } from "@/src/shared/auth/useAuth";
import { AudioProvider } from "@/src/shared/contexts/AudioContext";
import { Header } from "@/src/shared/components/Header/Header";
import { BottomNav } from "@/src/shared/components/Navigation/BottomNav";
import { NetworkStatusProvider } from "@/src/shared/contexts/NetworkStatusContext";
import { PwaUpdater } from "@/src/shared/components/Navigation/PwaUpdater";

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
          <NetworkStatusProvider>
            <AuthProvider>
              <AudioProvider>
                <ToastProvider>
                  <PwaUpdater />
                  <Header />
                  <main className="pb-16 sm:pb-0">{children}</main>
                  <BottomNav />
                </ToastProvider>
              </AudioProvider>
            </AuthProvider>
          </NetworkStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
