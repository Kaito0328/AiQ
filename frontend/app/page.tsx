"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { useAuth } from '@/src/shared/auth/useAuth';
import Image from 'next/image';

/**
 * ルート画面 (準備画面)
 * 旧環境 (frontend-old) の構成をデザインシステムで再現。
 * 無料デプロイ環境のコールドスタート対策として機能します。
 */
export default function LandingPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setReady(true);
    }
  }, [authLoading]);

  const handleStart = () => {
    if (ready) {
      router.push('/home');
    }
  };

  return (
    <View bg="base" className="min-h-screen flex items-center justify-center p-6">
      <Stack gap="xl" align="center" className="max-w-sm w-full">
        {/* ロゴとアプリ名 */}
        <Stack gap="md" align="center">
          <View
            className="relative w-24 h-24 overflow-hidden rounded-brand-lg"
            bg="muted"
          >
            <Image
              src="/logo_black.png"
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
          <Button
            size="lg"
            fullWidth
            loading={!ready}
            onClick={handleStart}
            className="py-6 text-lg"
          >
            はじめる
          </Button>
        </View>
      </Stack>
    </View>
  );
}
