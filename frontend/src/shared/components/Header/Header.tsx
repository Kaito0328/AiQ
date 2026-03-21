"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/src/design/primitives/Container";
import { Flex } from "@/src/design/primitives/Flex";
import { View } from "@/src/design/primitives/View";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import {
  Menu,
  ArrowLeft,
  Volume2,
  VolumeX,
  LogOut,
  WifiOff,
  Wifi,
} from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { useAuth } from "@/src/shared/auth/useAuth";
import { usePathname } from "next/navigation";
import { useSafeRouter } from "@/src/shared/hooks/useSafeRouter";
import { cn } from "@/src/shared/utils/cn";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/src/shared/contexts/ThemeContext";
import { useAudio } from "@/src/shared/contexts/AudioContext";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/src/shared/db/db";

export function Header() {
  const router = useSafeRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const { isMuted, toggleMute } = useAudio();
  const { isOnline, isNetworkOnline, isManualOffline, setManualOffline } =
    useNetworkStatus();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const pendingCount =
    useLiveQuery(
      () => db.pendingActions.where("status").equals("pending").count(),
      [],
    ) || 0;
  // ... (rest unchanged in context but I'll replace the block)

  const isBattleRoom =
    pathname.startsWith("/battle/") && pathname !== "/battle/lobby";
  const isQuizStart = pathname === "/quiz/start";
  const isActuallyOffline = !isNetworkOnline;
  const isRuntimeOffline = isManualOffline || !isNetworkOnline;

  const isGameRoute =
    (pathname.startsWith("/quiz") &&
      pathname !== "/quiz/resume" &&
      !isQuizStart) ||
    pathname.includes("/ranking");

  const showBackButton =
    (pathname.startsWith("/collections/") &&
      pathname !== "/collections/search") ||
    pathname === "/settings";

  const [isBattlePlaying, setIsBattlePlaying] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for battle playing status via body attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-battle-playing"
        ) {
          setIsBattlePlaying(
            document.body.getAttribute("data-battle-playing") === "true",
          );
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    setIsBattlePlaying(
      document.body.getAttribute("data-battle-playing") === "true",
    );

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <View
        as="header"
        bg="card"
        className={cn(
          "sticky top-0 z-50 border-b-2 border-brand-primary/30 h-16 flex items-center shadow-sm backdrop-blur-md transition-all duration-500",
          isGameRoute || isBattlePlaying ? "hidden" : "flex",
          !isOnline && "grayscale-[0.3] opacity-95",
        )}
      >
        <Container className="relative h-full px-4">
          <div className="flex items-center justify-between h-full">
            {/* 左側: ハンバーガーメニュー または 戻るボタン */}
            <div className="z-10">
              {isBattleRoom ? (
                <Button
                  variant="ghost"
                  size="sm"
                  color="danger"
                  onClick={() => {
                    if (window.confirm("対戦ルームから退室しますか？")) {
                      router.push("/battle/lobby");
                    }
                  }}
                  className="p-2 h-auto hover:bg-brand-danger/10 transition-colors rounded-lg flex items-center justify-center gap-1 text-brand-danger"
                  title="退室する"
                >
                  <LogOut size={20} />
                  <Text variant="xs" weight="bold" color="danger">
                    退室
                  </Text>
                </Button>
              ) : showBackButton ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center gap-1 text-brand-primary"
                >
                  <ArrowLeft size={24} />
                  <Text
                    variant="xs"
                    weight="bold"
                    color="primary"
                    className="hidden sm:inline"
                  >
                    戻る
                  </Text>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center"
                >
                  <Menu size={24} className="text-foreground" />
                </Button>
              )}
            </div>

            {/* 中央: ロゴとタイトル */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
              <button
                onClick={() => router.push(isRuntimeOffline ? "/" : "/home")}
                className="flex items-center gap-2 group pointer-events-auto"
              >
                <View
                  as="img"
                  src={
                    mounted && theme === "dark"
                      ? "/logo_black.png"
                      : "/logo_white.png"
                  }
                  alt="AiQ Logo"
                  className="h-7 w-7 transition-transform group-hover:scale-110"
                />
                <Text
                  variant="h4"
                  weight="bold"
                  color="primary"
                  className="tracking-tight whitespace-nowrap"
                >
                  AiQ
                </Text>
              </button>
            </div>

            {/* 右側: オーディオ切替, オフライン切替, テーマ切替 */}
            <div className="z-10 flex items-center gap-1 sm:gap-2">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!isActuallyOffline) {
                      setManualOffline(!isManualOffline);
                    }
                  }}
                  disabled={isActuallyOffline}
                  className={cn(
                    "p-2 h-auto transition-colors rounded-lg flex items-center justify-center relative",
                    isManualOffline || isActuallyOffline
                      ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                      : "text-foreground hover:bg-surface-muted",
                    isActuallyOffline && "opacity-60 cursor-not-allowed",
                  )}
                  title={
                    isActuallyOffline
                      ? "ネットワークオフライン中"
                      : isManualOffline
                        ? "オンラインに戻る"
                        : "オフラインモードを試す"
                  }
                >
                  {isManualOffline || isActuallyOffline ? (
                    <WifiOff size={20} />
                  ) : (
                    <Wifi size={20} />
                  )}
                  {pendingCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold px-1 py-0.5 rounded-full flex items-center justify-center min-w-[17px] h-[17px] border-2 border-surface-base shadow-sm z-20">
                      <span className="leading-none">{pendingCount}</span>
                    </View>
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className={cn(
                  "p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center text-foreground",
                  !isOnline && "opacity-80",
                )}
                title={isMuted ? "音声を再生" : "音声をミュート"}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </View>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
