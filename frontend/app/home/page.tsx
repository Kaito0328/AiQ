"use client";

import React from 'react';
import { Container } from '@/src/design/primitives/Container';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Grid } from '@/src/design/primitives/Grid';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { useRecentCollections } from '@/src/features/collections/hooks/useCollections';
import { CollectionCard } from '@/src/features/collections/components/CollectionCard';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { useAuth } from '@/src/shared/auth/useAuth';
import Link from 'next/link';
import { NavCards } from '@/src/features/home/components/NavCards';
import { TimelineTabs } from '@/src/features/home/components/TimelineTabs';
import { ResumeQuizList } from '@/src/features/quiz/components/ResumeQuizList';
import { SectionHeader } from '@/src/shared/components/SectionHeader';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Newspaper, Swords, LogIn, Plus } from 'lucide-react';
import { BattleJoinModal } from '@/src/features/battle/components/BattleJoinModal';
import { useState } from 'react';
import { cn } from '@/src/shared/utils/cn';
import { useRouter } from 'next/navigation';
import { createMatchRoom } from '@/src/features/battle/api';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [showJoin, setShowJoin] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const handleCreateRoom = async () => {
    setCreatingRoom(true);
    try {
      const resp = await createMatchRoom({
        collectionIds: [],
        filterTypes: [],
        sortKeys: [],
        totalQuestions: 10,
        maxBuzzesPerRound: 2
      });
      router.push(`/battle/${resp.roomId}?token=${resp.joinToken}`);
    } catch (err) {
      console.error('Failed to create room', err);
      alert('ルームの作成に失敗しました');
    } finally {
      setCreatingRoom(false);
    }
  };

  return (
    <View className="min-h-screen bg-surface-muted py-12">
      <Container>
        <Stack gap="xl">
          {/* ナビゲーションカード */}
          <NavCards />

          {/* 対戦（バトル）セクション */}
          <Stack gap="lg" id="battle">
            <SectionHeader
              icon={Swords}
              title="リアルタイム対戦"
              description="友達や他のユーザーとクイズで競い合いましょう"
            />
            <Grid cols={{ sm: 1, md: 2 }} gap="md">
              <Card
                onClick={handleCreateRoom}
                bg="base"
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 border-2 border-brand-primary/10",
                  creatingRoom && "opacity-70 pointer-events-none"
                )}
              >
                <Stack gap="md" align="center" className="py-8">
                  <View bg="muted" className="p-4 rounded-brand-full text-brand-primary">
                    <Plus size={32} />
                  </View>
                  <Stack gap="xs" align="center">
                    <Text variant="h3" weight="bold">ルームを作成</Text>
                    <Text variant="xs" color="secondary" align="center">
                      ルームを新規作成して友達を招待します
                    </Text>
                  </Stack>
                  {creatingRoom && (
                    <Text variant="xs" color="primary" weight="bold" className="animate-pulse">
                      ルーム作成中...
                    </Text>
                  )}
                </Stack>
              </Card>

              <Card
                onClick={() => setShowJoin(true)}
                bg="base"
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 border-2 border-brand-secondary/20"
              >
                <Stack gap="md" align="center" className="py-8">
                  <View bg="muted" className="p-4 rounded-brand-full text-brand-secondary">
                    <LogIn size={32} />
                  </View>
                  <Stack gap="xs" align="center">
                    <Text variant="h3" weight="bold">ルームに参加</Text>
                    <Text variant="xs" color="secondary" align="center">
                      ルームIDを入力して既存のルームに参加します
                    </Text>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Stack>

          {/* クイズ再開リスト (もしあれば) */}
          <ResumeQuizList />

          {/* タイムライン */}
          <Stack gap="lg">
            <SectionHeader
              icon={Newspaper}
              title="タイムライン"
              description="コミュニティの活動をチェックしましょう"
            />
            <TimelineTabs />
          </Stack>
        </Stack>
      </Container>

      <BattleJoinModal isOpen={showJoin} onClose={() => setShowJoin(false)} />
    </View>
  );
}
