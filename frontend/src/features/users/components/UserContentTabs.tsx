"use client";

import React from "react";
import { View } from "@/src/design/primitives/View";
import { Flex } from "@/src/design/primitives/Flex";
import { Stack } from "@/src/design/primitives/Stack";
import { Tabs, TabItem } from "@/src/design/baseComponents/Tabs";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Grid } from "@/src/design/primitives/Grid";
import {
  useUserCollections,
  useUserCollectionSets,
} from "@/src/features/collections/hooks/useCollections";
import { CollectionCard } from "@/src/features/collections/components/CollectionCard";
import { CollectionSetCard } from "@/src/features/collectionSets/components/CollectionSetCard";
import { db } from "@/src/shared/db/db";

interface UserContentTabsProps {
  userId: string;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onToggleCollection: (id: string, name: string, count?: number) => void;

  // Management props (Optional, for profile page)
  onDeleteCollection?: (id: string) => void;
  onEditCollection?: (id: string) => void;
  onStartRanking?: (id: string) => void;
  onAddToSet?: (id: string) => void;
  onDeleteSet?: (id: string) => void;
  onEditSet?: (id: string) => void;

  // Slots for extra actions (like "Create" buttons)
  collectionActions?: React.ReactNode;
  setActions?: React.ReactNode;
  initialTab?: "collections" | "sets";
  hideExtras?: boolean;
  displayMode?: "grid" | "list";
  hiddenCollectionIds?: string[];
}

