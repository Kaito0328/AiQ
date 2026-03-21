"use client";

import React from "react";
import { Tabs, TabItem } from "@/src/design/baseComponents/Tabs";
import { Stack } from "@/src/design/primitives/Stack";
import { Grid } from "@/src/design/primitives/Grid";
import { Text } from "@/src/design/baseComponents/Text";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { View } from "@/src/design/primitives/View";
import { Flex } from "@/src/design/primitives/Flex";
import { CollectionCard } from "@/src/features/collections/components/CollectionCard";
import {
  useRecentCollections,
  useFolloweeCollections,
} from "@/src/features/collections/hooks/useCollections";
import { useAuth } from "@/src/shared/auth/useAuth";
import { AddToSetModal } from "@/src/features/collectionSets/components/AddToSetModal";
import { QuizOptionModal } from "@/src/features/quiz/components/QuizOptionModal";
import { QuizMode, FilterNode } from "@/src/entities/quiz";
import { startCasualQuiz } from "@/src/features/quiz/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, List, WifiOff } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { Button } from "@/src/design/baseComponents/Button";
import { db } from "@/src/shared/db/db";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";

interface TimelineListProps {
  type: "recent" | "following";
  onAddToSet: (id: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

function TimelineList({
  type,
  onAddToSet,
  viewMode,
  setViewMode,
}: TimelineListProps) {
  const { isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();
  const recent = useRecentCollections(type === "recent");
  const followee = useFolloweeCollections(
    isAuthenticated && type === "following",
  );

  const currentData = type === "following" ? followee : recent;
  const [cachedCollectionIds, setCachedCollectionIds] = useState<Set<string>>(
    new Set(),
  );
  const [showOfflineReadyOnly, setShowOfflineReadyOnly] = useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const checkCache = async () => {
      const ids = currentData.collections.map((c) => c.id);
      if (ids.length === 0) {
        if (!cancelled) setCachedCollectionIds(new Set());
        return;
      }

      const questions = await db.questions
        .where("collectionId")
        .anyOf(ids)
        .toArray();
      if (!cancelled) {
        setCachedCollectionIds(new Set(questions.map((q) => q.collectionId)));
      }
    };

    void checkCache();
    return () => {
      cancelled = true;
    };
  }, [currentData.collections]);

  const offlineUnavailableCount = currentData.collections.filter(
    (c) => !cachedCollectionIds.has(c.id),
  ).length;

  const displayedCollections =
    !isOnline && showOfflineReadyOnly
      ? currentData.collections.filter((c) => cachedCollectionIds.has(c.id))
      : currentData.collections;

  return (
    <Stack gap="md">
      {/* View Mode Toggle Bar */}
      <Flex justify="between" align="center" className="mb-2 flex-wrap gap-2">
        {!isOnline && (
          <Flex
            gap="xs"
            align="center"
            className="text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full"
          >
            <WifiOff size={12} />
            <Text variant="xs" weight="bold" className="text-amber-700">
              オフライン
            </Text>
          </Flex>
        )}
        <Flex
          gap="xs"
          align="center"
          className="bg-surface-muted/50 p-1 rounded-lg border border-surface-muted"
        >
          {!isOnline && offlineUnavailableCount > 0 && (
            <Button
              size="sm"
              variant={showOfflineReadyOnly ? "solid" : "outline"}
              color="primary"
              className="h-8 px-2 text-xs"
              onClick={() => setShowOfflineReadyOnly((prev) => !prev)}
            >
              {showOfflineReadyOnly ? "すべて表示" : "利用可能のみ"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-8 h-8 p-0 transition-all",
              viewMode === "grid"
                ? "bg-surface-base shadow-sm text-brand-primary"
                : "text-secondary",
            )}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-8 h-8 p-0 transition-all",
              viewMode === "list"
                ? "bg-surface-base shadow-sm text-brand-primary"
                : "text-secondary",
            )}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </Button>
        </Flex>
      </Flex>

      {currentData.loading ? (
        <View padding="xl">
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        </View>
      ) : currentData.error ? (
        <View className="bg-brand-danger/10" padding="xl" rounded="lg">
          <Text align="center" color="danger">
            エラー: {currentData.error}
          </Text>
        </View>
      ) : displayedCollections.length === 0 ? (
        <View padding="xl">
          <Text align="center" color="secondary">
            {!isOnline
              ? "オフラインで利用可能な投稿がありません"
              : "投稿がありません"}
          </Text>
        </View>
      ) : viewMode === "grid" ? (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="md" className="grid-cols-1">
          {displayedCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              displayMode="grid"
              onAddToSet={isAuthenticated ? onAddToSet : undefined}
              isInteractionDisabled={
                !isOnline && !cachedCollectionIds.has(collection.id)
              }
              disabledReason="このコレクションの問題は未キャッシュです。オンラインで開いて保存してください。"
            />
          ))}
        </Grid>
      ) : (
        <Stack gap="sm">
          {displayedCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              displayMode="list"
              onAddToSet={isAuthenticated ? onAddToSet : undefined}
              isInteractionDisabled={
                !isOnline && !cachedCollectionIds.has(collection.id)
              }
              disabledReason="このコレクションの問題は未キャッシュです。オンラインで開いて保存してください。"
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
export function TimelineTabs() {
  const router = useRouter(); // Note: kept for handleQuickPlay if needed, but we remove that. Keep for uniformity.
  const { isAuthenticated } = useAuth();
  const [collectionToAddToSet, setCollectionToAddToSet] = useState<
    string | null
  >(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const items: TabItem[] = [
    {
      id: "recent",
      label: "最新の投稿",
      content: (
        <TimelineList
          type="recent"
          onAddToSet={setCollectionToAddToSet}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ),
    },
  ];

  if (isAuthenticated) {
    items.unshift({
      id: "following",
      label: "フォロー中",
      content: (
        <TimelineList
          type="following"
          onAddToSet={setCollectionToAddToSet}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ),
    });
  }

  return (
    <Stack gap="lg" className="w-full">
      <Tabs
        items={items}
        defaultTab={isAuthenticated ? "following" : "recent"}
        fitted
      />

      {collectionToAddToSet && (
        <AddToSetModal
          collectionId={collectionToAddToSet}
          onClose={() => setCollectionToAddToSet(null)}
        />
      )}
    </Stack>
  );
}
