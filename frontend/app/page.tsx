"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { useAuth } from '@/src/shared/auth/useAuth';
import Image from 'next/image';
import { useTheme } from '@/src/shared/contexts/ThemeContext';

/**
 * ルート画面 (準備画面)
 * 旧環境 (frontend-old) の構成をデザインシステムで再現。
 * 無料デプロイ環境のコールドスタート対策として機能します。
 */
export default function LandingPage() {
  const router = useRouter();
  const { loading: authLoading, isTechnicalError, refreshUser, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = async () => {
    if (isTechnicalError) {
      await refreshUser();
      return;
    }
    router.push('/home');
  };

  const isReady = !authLoading && !isTechnicalError;
  const showExplanatoryText = isTechnicalError || authLoading;

  return (
    <View bg="base" className="min-h-screen flex items-center justify-center p-6">
      <Stack gap="xl" align="center" className="max-w-sm w-full">
        {/* ロゴとアプリ名 */}
        <Stack gap="md" align="center">
          <View
            className="relative w-24 h-24 overflow-hidden rounded-brand-lg"
          >
            <Image
              src={mounted && theme === 'dark' ? "/logo_black.png" : "/logo_white.png"}
              alt="AiQ Logo"
              fill
              className="object-contain p-2"
            />
          </View>
          <Text variant="h1" weight="bold" color="primary" className="tracking-tight">
            AiQ
          </Text>
          <Text variant="body" color="secondary" className="text-center">
            あなた専用のクイズ学習アプリ。
          </Text>
        </Stack>

        <View className="w-full mt-8">
          <Stack gap="md">
            {showExplanatoryText && (
              <View className="p-3 bg-surface-muted/50 rounded-lg border border-surface-muted animate-in fade-in duration-500">
                <Text variant="xs" color="secondary" className="text-center leading-relaxed">
                  {authLoading 
                    ? "セッションを読み込んでいます..." 
                    : "サーバーを起動しています。これには数十秒かかる場合があります。"}
                </Text>
              </View>
            )}
            <Button
              size="lg"
              fullWidth
              loading={authLoading}
              onClick={handleStart}
              className="py-6 text-lg shadow-xl shadow-brand-primary/10"
              color={isTechnicalError ? "secondary" : "primary"}
              variant={isTechnicalError ? "outline" : "solid"}
            >
              {isTechnicalError ? "サーバーを準備して開始" : "はじめる"}
            </Button>
          </Stack>
        </View>

        {/* Footer */}
        <Stack gap="xs" align="center" className="mt-12 opacity-50">
          <Text variant="xs" color="secondary">
            © 2024 AiQ. All rights reserved.
          </Text>
          <Link href="/credits" className="hover:underline">
            <Text variant="xs" color="secondary" className="cursor-pointer">
              Credits & Licenses
            </Text>
          </Link>
        </Stack>
      </Stack>
    </View>
  );
}
