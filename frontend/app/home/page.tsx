"use client";

import React from "react";
import { Container } from "@/src/design/primitives/Container";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Grid } from "@/src/design/primitives/Grid";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { useRecentCollections } from "@/src/features/collections/hooks/useCollections";
import { CollectionCard } from "@/src/features/collections/components/CollectionCard";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { useAuth } from "@/src/shared/auth/useAuth";
import Link from "next/link";
import { NavCards } from "@/src/features/home/components/NavCards";
import { TimelineTabs } from "@/src/features/home/components/TimelineTabs";
import { ResumeQuizSummary } from "@/src/features/quiz/components/ResumeQuizSummary";
import { EditRequestNotification } from "@/src/features/home/components/EditRequestNotification";
import { SectionHeader } from "@/src/shared/components/SectionHeader";
import { View } from "@/src/design/primitives/View";
import { Flex } from "@/src/design/primitives/Flex";
import {
  Newspaper,
  LogIn,
  Plus,
  LayoutGrid,
  History,
  Users,
  Swords,
} from "lucide-react";
import { BattleJoinModal } from "@/src/features/battle/components/BattleJoinModal";
import { useState } from "react";
import { cn } from "@/src/shared/utils/cn";
import { useRouter } from "next/navigation";
import { createMatchRoom } from "@/src/features/battle/api";
import { MatchActionCard } from "@/src/features/battle/components/MatchActionCard";

import { Tabs, TabItem } from '@/src/design/baseComponents/Tabs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [showJoin, setShowJoin] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const currentTab = searchParams.get('tab') || 'dashboard';

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true);
    try {
      const resp = await createMatchRoom({
        collectionIds: [],
        filterTypes: [],
        sortKeys: [],
        totalQuestions: 10,
        maxBuzzesPerRound: 2,
        visibility: 'private'
      });
      router.push(`/battle/${resp.roomId}?token=${resp.joinToken}`);
    } catch (err) {
      console.error('Failed to create room', err);
      alert('ルームの作成に失敗しました');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const dashboardContent = (
    <Stack gap="xl">
      {!user && (
        <Card border="primary" bg="primary" className="bg-opacity-5">
          <Flex justify="between" align="center" gap="md" className="flex-wrap">
            <Stack gap="xs">
              <Text variant="detail" weight="bold" color="primary">ログインしてさらに楽しもう</Text>
              <Text variant="xs" color="secondary">
                クイズの作成、お気に入り登録、修正依頼の送信など、全ての機能が利用可能になります。
              </Text>
            </Stack>
            <Link href="/login">
              <Button variant="solid" color="primary" size="sm" className="gap-2">
                <LogIn size={18} />
                ログイン / 新規登録
              </Button>
            </Link>
          </Flex>
        </Card>
      )}
      <Stack gap="lg">
        <SectionHeader
          icon={LayoutGrid}
          title="クイックアクセス"
          description="クイズの作成や公式問題集の確認はこちらから"
        />
        <NavCards />
      </Stack>

      {user && (
        <Stack gap="lg">
          <SectionHeader
            icon={Newspaper}
            title="お知らせ"
            description="修正依頼の状況や運営からの通知を確認できます"
          />
          <EditRequestNotification />
        </Stack>
      )}

      {user && (
        <Stack gap="lg">
          <SectionHeader
            icon={History}
            title="最近のクイズ"
            description="中断したクイズの再開や最近アクセスした問題集"
          />
          <ResumeQuizSummary />
        </Stack>
      )}
    </Stack>
  );

  const battleContent = (
    <Stack gap="lg" id="battle">
      <SectionHeader
        icon={Users}
        title="リアルタイム対戦"
        description="友達や他のユーザーとクイズで競い合いましょう"
      />
      <Grid cols={{ sm: 1, md: 2 }} gap="md">
        <MatchActionCard
          title="ルームを作成"
          description={user ? "ルームを新規作成して友達を招待します" : "ログインが必要です"}
          icon={<Plus size={32} />}
          onClick={handleCreateRoom}
          isLoading={isCreatingRoom}
          disabled={!user}
        />

        <MatchActionCard
          title="ルームに参加"
          description="公開ルーム一覧から対戦に参加します"
          icon={<LogIn size={32} />}
          onClick={() => router.push('/battle/lobby')}
        />
      </Grid>
      <BattleJoinModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </Stack>
  );

  const timelineContent = (
    <Stack gap="lg">
      <SectionHeader
        icon={Newspaper}
        title="タイムライン"
        description="コミュニティの活動をチェックしましょう"
      />
      <TimelineTabs />
    </Stack>
  );

  const tabItems: TabItem[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <LayoutGrid size={18} />,
      content: dashboardContent
    },
    {
      id: 'timeline',
      label: 'タイムライン',
      icon: <History size={18} />,
      content: timelineContent
    },
    {
      id: 'battle',
      label: '対戦',
      icon: <Swords size={18} />,
      content: battleContent
    },
  ];

  return (
    <View className="min-h-screen bg-surface-muted pt-6 pb-24 sm:py-12">
      <Container>
        <Tabs
          items={tabItems}
          defaultTab={currentTab}
          fitted
          headerClassName="hidden sm:flex"
          // Update URL when tab changes to keep BottomNav in sync
          onChange={(tabId: string) => router.push(`/home?tab=${tabId}`)}
        />
      </Container>
    </View>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <View className="min-h-screen bg-surface-muted py-12 flex justify-center">
        <Spinner size="lg" />
      </View>
    }>
      <HomeContent />
    </Suspense>
  );
}