export function UserContentTabs({
  userId,
  isSelectionMode = false,
  selectedIds = [],
  onToggleCollection,
  onDeleteCollection,
  onEditCollection,
  onStartRanking,
  onAddToSet,
  onDeleteSet,
  onEditSet,
  collectionActions,
  setActions,
  initialTab = "collections",
  hideExtras = false,
  displayMode = "list",
  hiddenCollectionIds = [],
}: UserContentTabsProps) {
  const {
    collections,
    loading: collectionsLoading,
    isOffline: isCollectionsOffline,
  } = useUserCollections(userId);
  const {
    collectionSets,
    loading: setsLoading,
    isOffline: isSetsOffline,
  } = useUserCollectionSets(userId);

  const [collectionsWithCachedQuestions, setCollectionsWithCachedQuestions] =
    React.useState<Set<string>>(new Set());
  const [isQuestionCacheCheckLoading, setIsQuestionCacheCheckLoading] =
    React.useState(false);
  const [showOfflineReadyOnly, setShowOfflineReadyOnly] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const checkQuestionCache = async () => {
      if (!isCollectionsOffline) {
        setCollectionsWithCachedQuestions(
          new Set(collections.map((c) => c.id)),
        );
        setIsQuestionCacheCheckLoading(false);
        return;
      }

      if (collections.length === 0) {
        setCollectionsWithCachedQuestions(new Set());
        setIsQuestionCacheCheckLoading(false);
        return;
      }

      setIsQuestionCacheCheckLoading(true);
      try {
        const ids = collections.map((c) => c.id);
        const cachedQuestions = await db.questions
          .where("collectionId")
          .anyOf(ids)
          .toArray();
        if (cancelled) return;
        setCollectionsWithCachedQuestions(
          new Set(cachedQuestions.map((q) => q.collectionId)),
        );
      } catch {
        if (!cancelled) {
          setCollectionsWithCachedQuestions(new Set());
        }
      } finally {
        if (!cancelled) {
          setIsQuestionCacheCheckLoading(false);
        }
      }
    };

    checkQuestionCache();
    return () => {
      cancelled = true;
    };
  }, [collections, isCollectionsOffline]);

  const offlineVisibleCollections =
    collections;

  const hiddenIdSet = React.useMemo(
    () => new Set(hiddenCollectionIds),
    [hiddenCollectionIds],
  );

  const visibleCollections = offlineVisibleCollections.filter(
    (c) => !hiddenIdSet.has(c.id),
  );

  const offlineReadyCollections = visibleCollections.filter((c) =>
    collectionsWithCachedQuestions.has(c.id),
  );

  const displayedCollections =
    isCollectionsOffline && showOfflineReadyOnly
      ? offlineReadyCollections
      : visibleCollections;

  const offlineUnavailableCount =
    isCollectionsOffline
      ? visibleCollections.filter(
          (c) => !collectionsWithCachedQuestions.has(c.id),
        ).length
      : 0;

  const items: TabItem[] = [
    {
      id: "collections",
      label: "コレクション",
      content: (
        <View padding="md">
          <Stack gap="lg">
            {(collectionActions || collections.length > 0) && (
              <Flex justify="between" align="center">
                <Flex gap="xs" align="center">
                  <Text variant="detail" color="secondary" weight="bold">
                    {displayedCollections.length} 個のコレクション
                  </Text>
                  {isCollectionsOffline && (
                    <Text
                      variant="xs"
                      color="secondary"
                      className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-bold"
                    >
                      Offline
                    </Text>
                  )}
                </Flex>
                <Flex gap="xs" align="center">
                  {isCollectionsOffline && (
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
                  {collectionActions}
                </Flex>
              </Flex>
            )}

            {isCollectionsOffline && offlineUnavailableCount > 0 && (
              <Text variant="xs" color="secondary">
                問題が未キャッシュの {offlineUnavailableCount} 件はオフライン中は開けません。
                {showOfflineReadyOnly
                  ? " 現在は利用可能なものだけ表示しています。"
                  : " 必要なら「利用可能のみ」で絞り込めます。"}
              </Text>
            )}

            {collectionsLoading || isQuestionCacheCheckLoading ? (
              <View padding="xl">
                <Flex justify="center">
                  <Spinner size="lg" />
                </Flex>
              </View>
            ) : displayedCollections.length === 0 ? (
              <View padding="xl">
                <Stack gap="sm" align="center">
                  <Text color="secondary" align="center" variant="xs">
                    {isCollectionsOffline
                      ? "オフラインで利用可能なコレクションがありません。"
                      : "コレクションがありません"}
                  </Text>
                  {isCollectionsOffline && (
                    <Text variant="xs" color="secondary" align="center">
                      問題詳細ページから「オフライン保存」すると、ここに表示されます。
                    </Text>
                  )}
                </Stack>
              </View>
            ) : displayMode === "list" ? (
              <Stack
                gap="none"
                className="border border-surface-muted/30 rounded-xl overflow-hidden bg-surface-muted/5"
              >
                {displayedCollections.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    isSelectionMode={isSelectionMode}
                    selected={selectedIds.includes(c.id)}
                    onSelect={onToggleCollection}
                    onDelete={onDeleteCollection}
                    onEdit={onEditCollection}
                    onStartRanking={onStartRanking}
                    onAddToSet={onAddToSet}
                    hideExtras={hideExtras}
                    displayMode="list"
                    isInteractionDisabled={
                      isCollectionsOffline &&
                      !collectionsWithCachedQuestions.has(c.id)
                    }
                    disabledReason="このコレクションの問題は未キャッシュです。オンライン時に詳細を開いて保存してください。"
                  />
                ))}
              </Stack>
            ) : (
              <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="lg">
                {displayedCollections.map((c) => (
                  <CollectionCard
                    key={c.id}
                    collection={c}
                    isSelectionMode={isSelectionMode}
                    selected={selectedIds.includes(c.id)}
                    onSelect={onToggleCollection}
                    onDelete={onDeleteCollection}
                    onEdit={onEditCollection}
                    onStartRanking={onStartRanking}
                    onAddToSet={onAddToSet}
                    hideExtras={hideExtras}
                    displayMode="grid"
                    isInteractionDisabled={
                      isCollectionsOffline &&
                      !collectionsWithCachedQuestions.has(c.id)
                    }
                    disabledReason="このコレクションの問題は未キャッシュです。オンライン時に詳細を開いて保存してください。"
                  />
                ))}
              </Grid>
            )}
          </Stack>
        </View>
      ),
    },
    {
      id: "sets",
      label: "セット",
      content: (
        <View padding="md">
          <Stack gap="lg">
            {(setActions || collectionSets.length > 0) && (
              <Flex justify="between" align="center">
                <Text variant="detail" color="secondary" weight="bold">
                  {collectionSets.length} 個のセット
                </Text>
                {setActions}
              </Flex>
            )}

            {setsLoading ? (
              <View padding="xl">
                <Flex justify="center">
                  <Spinner size="lg" />
                </Flex>
              </View>
            ) : collectionSets.length === 0 ? (
              <View padding="xl">
                <Text color="secondary" align="center" variant="xs">
                  セットがありません
                </Text>
              </View>
            ) : displayMode === "list" ? (
              <Stack gap="sm">
                {collectionSets.map((s) => (
                  <CollectionSetCard
                    key={s.id}
                    set={s}
                    isSelectionMode={isSelectionMode}
                    selectedCollectionIds={selectedIds}
                    onToggleCollection={onToggleCollection}
                    onDelete={onDeleteSet}
                    onEdit={onEditSet}
                  />
                ))}
              </Stack>
            ) : (
              <Grid cols={{ base: 1, md: 2, xl: 3 }} gap="lg">
                {collectionSets.map((s) => (
                  <CollectionSetCard
                    key={s.id}
                    set={s}
                    isSelectionMode={isSelectionMode}
                    selectedCollectionIds={selectedIds}
                    onToggleCollection={onToggleCollection}
                    onDelete={onDeleteSet}
                    onEdit={onEditSet}
                  />
                ))}
              </Grid>
            )}
          </Stack>
        </View>
      ),
    },
  ];

  return (
    <View>
      <Tabs items={items} defaultTab={initialTab} fitted variant="line" />
    </View>
  );
}
